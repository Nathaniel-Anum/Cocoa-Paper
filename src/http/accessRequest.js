import axiosInstance from '../Components/axiosInstance';

// Request access to a document
export const requestAccess = (documentId) => {
  return axiosInstance.post('/access-request', { documentId });
};

// Get all pending access requests for the current user (as document holder)
export const getAccessRequests = () => {
  return axiosInstance.get('/access-request');
};

// Get count of pending access requests
export const getAccessRequestCount = () => {
  return axiosInstance.get('/access-request/count');
};

// Grant access to a requester
export const grantAccess = (requestId) => {
  return axiosInstance.patch(`/access-request/${requestId}/grant`);
};

// Deny access to a requester
export const denyAccess = (requestId) => {
  return axiosInstance.patch(`/access-request/${requestId}/deny`);
};
