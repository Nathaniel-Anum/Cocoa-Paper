import { message } from "antd";
import * as fabric from "fabric";
import PropTypes from "prop-types";
import { saveAs } from "file-saver";
import { Document, Page } from "react-pdf";
import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

import "../../utils/pdfjs-worker";
import StampTool from "./StampTool";
import axiosInstance from "../axiosInstance";
import AnnotationToolbar from "./AnnotationToolbar";
import { useUser } from "../../Pages/CustomHook/useUser";

import "./PDFAnnotation.css";

const PDFAnnotation = ({
  pdfUrl,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  documentId,
}) => {
  const { user } = useUser();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const eraserHandlersRef = useRef(null);

  const queryClient = useQueryClient();

  const [canvas, setCanvas] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [selectedTool, setSelectedTool] = useState("pen");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [stampPosition, setStampPosition] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localAnnotations, setLocalAnnotations] = useState([]);
  const [erasedAnnotations, setErasedAnnotations] = useState([]);
  const [stampToolVisible, setStampToolVisible] = useState(false);

  // Query to fetch annotations
  const { data: annotations } = useQuery({
    queryKey: ["annotations", documentId, pageNumber],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/annotations/document/${documentId}`
      );
      return response.data.data;
    },
    enabled: !!documentId && !!pageNumber,
  });

  console.log(
    annotations?.length > 0
      ? "Annotations fetched successfully"
      : "No annotations found"
  );

  // Initialize canvas when page is loaded
  useEffect(() => {
    let fabricCanvas = null;

    const initializeCanvas = () => {
      if (containerRef.current && !canvasRef.current) {
        const pdfPage = containerRef.current.querySelector(".react-pdf__Page");
        if (pdfPage) {
          try {
            const canvas = document.getElementById("annotation-canvas");
            if (!canvas) return;

            canvas.width = pdfPage.offsetWidth;
            canvas.height = pdfPage.offsetHeight;

            fabricCanvas = new fabric.Canvas(canvas, {
              isDrawingMode: selectedTool === "pen",
              width: pdfPage.offsetWidth,
              height: pdfPage.offsetHeight,
              selection: false,
              preserveObjectStacking: true,
              backgroundColor: "transparent",
            });

            canvasRef.current = fabricCanvas;

            // Initialize the pencil brush
            const pencilBrush = new fabric.PencilBrush(fabricCanvas);
            pencilBrush.width = 2;
            pencilBrush.color = penColor;
            fabricCanvas.freeDrawingBrush = pencilBrush;
            fabricCanvas.isDrawingMode = selectedTool === "pen";

            setCanvas(fabricCanvas);
          } catch (error) {
            console.error("Error initializing canvas:", error);
          }
        }
      }
    };

    if (isPageLoaded) {
      // Small delay to ensure PDF page is fully rendered
      setTimeout(initializeCanvas, 100);
    }

    // Update canvas size when window resizes
    const handleResize = () => {
      if (fabricCanvas && containerRef.current) {
        const pdfPage = containerRef.current.querySelector(".react-pdf__Page");
        if (pdfPage) {
          try {
            fabricCanvas.setWidth(pdfPage.offsetWidth);
            fabricCanvas.setHeight(pdfPage.offsetHeight);
            fabricCanvas.renderAll();
          } catch (error) {
            console.error("Error resizing canvas:", error);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (fabricCanvas) {
        try {
          fabricCanvas.dispose();
        } catch (error) {
          console.error("Error disposing canvas:", error);
        }
      }
      canvasRef.current = null;
      setCanvas(null);
    };
  }, [isPageLoaded]);

  // Update canvas when page or scale changes
  useEffect(() => {
    if (canvas && containerRef.current) {
      const pdfPage = containerRef.current.querySelector(".react-pdf__Page");
      if (pdfPage) {
        try {
          const oldWidth = canvas.width;
          const oldHeight = canvas.height;
          const newWidth = pdfPage.offsetWidth;
          const newHeight = pdfPage.offsetHeight;

          // Update canvas dimensions
          canvas.setWidth(newWidth);
          canvas.setHeight(newHeight);

          // Scale and reposition objects
          canvas.getObjects().forEach((obj) => {
            if (obj.type === "image") {
              // Scale signature position and size
              const scaleX = newWidth / oldWidth;
              const scaleY = newHeight / oldHeight;

              obj.set({
                left: obj.left * scaleX,
                top: obj.top * scaleY,
                scaleX: obj.scaleX * scaleX,
                scaleY: obj.scaleY * scaleY,
              });
            }
          });

          canvas.renderAll();
        } catch (error) {
          console.error("Error updating canvas dimensions:", error);
        }
      }
    }
  }, [pageNumber, scale, canvas]);

  // Load saved annotations when they are fetched
  useEffect(() => {
    if (canvas && annotations) {
      try {
        // Clear existing annotations
        canvas.clear();

        // Log all annotations for debugging
        console.log("All annotations from backend:", annotations);
        if (annotations.length > 0) {
          console.log(
            "Annotation types:",
            annotations.map((a) => a.type).filter((b) => b === "stamp")
          );
        }

        // Filter annotations for current page
        const pageAnnotations = annotations.filter(
          (ann) => ann.pageNumber === pageNumber
        );

        // Load each annotation
        pageAnnotations.forEach((annotation) => {
          if (annotation.type === "draw") {
            // Recreate drawing path
            const pathData = annotation.annotationData;
            const path = new fabric.Path(pathData.path, {
              stroke: pathData.stroke,
              strokeWidth: pathData.strokeWidth,
              globalCompositeOperation: pathData.globalCompositeOperation,
              selectable: false,
              fill: null,
              strokeLineCap: "round",
              strokeLineJoin: "round",
              strokeMiterLimit: 10,
              perPixelTargetFind: true,
              hasControls: false,
              hasBorders: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true,
              lockUniScaling: true,
              excludeFromExport: false,
              evented: false,
            });
            canvas.add(path);
          } else if (annotation.type === "stamp") {
            const data = annotation.annotationData;
            if (!data || !data.dataUrl) {
              console.error(
                "Stamp annotation missing data or dataUrl",
                annotation
              );
              return;
            }
            if (!data.dataUrl.startsWith("data:image/")) {
              console.error(
                "Stamp annotation has invalid dataUrl format:",
                data.dataUrl.substring(0, 100)
              );
              return;
            }
            if (
              typeof data.x !== "number" ||
              typeof data.y !== "number" ||
              typeof data.width !== "number" ||
              typeof data.height !== "number"
            ) {
              console.error(
                "Stamp annotation has invalid position/dimensions:",
                data
              );
              return;
            }
            // Use native Image and fabric.Image constructor
            const imgElement = new window.Image();
            imgElement.onload = function () {
              const scaleX = data.width / imgElement.naturalWidth;
              const scaleY = data.height / imgElement.naturalHeight;
              const imgInstance = new fabric.Image(imgElement, {
                left: data.x,
                top: data.y,
                scaleX,
                scaleY,
                selectable: false,
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                annotationId: annotation.id,
              });
              canvas.add(imgInstance);
              canvas.renderAll();
              console.log(
                "Stamp annotation: Successfully added to canvas using native Image"
              );
            };
            imgElement.onerror = function (e) {
              console.error(
                "Failed to load image element for stamp annotation",
                e,
                data.dataUrl.substring(0, 100)
              );
            };
            imgElement.src = data.dataUrl;
          } else if (annotation.type === "text") {
            const data = annotation.data || annotation.annotationData;
            const textbox = new fabric.Textbox(data.text || '', {
              left: data.left,
              top: data.top,
              width: data.width,
              height: data.height,
              fontSize: data.fontSize || 18,
              fill: data.fill || '#000',
              fontFamily: data.fontFamily || 'Times New Roman',
              fontWeight: data.fontWeight || 'normal',
              fontStyle: data.fontStyle || 'normal',
              underline: data.underline || false,
              linethrough: data.linethrough || false,
              textAlign: data.textAlign || 'left',
              angle: data.angle || 0,
              scaleX: data.scaleX || 1,
              scaleY: data.scaleY || 1,
              selectable: false,
              hasControls: false,
              hasBorders: false,
              lockRotation: true,
              lockScalingY: false,
              lockUniScaling: false,
              minWidth: 50,
              minHeight: 20,
            });
            canvas.add(textbox);
          }
        });

        // Force canvas render after all annotations are processed
        setTimeout(() => {
          canvas.renderAll();
          console.log(
            `Canvas render complete. Total objects: ${
              canvas.getObjects().length
            }`
          );
        }, 100);
      } catch (error) {
        console.error("Error loading annotations:", error);
      }
    }
  }, [canvas, annotations, pageNumber]);

  const handlePageLoadSuccess = () => {
    setIsPageLoaded(true);
  };

  // Clean up eraser event listeners
  const cleanupEraserHandlers = () => {
    if (canvas && eraserHandlersRef.current) {
      const { start, move, end } = eraserHandlersRef.current;
      canvas.off("mouse:down", start);
      canvas.off("mouse:move", move);
      canvas.off("mouse:up", end);
      canvas.off("mouse:leave", end);
      eraserHandlersRef.current = null;
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    if (canvas) {
      try {
        cleanupEraserHandlers();
        // Reset all objects to locked state by default
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
          obj.lockRotation = true;
          obj.lockScalingX = true;
          obj.lockScalingY = true;
          obj.lockUniScaling = true;
        });
        if (tool === "pen") {
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.defaultCursor = "crosshair";
          if (
            !canvas.freeDrawingBrush ||
            !(canvas.freeDrawingBrush instanceof fabric.PencilBrush)
          ) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          }
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = penColor;
          canvas.freeDrawingBrush.globalCompositeOperation = "source-over";
        } else if (tool === "highlighter") {
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.defaultCursor = "crosshair";
          const pencilBrush = new fabric.PencilBrush(canvas);
          pencilBrush.width = 10;
          pencilBrush.color = "rgba(255, 255, 0, 0.3)";
          pencilBrush.globalCompositeOperation = "multiply";
          canvas.freeDrawingBrush = pencilBrush;
        } else if (tool === "select") {
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.forEachObject((obj) => {
            obj.selectable = true;
            obj.hasControls = true;
            obj.hasBorders = true;
            obj.lockMovementX = false;
            obj.lockMovementY = false;
            obj.lockRotation = false;
            obj.lockScalingX = false;
            obj.lockScalingY = false;
            obj.lockUniScaling = false;
          });
          canvas.defaultCursor = "default";
        } else if (tool === "eraser") {
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor =
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><path d='M6 18L18 6M6 6l12 12'/></svg>\") 12 12, auto";
          let isErasing = false;
          const handleEraserStart = (e) => {
            isErasing = true;
            handleEraserMove(e);
          };
          const handleEraserMove = (e) => {
            if (!isErasing) return;
            const pointer = canvas.getPointer(e.e);
            const objects = canvas.getObjects();
            // Find objects that intersect with the eraser path (paths or images)
            const objectsToErase = objects.filter((obj) => {
              if (obj.type === "path") {
                const path = obj.path;
                return path.some((point) => {
                  const distance = Math.sqrt(
                    Math.pow(point[1] - pointer.x, 2) +
                      Math.pow(point[2] - pointer.y, 2)
                  );
                  return distance < 10;
                });
              } else if (obj.type === "image") {
                // For images (signatures), check bounding box
                return (
                  pointer.x >= obj.left &&
                  pointer.x <= obj.left + obj.width * obj.scaleX &&
                  pointer.y >= obj.top &&
                  pointer.y <= obj.top + obj.height * obj.scaleY
                );
              }
              return false;
            });
            objectsToErase.forEach((obj) => {
              if (obj.annotationId) {
                setErasedAnnotations((prev) => [...prev, obj.annotationId]);
              }
              setUndoStack((prev) => [
                ...prev,
                {
                  type: "erase",
                  object: obj.toJSON([
                    "selectable",
                    "hasControls",
                    "hasBorders",
                    "annotationId",
                  ]),
                  annotationId: obj.annotationId,
                },
              ]);
              canvas.remove(obj);
            });
            canvas.renderAll();
          };
          const handleEraserEnd = () => {
            isErasing = false;
          };
          eraserHandlersRef.current = {
            start: handleEraserStart,
            move: handleEraserMove,
            end: handleEraserEnd,
          };
          canvas.on("mouse:down", handleEraserStart);
          canvas.on("mouse:move", handleEraserMove);
          canvas.on("mouse:up", handleEraserEnd);
          canvas.on("mouse:leave", handleEraserEnd);
        }
        canvas.renderAll();
      } catch (error) {
        console.error("Error setting tool:", error);
      }
    }
  };

  // Add canvas event listeners for drawing
  useEffect(() => {
    if (canvas) {
      const handlePathCreated = (e) => {
        const path = e.path;
        path.selectable = false;
        path.hasControls = false;
        path.hasBorders = false;

        // Store the path in the undo stack
        setUndoStack((prev) => [
          ...prev,
          {
            type: "draw",
            object: path.toJSON(["selectable", "hasControls", "hasBorders"]),
          },
        ]);
        setRedoStack([]); // Clear redo stack when new action is performed
      };

      canvas.on("path:created", handlePathCreated);
      return () => {
        canvas.off("path:created", handlePathCreated);
      };
    }
  }, [canvas]);

  // Update saveAnnotationMutation to handle erased annotations
  const saveAnnotationMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        // Backend will handle deletion of erased annotations
        if (formData.get("annotations")) {
          const response = await axiosInstance.post("/annotations", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data;
        }
      } catch (error) {
        console.error("Error saving annotations:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["annotations", documentId]);
      setErasedAnnotations([]); // Clear erased annotations after successful save
    },
  });

  const handleSave = async () => {
    if (!canvas) return;
    if (!user || !user.userId) {
      message.error("User ID is missing. Please log in again.");
      return;
    }
    try {
      setIsSaving(true);
      // Get canvas objects
      const objects = canvas.getObjects();
      // Prepare annotations data
      const annotations = [
        ...objects
          .filter((obj) => obj.type === "path")
          .map((obj) => ({
            type: "draw",
            data: obj.toJSON(["selectable", "hasControls", "hasBorders"]),
            pageNumber,
          })),
        ...objects
          .filter((obj) => obj.type === "textbox")
          .map((obj) => ({
            type: "text",
            data: obj.toJSON(["left", "top", "width", "height", "fontSize", "fill", "text", "fontFamily", "fontWeight", "fontStyle", "underline", "linethrough", "textAlign", "angle", "scaleX", "scaleY", "selectable", "hasControls", "hasBorders"]),
            pageNumber,
          })),
        ...localAnnotations,
      ];

      const canvasDataUrl = canvas.toDataURL({
        format: "png",
        quality: 1,
      });

      // Create form data
      const formData = new FormData();
      formData.append("annotations", JSON.stringify(annotations));
      formData.append("pageNumber", pageNumber);
      formData.append("documentId", documentId);
      formData.append("pageImage", canvasDataUrl);
      formData.append("scale", scale);
      formData.append("userId", user.userId);
      formData.append("erasedAnnotationIds", JSON.stringify(erasedAnnotations));
      // Send to backend for PDF modification
      await saveAnnotationMutation.mutateAsync(formData);
      message.success("Annotations saved and embedded in PDF successfully");
      setLocalAnnotations([]); // Clear local stamp annotations after save
    } catch (error) {
      console.error("Error saving annotations:", error);
      message.error("Failed to save annotations");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a function to save erased annotations to localStorage with timestamp
  const saveErasedAnnotations = useCallback(
    (pageNum, annotations) => {
      const key = `erased_annotations_${documentId}_page_${pageNum}`;
      const data = {
        annotations,
        timestamp: new Date().getTime(),
        documentId,
        pageNumber: pageNum,
      };
      localStorage.setItem(key, JSON.stringify(data));

      // Also save to global erased annotations
      const globalKey = `erased_annotations_${documentId}`;
      const existingGlobal = localStorage.getItem(globalKey);
      const globalData = existingGlobal ? JSON.parse(existingGlobal) : {};
      globalData[pageNum] = data;
      localStorage.setItem(globalKey, JSON.stringify(globalData));
    },
    [documentId]
  );

  // Add a function to load erased annotations from localStorage
  const loadErasedAnnotations = useCallback(
    (pageNum) => {
      // Try loading from global storage first
      const globalKey = `erased_annotations_${documentId}`;
      const globalData = localStorage.getItem(globalKey);
      if (globalData) {
        const parsed = JSON.parse(globalData);
        if (parsed[pageNum] && parsed[pageNum].annotations) {
          return parsed[pageNum].annotations;
        }
      }

      // Fallback to page-specific storage
      const key = `erased_annotations_${documentId}_page_${pageNum}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.annotations || [];
      }
      return [];
    },
    [documentId]
  );

  // Update the useEffect for page changes
  useEffect(() => {
    if (canvas) {
      // Load erased annotations for the current page
      const savedErasedAnnotations = loadErasedAnnotations(pageNumber);
      setErasedAnnotations(savedErasedAnnotations);

      // Remove any objects that were previously erased
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if (savedErasedAnnotations.includes(obj.annotationId)) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    }
  }, [canvas, pageNumber, loadErasedAnnotations]);

  // Update the handleUndo function
  const handleUndo = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    if (lastAction.type === "erase") {
      // Restore erased object
      fabric.util.enlivenObjects([lastAction.object], ([restoredObject]) => {
        if (restoredObject) {
          restoredObject.annotationId = lastAction.annotationId;
          canvas.add(restoredObject);
          canvas.renderAll();
        }
      });
      // Remove from erased annotations and update localStorage
      setErasedAnnotations((prev) => {
        const newErased = prev.filter((id) => id !== lastAction.annotationId);
        saveErasedAnnotations(pageNumber, newErased);
        return newErased;
      });
    } else if (lastAction.type === "draw") {
      // Remove the last drawn object
      const objects = canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject) {
        setRedoStack((prev) => [
          ...prev,
          {
            type: "draw",
            object: lastObject.toJSON([
              "selectable",
              "hasControls",
              "hasBorders",
              "annotationId",
            ]),
          },
        ]);
        canvas.remove(lastObject);
        canvas.renderAll();
      }
    } else if (lastAction.type === "text") {
      // Remove the last drawn textbox
      const objects = canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject) {
        setRedoStack((prev) => [
          ...prev,
          {
            type: "text",
            object: lastObject.toJSON([
              "left",
              "top",
              "width",
              "height",
              "fontSize",
              "fill",
              "text",
              "fontFamily",
              "fontWeight",
              "fontStyle",
              "underline",
              "linethrough",
              "textAlign",
              "angle",
              "scaleX",
              "scaleY",
              "selectable",
              "hasControls",
              "hasBorders",
            ]),
          },
        ]);
        canvas.remove(lastObject);
        canvas.renderAll();
      }
    }
  };

  // Update the handleRedo function
  const handleRedo = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (redoStack.length === 0) return;
    const lastAction = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    if (lastAction.type === "draw" || lastAction.type === "signature") {
      fabric.util.enlivenObjects([lastAction.object], ([restoredObject]) => {
        if (restoredObject) {
          if (lastAction.type === "signature") {
            restoredObject.selectable = true;
            restoredObject.hasControls = true;
            restoredObject.hasBorders = true;
          } else {
            restoredObject.selectable = false;
            restoredObject.hasControls = false;
            restoredObject.hasBorders = false;
          }
          canvas.add(restoredObject);
          canvas.renderAll();
          setUndoStack((prev) => [
            ...prev,
            {
              type: lastAction.type,
              object: restoredObject.toJSON([
                "selectable",
                "hasControls",
                "hasBorders",
                "annotationId",
              ]),
            },
          ]);
        }
      });
    } else if (lastAction.type === "erase") {
      const objects = canvas.getObjects();
      const objectToErase = objects.find(
        (obj) => obj.annotationId === lastAction.annotationId
      );
      if (objectToErase) {
        setErasedAnnotations((prev) => {
          const newErased = [...prev, objectToErase.annotationId];
          saveErasedAnnotations(pageNumber, newErased);
          return newErased;
        });
        canvas.remove(objectToErase);
        canvas.renderAll();
        setUndoStack((prev) => [
          ...prev,
          {
            type: "erase",
            object: objectToErase.toJSON([
              "selectable",
              "hasControls",
              "hasBorders",
              "annotationId",
            ]),
            annotationId: objectToErase.annotationId,
          },
        ]);
      }
    } else if (lastAction.type === "text") {
      // Restore the last drawn textbox
      const textbox = new fabric.Textbox(lastAction.object.text || '', {
        left: lastAction.object.left,
        top: lastAction.object.top,
        width: lastAction.object.width,
        height: lastAction.object.height,
        fontSize: lastAction.object.fontSize || 18,
        fill: lastAction.object.fill || '#000',
        fontFamily: lastAction.object.fontFamily || 'Times New Roman',
        fontWeight: lastAction.object.fontWeight || 'normal',
        fontStyle: lastAction.object.fontStyle || 'normal',
        underline: lastAction.object.underline || false,
        linethrough: lastAction.object.linethrough || false,
        textAlign: lastAction.object.textAlign || 'left',
        angle: lastAction.object.angle || 0,
        scaleX: lastAction.object.scaleX || 1,
        scaleY: lastAction.object.scaleY || 1,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingY: false,
        lockUniScaling: false,
        minWidth: 50,
        minHeight: 20,
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      textbox.enterEditing && textbox.enterEditing();
      canvas.renderAll();
    }
  };

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    if (canvas) {
      const handleKeyDown = (e) => {
        if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo(e);
          } else {
            handleUndo(e);
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [canvas, undoStack, redoStack]);

  useEffect(() => {
    if (canvas && canvas.wrapperEl) {
      canvas.wrapperEl.setAttribute("data-tool", selectedTool);
      if (selectedTool === "pen") {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = penColor;
        canvas.freeDrawingBrush.width = 2;
      }
    }
  }, [canvas, selectedTool, penColor]);

  // Update pen color when it changes
  useEffect(() => {
    if (canvas && selectedTool === "pen") {
      const pencilBrush = new fabric.PencilBrush(canvas);
      pencilBrush.width = 2;
      pencilBrush.color = penColor;
      canvas.freeDrawingBrush = pencilBrush;
    }
  }, [canvas, penColor, selectedTool]);

  // Clean up eraser handlers when component unmounts
  useEffect(() => {
    return () => {
      cleanupEraserHandlers();
    };
  }, []);

  const handleDownload = async () => {
    if (!documentId) {
      message.error("Document ID is missing.");
      return;
    }
    setIsDownloading(true);
    try {
      // 1. Download the annotated PDF as before
      const canvasDataUrl = canvas.toDataURL({
        format: "png",
        quality: 1,
      });
      const formData = new FormData();
      formData.append("pageImage", canvasDataUrl);
      const response = await axiosInstance.post(
        `/annotations/document/${documentId}/apply`,
        formData,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const annotatedPdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      // 2. Fetch comments for the document
      let comments = [];
      const commentsRes = await axiosInstance.get(`/document/${documentId}`);
      const docData = commentsRes?.data?.document;

      console.log({ docData, commentsRes });
      if (docData && Array.isArray(docData.comments)) {
        comments = docData.comments;
      }

      // 3. Generate a PDF from comments using jsPDF
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Document Comments", 10, 15);
      let y = 25;
      if (comments.length === 0) {
        doc.setFontSize(12);
        doc.text("No comments available.", 10, y);
      } else {
        comments.forEach((comment, idx) => {
          if (!comment.isPrivate) {
            const user = comment.user?.name || "Unknown User";
            const date = comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : "";
            const body = comment.body || "";
            doc.setFontSize(12);
            doc.text(`${idx + 1}. ${user} (${date})`, 10, y);
            y += 7;
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(body, 180);
            doc.text(lines, 15, y);
            y += lines.length * 6 + 4;
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
          }
        });
      }
      const commentsPdfBlob = doc.output("blob");

      // 4. Zip the annotated PDF and comments PDF using JSZip
      const zip = new JSZip();
      zip.file(`annotated-${documentId}.pdf`, annotatedPdfBlob);
      zip.file(`comments-${documentId}.pdf`, commentsPdfBlob);
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // 5. Trigger download of the zip
      saveAs(zipBlob, `${docData.file?.fileName}-with-comments.zip`);
      message.success(
        "Annotated PDF and comments downloaded as zip successfully"
      );
    } catch (error) {
      message.error("Failed to download annotated PDF and comments as zip");
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle placing a stamp on canvas click (new process)
  useEffect(() => {
    if (!canvas) return;
    const handleCanvasClick = (opt) => {
      if (selectedTool === "stamp") {
        const pointer = canvas.getPointer(opt.e);
        setStampPosition({ x: pointer.x, y: pointer.y, pageNumber });
        setStampToolVisible(true);
      } else if (selectedTool === "text") {
        const pointer = canvas.getPointer(opt.e);
        // Create a new Fabric.Textbox
        const textbox = new fabric.Textbox('Enter text', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 18,
          fill: penColor,
          width: 150,
          editable: true,
          hasControls: true,
          hasBorders: true,
          selectable: true,
          lockRotation: true,
          lockScalingY: false,
          lockUniScaling: false,
          minWidth: 50,
          minHeight: 20,
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        textbox.enterEditing && textbox.enterEditing();
        canvas.renderAll();
      }
    };
    if (selectedTool === "stamp" || selectedTool === "text") {
      canvas.on("mouse:down", handleCanvasClick);
    }
    return () => {
      canvas.off("mouse:down", handleCanvasClick);
    };
  }, [canvas, selectedTool, pageNumber, penColor]);

  // Handle annotation from StampTool
  const handleStampAnnotation = (annotation) => {
    if (annotation && annotation.type === "stamp") {
      setLocalAnnotations((prev) => [...prev, annotation]);
      if (canvas) {
        const data = annotation.data;
        if (!data || !data.dataUrl) {
          console.error("Stamp annotation missing data or dataUrl", annotation);
          return;
        }
        if (!data.dataUrl.startsWith("data:image/")) {
          console.error(
            "Stamp annotation has invalid dataUrl format:",
            data.dataUrl.substring(0, 100)
          );
          return;
        }
        if (
          typeof data.x !== "number" ||
          typeof data.y !== "number" ||
          typeof data.width !== "number" ||
          typeof data.height !== "number"
        ) {
          console.error(
            "Stamp annotation has invalid position/dimensions:",
            data
          );
          return;
        }
        // Use native Image and fabric.Image constructor
        const imgElement = new window.Image();
        imgElement.onload = function () {
          const scaleX = data.width / imgElement.naturalWidth;
          const scaleY = data.height / imgElement.naturalHeight;
          const imgInstance = new fabric.Image(imgElement, {
            left: data.x,
            top: data.y,
            scaleX,
            scaleY,
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockUniScaling: true,
          });
          canvas.add(imgInstance);
          canvas.renderAll();
          console.log(
            "Stamp annotation: Successfully added to canvas using native Image"
          );
        };
        imgElement.onerror = function (e) {
          message.error(
            "Failed to load image element for stamp annotation" + e,
            data.dataUrl.substring(0, 100)
          );
        };
        imgElement.src = data.dataUrl;
      }
    }
  };

  return (
    <div className="pdf-annotation-container" ref={containerRef}>
      <div className="pdf-container">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="loading">Loading PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page"
            onLoadSuccess={handlePageLoadSuccess}
          />
        </Document>
      </div>
      <div className="annotation-canvas-container">
        <canvas
          id="annotation-canvas"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "auto",
          }}
        />
      </div>
      <AnnotationToolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onDownload={handleDownload}
        currentColor={penColor}
        onColorChange={setPenColor}
        isSaving={isSaving}
        isDownloading={isDownloading}
      />
      {/* StampTool modal for uploading and inserting a stamp */}
      <StampTool
        visible={stampToolVisible}
        position={stampPosition}
        onClose={() => setStampToolVisible(false)}
        onStampAnnotation={handleStampAnnotation}
      />
    </div>
  );
};

PDFAnnotation.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  pageNumber: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  onDocumentLoadSuccess: PropTypes.func.isRequired,
  onDocumentLoadError: PropTypes.func.isRequired,
  documentId: PropTypes.string.isRequired,
};

export default PDFAnnotation;
