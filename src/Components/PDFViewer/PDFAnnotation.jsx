import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Document, Page, pdfjs } from 'react-pdf';
import { Canvas, Image, PencilBrush, Path, util } from 'fabric';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import AnnotationToolbar from './AnnotationToolbar';
import SignaturePad from 'react-signature-canvas';
import './PDFAnnotation.css';
import 'fabric';

const PDFAnnotation = ({
  pdfUrl,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  documentId,
}) => {
  const [selectedTool, setSelectedTool] = useState('pen');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [canvas, setCanvas] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const eraserHandlersRef = useRef(null);
  const [erasedAnnotations, setErasedAnnotations] = useState([]);
  const queryClient = useQueryClient();

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
            fabricCanvas = new Canvas('annotation-canvas', {
              isDrawingMode: true,
              width: pdfPage.offsetWidth,
              height: pdfPage.offsetHeight,
              selection: false,
              preserveObjectStacking: true,
            });

            canvasRef.current = fabricCanvas;

            // Initialize the pencil brush
            const pencilBrush = new PencilBrush(fabricCanvas);
            pencilBrush.width = 2;
            pencilBrush.color = '#000000';
            fabricCanvas.freeDrawingBrush = pencilBrush;
            fabricCanvas.isDrawingMode = true;

            setCanvas(fabricCanvas);
          } catch (error) {
            console.error('Error initializing canvas:', error);
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

        // Filter annotations for current page
        const pageAnnotations = annotations.filter(
          (ann) => ann.pageNumber === pageNumber
        );

        // Load each annotation
        pageAnnotations.forEach((annotation) => {
          if (annotation.type === 'draw') {
            // Recreate drawing path
            const pathData = annotation.annotationData;
            const path = new Path(pathData.path, {
              stroke: pathData.stroke,
              strokeWidth: pathData.strokeWidth,
              globalCompositeOperation: pathData.globalCompositeOperation,
              selectable: false,
              fill: null, // Ensure no fill
              strokeLineCap: 'round', // Add rounded line caps
              strokeLineJoin: 'round', // Add rounded line joins
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
          } else if (annotation.type === 'signature') {
            // Recreate signature image
            const sigData = annotation.annotationData;
            Image.fromURL(sigData.dataUrl, (img) => {
              img.set({
                left: sigData.x,
                top: sigData.y,
                scaleX: sigData.width / img.width,
                scaleY: sigData.height / img.height,
                angle: sigData.angle,
                selectable: true,
                hasControls: true,
                hasBorders: true,
              });
              canvas.add(img);
            });
          }
        });

        canvas.renderAll();
      } catch (error) {
        console.error('Error loading annotations:', error);
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
        // Clean up any existing eraser handlers
        cleanupEraserHandlers();

        if (tool === 'select') {
          // Enable selection mode
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
        } else if (tool === 'signature') {
          setShowSignaturePad(true);
          canvas.defaultCursor = 'crosshair';
        } else if (tool === 'eraser') {
          // Enable eraser mode
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.hasControls = false;
            obj.hasBorders = false;
          });
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

            // Find objects that intersect with the eraser path
            const objectsToErase = objects.filter((obj) => {
              if (obj.type === 'path') {
                const path = obj.path;
                return path.some((point) => {
                  const distance = Math.sqrt(
                    Math.pow(point[1] - pointer.x, 2) +
                      Math.pow(point[2] - pointer.y, 2)
                  );
                  return distance < 10; // Eraser radius of 10 pixels
                });
              }
              return false;
            });

            // Store erased objects for database update and undo stack
            objectsToErase.forEach((obj) => {
              if (obj.annotationId) {
                setErasedAnnotations((prev) => [...prev, obj.annotationId]);
              }
              // Store the object in the undo stack before removing it
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
            });
            canvas.renderAll();
          };

          const handleEraserEnd = () => {
            isErasing = false;
          };

          // Store handlers in ref for cleanup
          eraserHandlersRef.current = {
            start: handleEraserStart,
            move: handleEraserMove,
            end: handleEraserEnd,
          };

          canvas.on('mouse:down', handleEraserStart);
          canvas.on('mouse:move', handleEraserMove);
          canvas.on('mouse:up', handleEraserEnd);
          canvas.on('mouse:leave', handleEraserEnd);
        } else {
          // Drawing tools (pen and highlighter)
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.hasControls = false;
            obj.hasBorders = false;
          });
          canvas.defaultCursor = 'crosshair';

          // Create a new brush for each tool
          const pencilBrush = new PencilBrush(canvas);

          if (tool === 'highlighter') {
            pencilBrush.width = 10;
            pencilBrush.color = 'rgba(255, 255, 0, 0.3)';
            pencilBrush.globalCompositeOperation = 'multiply';
          } else if (tool === 'pen') {
            pencilBrush.width = 2;
            pencilBrush.color = '#000000';
            pencilBrush.globalCompositeOperation = 'source-over';
          }

          canvas.freeDrawingBrush = pencilBrush;
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

        // Store the path in the undo stack
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'draw',
            object: path.toJSON([
              'selectable',
              'hasControls',
              'hasBorders',
              'annotationId',
            ]),
          },
        ]);
        setRedoStack([]); // Clear redo stack when new action is performed
      };

      canvas.on('path:created', handlePathCreated);
      return () => {
        canvas.off('path:created', handlePathCreated);
      };
    }
  }, [canvas]);

  const handleSignatureSave = (signatureData) => {
    if (canvas) {
      try {
        // Create fabric image directly from data URL
        Image.fromURL(
          signatureData,
          (img) => {
            // Set initial position and size
            img.set({
              left: canvas.width / 4,
              top: canvas.height / 4,
              scaleX: 0.5,
              scaleY: 0.5,
              selectable: true,
              hasControls: true,
              hasBorders: true,
              lockRotation: false,
              lockScalingX: false,
              lockScalingY: false,
              lockMovementX: false,
              lockMovementY: false,
            });

            // Add to canvas
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          },
          { crossOrigin: 'anonymous' }
        );
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
    setShowSignaturePad(false);
  };

  const handleSignatureClear = () => {
    setShowSignaturePad(false);
  };

  // Update saveAnnotationMutation to handle erased annotations
  const saveAnnotationMutation = useMutation({
    mutationFn: async (annotations) => {
      try {
        // First, delete erased annotations
        if (erasedAnnotations.length > 0) {
          await Promise.all(
            erasedAnnotations.map((id) =>
              axiosInstance.delete(`/annotations/${id}`)
            )
          );
          setErasedAnnotations([]); // Clear erased annotations after successful deletion
        }

        // Then save new annotations
        if (annotations.length > 0) {
          const response = await axiosInstance.post('/annotations', {
            documentId,
            annotations,
          });
          return response.data;
        }
      } catch (error) {
        console.error('Error saving annotations:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['annotations', documentId]);
    },
  });

  const handleSave = async () => {
    if (!canvas) return;

    try {
      const objects = canvas.getObjects();
      const annotations = objects.map((obj) => {
        const baseAnnotation = {
          type: obj.type === 'path' ? 'draw' : 'signature',
          data: obj.toJSON(['selectable', 'hasControls', 'hasBorders']),
          pageNumber,
        };

        // If the object has an existing annotation ID, include it
        if (obj.annotationId) {
          baseAnnotation.id = obj.annotationId;
        }

        return baseAnnotation;
      });

      await saveAnnotationMutation.mutateAsync(annotations);
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  // Add a function to save erased annotations to localStorage
  const saveErasedAnnotations = useCallback(
    (pageNum, annotations) => {
      const key = `erased_annotations_${documentId}_page_${pageNum}`;
      localStorage.setItem(key, JSON.stringify(annotations));
    },
    [documentId]
  );

  // Add a function to load erased annotations from localStorage
  const loadErasedAnnotations = useCallback(
    (pageNum) => {
      const key = `erased_annotations_${documentId}_page_${pageNum}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
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

  // Update the handleErase function
  const handleErase = useCallback(
    (e) => {
      if (!canvas || selectedTool !== 'eraser') return;

      const pointer = canvas.getPointer(e.e);
      const objects = canvas.getObjects();

      objects.forEach((obj) => {
        if (obj.containsPoint(pointer)) {
          // Add to erased annotations
          setErasedAnnotations((prev) => {
            const newErased = [...prev, obj.annotationId];
            // Save to localStorage
            saveErasedAnnotations(pageNumber, newErased);
            return newErased;
          });

          // Add to undo stack
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
          canvas.renderAll();
        }
      });
    },
    [canvas, selectedTool, pageNumber, saveErasedAnnotations]
  );

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
      util.enlivenObjects([lastAction.object], ([restoredObject]) => {
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
    } else if (lastAction.type === 'draw') {
      // Remove the last drawn object
      const objects = canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject) {
        setRedoStack((prev) => [
          ...prev,
          {
            type: 'draw',
            object: lastObject.toJSON([
              'selectable',
              'hasControls',
              'hasBorders',
              'annotationId',
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

    if (lastAction.type === 'draw') {
      util.enlivenObjects([lastAction.object], ([restoredObject]) => {
        if (restoredObject) {
          restoredObject.selectable = false;
          restoredObject.hasControls = false;
          restoredObject.hasBorders = false;
          canvas.add(restoredObject);
          canvas.renderAll();
          // Add the restored object back to the undo stack
          setUndoStack((prev) => [
            ...prev,
            {
              type: 'draw',
              object: restoredObject.toJSON([
                'selectable',
                'hasControls',
                'hasBorders',
                'annotationId',
              ]),
            },
          ]);
        }
      });
    } else if (lastAction.type === 'erase') {
      // Find the object to erase
      const objects = canvas.getObjects();
      const objectToErase = objects.find(
        (obj) => obj.annotationId === lastAction.annotationId
      );

      if (objectToErase) {
        // Add to erased annotations and update localStorage
        setErasedAnnotations((prev) => {
          const newErased = [...prev, objectToErase.annotationId];
          saveErasedAnnotations(pageNumber, newErased);
          return newErased;
        });
        // Remove from canvas
        canvas.remove(objectToErase);
        canvas.renderAll();
        // Add back to undo stack
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
    }
  }, [canvas, selectedTool]);

  // Clean up eraser handlers when component unmounts
  useEffect(() => {
    return () => {
      cleanupEraserHandlers();
    };
  }, []);

  const saveCanvasState = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject) {
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'draw',
            object: lastObject.toJSON([
              'selectable',
              'hasControls',
              'hasBorders',
              'annotationId',
            ]),
          },
        ]);
        setRedoStack([]); // Clear redo stack when new action is performed
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
        <canvas id="annotation-canvas" />
      </div>
      <AnnotationToolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onUndo={(e) => handleUndo(e)}
        onRedo={(e) => handleRedo(e)}
        onSave={handleSave}
        onClear={handleSignatureClear}
      />
      {showSignaturePad && (
        <div className="signature-pad-modal">
          <div className="signature-pad-content">
            <SignaturePad
              onSave={handleSignatureSave}
              onClear={handleSignatureClear}
            />
          </div>
        </div>
      )}
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
