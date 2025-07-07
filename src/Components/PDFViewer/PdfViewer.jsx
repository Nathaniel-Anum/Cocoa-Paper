import { Modal } from 'antd';
import { useState } from 'react';
import PropTypes from 'prop-types';

import useStore from '../../store/store';

// Import CSS
import './PDFViewer.css';
import 'react-pdf/dist/cjs/Page/TextLayer.css';
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';

// Import configured pdfjs
import '../../utils/pdfjs-worker';
import PDFAnnotation from './PDFAnnotation';

// Set up PDF.js worker source

import { useRef } from 'react';
const PDFViewerContent = ({ pdfUrl, documentId, onPageChange, onZoom }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  // Store canvases for each page
  const pageCanvases = useRef({});

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    if (onPageChange) {
      onPageChange(1);
    }
  };

  const onDocumentLoadError = (error) => {
    setError('Error loading PDF. Please try again.');
    console.error('Error loading PDF:', error);
  };

  const changePage = (offset) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
      if (onPageChange) {
        onPageChange(newPageNumber);
      }
    }
  };

  const handleZoom = (newScale) => {
    setScale(newScale);
    if (onZoom) {
      onZoom(newScale);
    }
  };

  // Register canvas for a page
  const registerCanvas = (page, canvas) => {
    if (canvas) {
      pageCanvases.current[page] = canvas;
    }
  };

  return (
    <div className="pdf-viewer-content">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Render all pages' annotation canvases, only show the current page */}
          {Array.from({ length: numPages || 1 }, (_, idx) => {
            const pg = idx + 1;
            return (
              <div
                key={pg}
                style={pg === pageNumber
                  ? { position: 'relative', zIndex: 1 }
                  : { position: 'absolute', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden' }}
              >
                <PDFAnnotation
                  scale={scale}
                  pdfUrl={pdfUrl}
                  documentId={documentId}
                  pageNumber={pg}
                  onDocumentLoadError={onDocumentLoadError}
                  onDocumentLoadSuccess={pg === 1 ? onDocumentLoadSuccess : undefined}
                  registerCanvas={registerCanvas}
                  getAllPageCanvases={() => pageCanvases.current}
                  numPages={numPages}
                />
              </div>
            );
          })}
          <div className="pdf-controls">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="control-button"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages || '--'}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
              className="control-button"
            >
              Next
            </button>
            <div className="zoom-controls">
              <button
                onClick={() => handleZoom(scale - 0.1)}
                disabled={scale <= 0.5}
                className="control-button"
              >
                -
              </button>
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
              <button
                disabled={scale >= 2}
                className="control-button"
                onClick={() => handleZoom(scale + 0.1)}
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

PDFViewerContent.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  documentId: PropTypes.string.isRequired,
  onPageChange: PropTypes.func,
  onZoom: PropTypes.func,
};

const PDFViewer = ({ pdfUrl, documentId, onPageChange, onZoom }) => {
  const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);
  const openFileViewer = useStore((state) => state.openFileViewer);

  return (
    <Modal
      title="Document Viewer"
      open={openFileViewer}
      onCancel={() => setOpenFileViewer()}
      footer={null}
      width={700}
      className="!top-9"
    >
      <PDFViewerContent
        pdfUrl={pdfUrl}
        documentId={documentId}
        onPageChange={onPageChange}
        onZoom={onZoom}
      />
    </Modal>
  );
};

PDFViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  documentId: PropTypes.string.isRequired,
  onPageChange: PropTypes.func,
  onZoom: PropTypes.func,
};

export { PDFViewerContent };
export default PDFViewer;
