import axiosInstance from '../Components/axiosInstance';

/**
 * Record a document view
 * @param {string} documentId - The document ID
 * @returns {Promise} Response from the server
 */
export const recordDocumentView = async (documentId) => {
  try {
    const response = await axiosInstance.post('/api/document-views', {
      documentId,
    });
    return response.data;
  } catch (error) {
    console.error('Error recording document view:', error);
    throw error;
  }
};

/**
 * Get all views for a document
 * @param {string} documentId - The document ID
 * @returns {Promise} Array of view records
 */
export const getDocumentViews = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/api/document-views/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting document views:', error);
    throw error;
  }
};

/**
 * Get view statistics for a document
 * @param {string} documentId - The document ID
 * @returns {Promise} View statistics
 */
export const getDocumentViewStats = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/api/document-views/${documentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error getting document view stats:', error);
    throw error;
  }
};

/**
 * Check if current user has viewed a document
 * @param {string} documentId - The document ID
 * @returns {Promise} Boolean indicating if user has viewed
 */
export const checkUserView = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/api/document-views/${documentId}/check`);
    return response.data;
  } catch (error) {
    console.error('Error checking user view:', error);
    throw error;
  }
};

/**
 * Get current user's view history
 * @returns {Promise} Array of viewed documents
 */
export const getUserViewHistory = async () => {
  try {
    const response = await axiosInstance.get('/api/document-views/history');
    return response.data;
  } catch (error) {
    console.error('Error getting user view history:', error);
    throw error;
  }
};

/**
 * Get recipients who haven't viewed a document
 * @param {string} documentId - The document ID
 * @returns {Promise} Array of unviewed recipients
 */
export const getUnviewedRecipients = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/api/document-views/${documentId}/unviewed`);
    return response.data;
  } catch (error) {
    console.error('Error getting unviewed recipients:', error);
    throw error;
  }
};
