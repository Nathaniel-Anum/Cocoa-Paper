import { useState } from 'react';
import PropTypes from 'prop-types';
import { pdfjs } from 'react-pdf';
import { Modal } from 'antd';
import useStore from '../../store/store';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PDFViewer.css';
import PDFAnnotation from './PDFAnnotation';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewerContent = ({ pdfUrl, documentId, onPageChange, onZoom }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

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

  return (
    <div className="pdf-viewer-content">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <PDFAnnotation
            pdfUrl={pdfUrl}
            documentId={documentId}
            pageNumber={pageNumber}
            scale={scale}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onDocumentLoadError={onDocumentLoadError}
          />
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
                onClick={() => handleZoom(scale + 0.1)}
                disabled={scale >= 2}
                className="control-button"
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
      width={1000}
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
