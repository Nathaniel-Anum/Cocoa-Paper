import { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import mammoth from 'mammoth';
import PropTypes from 'prop-types';

import './DocumentViewers.css';

const WordViewer = ({ fileUrl, fileName }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const convertWordToHtml = async () => {
      if (!fileUrl) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the file as ArrayBuffer
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }

        const arrayBuffer = await response.arrayBuffer();

        // Convert Word document to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.messages && result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages);
        }

        setHtmlContent(result.value);
      } catch (err) {
        console.error('Error converting Word document:', err);
        setError('Failed to load Word document. The file may be corrupted or in an unsupported format.');
        message.error('Failed to load Word document');
      } finally {
        setIsLoading(false);
      }
    };

    convertWordToHtml();
  }, [fileUrl]);

  if (isLoading) {
    return (
      <div className="document-viewer-loading">
        <Spin size="large" tip="Loading Word document..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-viewer-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="word-viewer">
      <div className="word-viewer-header">
        <span className="file-name">{fileName || 'Word Document'}</span>
      </div>
      <div 
        className="word-viewer-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

WordViewer.propTypes = {
  fileUrl: PropTypes.string.isRequired,
  fileName: PropTypes.string,
};

export default WordViewer;
