import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { message } from 'antd';
import * as fabric from 'fabric';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { Document, Page } from 'react-pdf';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect, useCallback } from 'react';

import '../../utils/pdfjs-worker';
import StampTool from './StampTool';
import axiosInstance from '../axiosInstance';
import AnnotationToolbar from './AnnotationToolbar';
import { useUser } from '../../Pages/CustomHook/useUser';

import './PDFAnnotation.css';
import useStore from '../../store/store';
import logo from '../../assets/logo.9a18109e1c16584832d5.png';

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

  const [canvas, setCanvas] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [stampPosition, setStampPosition] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localAnnotations, setLocalAnnotations] = useState([]);
  const [stampToolVisible, setStampToolVisible] = useState(false);

  const showToolbar = useStore((state) => state.showToolbar);

  // Query to fetch annotations
  const { data: annotations } = useQuery({
    queryKey: ['annotations', documentId, pageNumber],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/annotations/document/${documentId}`
      );
      return response.data.data;
    },
    enabled: !!documentId && !!pageNumber,
  });

  // Initialize canvas when page is loaded
  useEffect(() => {
    let fabricCanvas = null;

    const initializeCanvas = () => {
      if (containerRef.current && !canvasRef.current) {
        const pdfPage = containerRef.current.querySelector('.react-pdf__Page');
        if (pdfPage) {
          try {
            const canvas = document.getElementById('annotation-canvas');
            if (!canvas) return;

            canvas.width = pdfPage.offsetWidth;
            canvas.height = pdfPage.offsetHeight;

            fabricCanvas = new fabric.Canvas(canvas, {
              isDrawingMode: selectedTool === 'pen',
              width: pdfPage.offsetWidth,
              height: pdfPage.offsetHeight,
              selection: false,
              preserveObjectStacking: true,
              backgroundColor: 'transparent',
            });

            canvasRef.current = fabricCanvas;

            // Initialize the pencil brush
            const pencilBrush = new fabric.PencilBrush(fabricCanvas);
            pencilBrush.width = 2;
            pencilBrush.color = penColor;
            fabricCanvas.freeDrawingBrush = pencilBrush;
            fabricCanvas.isDrawingMode = selectedTool === 'pen';

            setCanvas(fabricCanvas);
          } catch (error) {
            console.error('Error initializing canvas:', error);
          }
        }
      }
    };

    if (isPageLoaded) {
      setTimeout(initializeCanvas, 100);
    }

    // Update canvas size when window resizes
    const handleResize = () => {
      if (fabricCanvas && containerRef.current) {
        const pdfPage = containerRef.current.querySelector('.react-pdf__Page');
        if (pdfPage) {
          try {
            fabricCanvas.setWidth(pdfPage.offsetWidth);
            fabricCanvas.setHeight(pdfPage.offsetHeight);
            fabricCanvas.renderAll();
          } catch (error) {
            console.error('Error resizing canvas:', error);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (fabricCanvas) {
        try {
          fabricCanvas.dispose();
        } catch (error) {
          console.error('Error disposing canvas:', error);
        }
      }
      canvasRef.current = null;
      setCanvas(null);
    };
  }, [isPageLoaded]);

  // Update canvas when page or scale changes
  useEffect(() => {
    if (canvas && containerRef.current) {
      const pdfPage = containerRef.current.querySelector('.react-pdf__Page');
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
            if (obj.type === 'image') {
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
          console.error('Error updating canvas dimensions:', error);
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
        console.log('All annotations from backend:', annotations);
        if (annotations.length > 0) {
          console.log(
            'Annotation types:',
            annotations.map((a) => a.type).filter((b) => b === 'stamp')
          );
        }

        // Filter annotations for current page
        const pageAnnotations = annotations.filter(
          (ann) => ann.pageNumber === pageNumber
        );

        // Load each annotation
        pageAnnotations.forEach((annotation) => {
          if (annotation.type === 'draw') {
            // Recreate drawing path
            const pathData = annotation.annotationData;
            const path = new fabric.Path(pathData.path, {
              stroke: pathData.stroke,
              strokeWidth: pathData.strokeWidth,
              globalCompositeOperation: pathData.globalCompositeOperation,
              selectable: false,
              fill: null,
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
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
          } else if (annotation.type === 'stamp') {
            const data = annotation.annotationData;
            if (!data || !data.dataUrl) {
              console.error(
                'Stamp annotation missing data or dataUrl',
                annotation
              );
              return;
            }
            if (!data.dataUrl.startsWith('data:image/')) {
              console.error(
                'Stamp annotation has invalid dataUrl format:',
                data.dataUrl.substring(0, 100)
              );
              return;
            }
            if (
              typeof data.x !== 'number' ||
              typeof data.y !== 'number' ||
              typeof data.width !== 'number' ||
              typeof data.height !== 'number'
            ) {
              console.error(
                'Stamp annotation has invalid position/dimensions:',
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
                'Stamp annotation: Successfully added to canvas using native Image'
              );
            };
            imgElement.onerror = function (e) {
              console.error(
                'Failed to load image element for stamp annotation',
                e,
                data.dataUrl.substring(0, 100)
              );
            };
            imgElement.src = data.dataUrl;
          } else if (annotation.type === 'text') {
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
          } else if (annotation.type === 'audit') {
            // Render audit annotation (fabric.Text)
            const data = annotation.data || annotation.annotationData;
            if (!data || !['C', '7', 'T'].includes(data.text)) return;
            const text = new fabric.Text(data.text, {
              left: data.left,
              top: data.top,
              fontSize: data.fontSize || 16,
              fill: data.fill || 'red',
              fontFamily: data.fontFamily || 'Arial',
              angle: data.angle || 0,
              selectable: false,
              hasControls: false,
              hasBorders: false,
              lockRotation: true,
              lockScalingY: false,
              lockUniScaling: false,
              minWidth: 20,
              minHeight: 20,
            });
            canvas.add(text);
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
        message.error('Error loading annotations:', error);
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
      canvas.off('mouse:down', start);
      canvas.off('mouse:move', move);
      canvas.off('mouse:up', end);
      canvas.off('mouse:leave', end);
      eraserHandlersRef.current = null;
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    if (canvas) {
      try {
        cleanupEraserHandlers();
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
        if (tool === 'pen') {
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          if (
            !canvas.freeDrawingBrush ||
            !(canvas.freeDrawingBrush instanceof fabric.PencilBrush)
          ) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          }
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = penColor;
          canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
        } else if (tool === 'highlighter') {
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          const pencilBrush = new fabric.PencilBrush(canvas);
          pencilBrush.width = 10;
          pencilBrush.color = 'rgba(255, 255, 0, 0.3)';
          pencilBrush.globalCompositeOperation = 'multiply';
          canvas.freeDrawingBrush = pencilBrush;
        } else if (tool === 'select') {
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
          canvas.defaultCursor = 'default';
        } else if (tool === 'eraser') {
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

            const objectsToErase = objects.filter((obj) => {
              if (obj.type === 'path') {
                const path = obj.path;
                return path.some((point) => {
                  const distance = Math.sqrt(
                    Math.pow(point[1] - pointer.x, 2) +
                      Math.pow(point[2] - pointer.y, 2)
                  );
                  return distance < 10;
                });
              } else if (obj.type === 'image') {
                return (
                  pointer.x >= obj.left &&
                  pointer.x <= obj.left + obj.width * obj.scaleX &&
                  pointer.y >= obj.top &&
                  pointer.y <= obj.top + obj.height * obj.scaleY
                );
              } else if (
                obj.type === 'text' &&
                (obj.constructor.name === 'Text' ||
                  obj.class === '_Eo' ||
                  (obj.text &&
                    ['C', '7', 'T'].includes(obj.text) &&
                    obj.fill === 'red' &&
                    obj.fontFamily === 'Arial')) &&
                ['C', '7', 'T'].includes(obj.text) &&
                obj.fill === 'red' &&
                obj.fontFamily === 'Arial'
              ) {
                // For audit annotations, check bounding box
                return (
                  pointer.x >= obj.left &&
                  pointer.x <=
                    obj.left + (obj.width || 20) * (obj.scaleX || 1) &&
                  pointer.y >= obj.top &&
                  pointer.y <= obj.top + (obj.height || 20) * (obj.scaleY || 1)
                );
              }
              return false;
            });
            objectsToErase.forEach((obj) => {
              if (obj.annotationId) {
                setUndoStack((prev) => [
                  ...prev,
                  {
                    type: 'erase',
                    object: obj.toJSON([
                      'selectable',
                      'hasControls',
                      'hasBorders',
                      'annotationId',
                    ]),
                    annotationId: obj.annotationId,
                  },
                ]);
                canvas.remove(obj);
              }
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
          canvas.on('mouse:down', handleEraserStart);
          canvas.on('mouse:move', handleEraserMove);
          canvas.on('mouse:up', handleEraserEnd);
          canvas.on('mouse:leave', handleEraserEnd);
        }
        canvas.renderAll();
      } catch (error) {
        console.error('Error setting tool:', error);
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

        setUndoStack((prev) => [
          ...prev,
          {
            type: 'draw',
            object: path.toJSON(['selectable', 'hasControls', 'hasBorders']),
          },
        ]);
        setRedoStack([]);
      };

      canvas.on('path:created', handlePathCreated);
      return () => {
        canvas.off('path:created', handlePathCreated);
      };
    }
  }, [canvas]);

  // Update saveAnnotationMutation to handle erased annotations
  const saveAnnotationMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        if (formData.get('annotations')) {
          const response = await axiosInstance.post('/annotations', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response.data;
        }
      } catch (error) {
        console.error('Error saving annotations:', error);
        throw error;
      }
    },
  });

  const handleSave = async () => {
    if (!canvas) return;
    if (!user || !user.userId) {
      message.error('User ID is missing. Please log in again.');
      return;
    }
    try {
      setIsSaving(true);
      const objects = canvas.getObjects();

      const annotations = [
        ...objects
          .filter((obj) => obj.type === 'path')
          .map((obj) => ({
            type: 'draw',
            data: obj.toJSON(['selectable', 'hasControls', 'hasBorders']),
            pageNumber,
          })),
        ...objects
          .filter((obj) => obj.type === 'textbox')
          .map((obj) => ({
            type: 'text',
            data: obj.toJSON([
              'left',
              'top',
              'width',
              'height',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'fontWeight',
              'fontStyle',
              'underline',
              'linethrough',
              'textAlign',
              'angle',
              'scaleX',
              'scaleY',
              'selectable',
              'hasControls',
              'hasBorders',
            ]),
            pageNumber,
          })),
        ...objects
          .filter(
            (obj) =>
              obj.type === 'text' &&
              (obj.constructor.name === 'Text' ||
                obj.class === '_Eo' ||
                (obj.text &&
                  ['C', '7', 'T'].includes(obj.text) &&
                  obj.fill === 'red' &&
                  obj.fontFamily === 'Arial')) &&
              ['C', '7', 'T'].includes(obj.text) &&
              obj.fill === 'red' &&
              obj.fontFamily === 'Arial'
          )
          .map((obj) => ({
            type: 'audit',
            data: obj.toJSON([
              'left',
              'top',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'angle',
              'selectable',
              'hasControls',
              'hasBorders',
              'lockRotation',
              'lockScalingY',
              'lockUniScaling',
              'minWidth',
              'minHeight',
            ]),
            pageNumber,
          })),
        ...localAnnotations,
      ];

      const canvasDataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 4,
      });

      const formData = new FormData();
      formData.append('annotations', JSON.stringify(annotations));
      formData.append('pageNumber', pageNumber);
      formData.append('documentId', documentId);
      formData.append('pageImage', canvasDataUrl);
      formData.append('scale', scale);
      formData.append('userId', user.userId);

      await saveAnnotationMutation.mutateAsync(formData);
      message.success('Annotations saved and embedded in PDF successfully');
      setLocalAnnotations([]);
    } catch (error) {
      message.error('Failed to save annotations');
    } finally {
      setIsSaving(false);
    }
  };

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
      const savedErasedAnnotations = loadErasedAnnotations(pageNumber);

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
    if (lastAction.type === 'erase') {
      // Restore erased object
      fabric.util.enlivenObjects([lastAction.object], ([restoredObject]) => {
        if (restoredObject) {
          restoredObject.annotationId = lastAction.annotationId;
          canvas.add(restoredObject);
          canvas.renderAll();
          setRedoStack((prev) => [
            ...prev,
            {
              type: 'erase',
              object: restoredObject.toJSON([
                'selectable',
                'hasControls',
                'hasBorders',
                'annotationId',
              ]),
              annotationId: restoredObject.annotationId,
            },
          ]);
        }
      });
    } else if (
      lastAction.type === 'draw' ||
      lastAction.type === 'text' ||
      lastAction.type === 'audit'
    ) {
      // Remove the last drawn object
      const objects = canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject) {
        setRedoStack((prev) => [
          ...prev,
          {
            type: lastAction.type,
            object: lastObject.toJSON([
              'selectable',
              'hasControls',
              'hasBorders',
              'annotationId',
              'left',
              'top',
              'width',
              'height',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'fontWeight',
              'fontStyle',
              'underline',
              'linethrough',
              'textAlign',
              'angle',
              'scaleX',
              'scaleY',
              'lockRotation',
              'lockScalingY',
              'lockUniScaling',
              'minWidth',
              'minHeight',
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

    if (
      lastAction.type === 'draw' ||
      lastAction.type === 'text' ||
      lastAction.type === 'audit'
    ) {
      fabric.util.enlivenObjects([lastAction.object], ([restoredObject]) => {
        if (restoredObject) {
          // Restore all properties and annotationId
          Object.keys(lastAction.object).forEach((key) => {
            if (key !== 'type' && key !== 'version') {
              restoredObject[key] = lastAction.object[key];
            }
          });
          canvas.add(restoredObject);
          canvas.renderAll();
          setUndoStack((prev) => [
            ...prev,
            {
              type: lastAction.type,
              object: restoredObject.toJSON([
                'selectable',
                'hasControls',
                'hasBorders',
                'annotationId',
                'left',
                'top',
                'width',
                'height',
                'fontSize',
                'fill',
                'text',
                'fontFamily',
                'fontWeight',
                'fontStyle',
                'underline',
                'linethrough',
                'textAlign',
                'angle',
                'scaleX',
                'scaleY',
                'lockRotation',
                'lockScalingY',
                'lockUniScaling',
                'minWidth',
                'minHeight',
              ]),
            },
          ]);
        }
      });
    } else if (lastAction.type === 'erase') {
      // Redo of an undo-erase means re-erasing (removing) the object again
      const objects = canvas.getObjects();
      const objectToErase = objects.find(
        (obj) => obj.annotationId === lastAction.annotationId
      );
      if (objectToErase) {
        canvas.remove(objectToErase);
        canvas.renderAll();
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'erase',
            object: objectToErase.toJSON([
              'selectable',
              'hasControls',
              'hasBorders',
              'annotationId',
            ]),
            annotationId: objectToErase.annotationId,
          },
        ]);
      }
    }
  };

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    if (canvas) {
      const handleKeyDown = (e) => {
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo(e);
          } else {
            handleUndo(e);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [canvas, undoStack, redoStack]);

  useEffect(() => {
    if (canvas && canvas.wrapperEl) {
      canvas.wrapperEl.setAttribute('data-tool', selectedTool);
      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = penColor;
        canvas.freeDrawingBrush.width = 2;
      }
    }
  }, [canvas, selectedTool, penColor]);

  // Update pen color when it changes
  useEffect(() => {
    if (canvas && selectedTool === 'pen') {
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
      message.error('Document ID is missing.');
      return;
    }
    setIsDownloading(true);
    try {
      // Download the annotated PDF as before
      const canvasDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 4,
      });
      const formData = new FormData();
      formData.append('pageImage', canvasDataUrl);
      const response = await axiosInstance.post(
        `/annotations/document/${documentId}/apply`,
        formData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const annotatedPdfBlob = new Blob([response.data], {
        type: 'application/pdf',
      });

      // Fetch comments for the document
      let comments = [];
      const commentsRes = await axiosInstance.get(`/document/${documentId}`);
      const docData = commentsRes?.data?.document;

      console.log({ docData, commentsRes });
      if (docData && Array.isArray(docData.comments)) {
        comments = docData.comments;
      }

      // Generate a PDF from comments using jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgWidth = 300;
      const imgHeight = 300;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = (pageHeight - imgHeight) / 2;
      const watermarkOpacity = 0.15;
      const addLogoWatermark = () => {
        doc.setGState(new doc.GState({ opacity: watermarkOpacity }));
        doc.addImage(logo, 'PNG', imgX, imgY, imgWidth, imgHeight);
        doc.setGState(new doc.GState({ opacity: 1 }));
      };
      addLogoWatermark();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Document Comments', 10, 15);
      let y = 25;
      if (comments.length === 0) {
        doc.setFontSize(12);
        doc.text('No comments available.', 10, y);
      } else {
        comments.forEach((comment, idx) => {
          if (!comment.isPrivate) {
            const user = comment.user?.name || 'Unknown User';
            const date = comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : '';
            const body = comment.body || '';
            doc.setFontSize(12);
            doc.text(`${idx + 1}. ${user} (${date})`, 10, y);
            y += 7;
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(body, 180);
            doc.text(lines, 15, y);
            y += lines.length * 6 + 4;
            if (y > 270) {
              doc.addPage();
              addLogoWatermark();
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              y = 20;
            }
          }
        });
      }
      const commentsPdfBlob = doc.output('blob');

      // Zip the annotated PDF and comments PDF using JSZip
      const zip = new JSZip();
      zip.file(`annotated-${documentId}.pdf`, annotatedPdfBlob);
      zip.file(`comments-${documentId}.pdf`, commentsPdfBlob);
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Trigger download of the zip
      saveAs(zipBlob, `${docData.file?.fileName}-with-comments.zip`);
      message.success(
        'Annotated PDF and comments downloaded as zip successfully'
      );
    } catch (error) {
      message.error('Failed to download annotated PDF and comments as zip');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle placing a stamp on canvas click (new process)
  useEffect(() => {
    if (!canvas) return;
    const handleCanvasClick = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      if (selectedTool === 'cast') {
        const text = new fabric.Text('C', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: 'red',
          fontFamily: 'Arial',
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingY: false,
          lockUniScaling: false,
          minWidth: 20,
          minHeight: 20,
        });
        canvas.add(text);
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'audit',
            object: text.toJSON([
              'left',
              'top',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'angle',
              'selectable',
              'hasControls',
              'hasBorders',
              'lockRotation',
              'lockScalingY',
              'lockUniScaling',
              'minWidth',
              'minHeight',
            ]),
          },
        ]);
        setRedoStack([]);
        canvas.renderAll();
      } else if (selectedTool === 'tick') {
        const text = new fabric.Text('7', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: 'red',
          fontFamily: 'Arial',
          angle: -20,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingY: false,
          lockUniScaling: false,
          minWidth: 20,
          minHeight: 20,
        });
        canvas.add(text);
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'audit',
            object: text.toJSON([
              'left',
              'top',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'angle',
              'selectable',
              'hasControls',
              'hasBorders',
              'lockRotation',
              'lockScalingY',
              'lockUniScaling',
              'minWidth',
              'minHeight',
            ]),
          },
        ]);
        setRedoStack([]);
        canvas.renderAll();
      } else if (selectedTool === 'trace') {
        const text = new fabric.Text('T', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 28,
          fill: 'red',
          fontFamily: 'Arial',
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingY: false,
          lockUniScaling: false,
          minWidth: 20,
          minHeight: 20,
        });
        canvas.add(text);
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'audit',
            object: text.toJSON([
              'left',
              'top',
              'fontSize',
              'fill',
              'text',
              'fontFamily',
              'angle',
              'selectable',
              'hasControls',
              'hasBorders',
              'lockRotation',
              'lockScalingY',
              'lockUniScaling',
              'minWidth',
              'minHeight',
            ]),
          },
        ]);
        setRedoStack([]);
        canvas.renderAll();
      } else if (selectedTool === 'stamp') {
        setStampPosition({ x: pointer.x, y: pointer.y, pageNumber });
        setStampToolVisible(true);
      } else if (selectedTool === 'text') {
        // Only create a textbox if there is not already one being edited
        const editingTextbox = canvas
          .getObjects()
          .find((obj) => obj.type === 'textbox' && obj.isEditing);
        if (!editingTextbox) {
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
          setUndoStack((prev) => [
            ...prev,
            {
              type: 'text',
              object: textbox.toJSON([
                'left',
                'top',
                'width',
                'height',
                'fontSize',
                'fill',
                'text',
                'fontFamily',
                'fontWeight',
                'fontStyle',
                'underline',
                'linethrough',
                'textAlign',
                'angle',
                'scaleX',
                'scaleY',
                'selectable',
                'hasControls',
                'hasBorders',
              ]),
            },
          ]);
          setRedoStack([]);
          canvas.setActiveObject(textbox);
          textbox.enterEditing && textbox.enterEditing();
          canvas.renderAll();
          setSelectedTool('');
        }
      }
    };
    canvas.on('mouse:down', handleCanvasClick);
    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvas, selectedTool, penColor, pageNumber]);

  // Handle annotation from StampTool
  const handleStampAnnotation = (annotation) => {
    if (annotation && annotation.type === 'stamp') {
      setLocalAnnotations((prev) => [...prev, annotation]);
      if (canvas) {
        const data = annotation.data;
        if (!data || !data.dataUrl) {
          console.error('Stamp annotation missing data or dataUrl', annotation);
          return;
        }
        if (!data.dataUrl.startsWith('data:image/')) {
          console.error(
            'Stamp annotation has invalid dataUrl format:',
            data.dataUrl.substring(0, 100)
          );
          return;
        }
        if (
          typeof data.x !== 'number' ||
          typeof data.y !== 'number' ||
          typeof data.width !== 'number' ||
          typeof data.height !== 'number'
        ) {
          console.error(
            'Stamp annotation has invalid position/dimensions:',
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
            'Stamp annotation: Successfully added to canvas using native Image'
          );
        };
        imgElement.onerror = function (e) {
          message.error(
            'Failed to load image element for stamp annotation' + e,
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
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'auto',
          }}
        />
      </div>

      {showToolbar && (
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
      )}

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
