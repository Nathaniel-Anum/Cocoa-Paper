import axiosInstance from '../Components/axiosInstance';

/**
 * Create a link between two documents
 * @param {string} sourceDocId - The source document ID
 * @param {string} targetDocId - The target document ID
 * @param {string} linkType - Type of link (Response, Reference, Supersedes, Amendment, Attachment, FollowUp)
 * @param {string} description - Optional description
 */
export const createDocumentLink = async (sourceDocId, targetDocId, linkType, description = null) => {
  const response = await axiosInstance.post(`/document/${sourceDocId}/link`, {
    targetDocId,
    linkType,
    description,
  });
  return response.data;
};

/**
 * Get all links for a document
 * @param {string} docId - The document ID
 */
export const getDocumentLinks = async (docId) => {
  const response = await axiosInstance.get(`/document/${docId}/links`);
  return response.data;
};

/**
 * Search for documents to link
 * @param {string} docId - Current document ID
 * @param {string} searchTerm - Search term
 */
export const searchDocumentsForLinking = async (docId, searchTerm) => {
  const response = await axiosInstance.get(`/document/${docId}/link/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Update a document link
 * @param {string} linkId - The link ID
 * @param {string} linkType - New link type
 * @param {string} description - New description
 */
export const updateDocumentLink = async (linkId, linkType, description) => {
  const response = await axiosInstance.patch(`/document/link/${linkId}`, {
    linkType,
    description,
  });
  return response.data;
};

/**
 * Delete a document link
 * @param {string} linkId - The link ID
 */
export const deleteDocumentLink = async (linkId) => {
  const response = await axiosInstance.delete(`/document/link/${linkId}`);
  return response.data;
};

// Link type options for UI
export const LINK_TYPE_OPTIONS = [
  { value: 'Response', label: 'Response', description: 'A response to this document' },
  { value: 'Reference', label: 'Reference', description: 'General reference to another document' },
  { value: 'Supersedes', label: 'Supersedes', description: 'This document replaces the linked document' },
  { value: 'Amendment', label: 'Amendment', description: 'Amendment to another document' },
  { value: 'Attachment', label: 'Attachment', description: 'Related attachment document' },
  { value: 'FollowUp', label: 'Follow-up', description: 'Follow-up to a previous document' },
];

// Link type colors for UI badges
export const LINK_TYPE_COLORS = {
  Response: 'green',
  Reference: 'blue',
  Supersedes: 'orange',
  Amendment: 'purple',
  Attachment: 'cyan',
  FollowUp: 'gold',
};
