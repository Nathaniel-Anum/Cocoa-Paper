import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from '../../Components/axiosInstance';

// API functions
const getAccessRequests = () => axiosInstance.get('/access-request');
const getAccessRequestCount = () => axiosInstance.get('/access-request/count');
const grantAccess = (requestId, expiresAt) => axiosInstance.patch(`/access-request/${requestId}/grant`, { expiresAt });
const denyAccess = (requestId) => axiosInstance.patch(`/access-request/${requestId}/deny`);
const requestAccess = (documentId) => axiosInstance.post('/access-request', { documentId });

// Hook to get all pending access requests for the current user
export const useGetAccessRequests = () => {
  return useQuery({
    queryKey: ['accessRequests'],
    queryFn: getAccessRequests,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook to get count of pending access requests
export const useGetAccessRequestCount = () => {
  return useQuery({
    queryKey: ['accessRequestCount'],
    queryFn: getAccessRequestCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook to request access to a document
export const useRequestAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (documentId) => requestAccess(documentId),
    onSuccess: () => {
      message.success('Access request sent successfully');
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to send access request');
    },
  });
};

// Hook to grant access
export const useGrantAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, expiresAt }) => grantAccess(requestId, expiresAt),
    onSuccess: () => {
      message.success('Access granted successfully');
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
      queryClient.invalidateQueries({ queryKey: ['accessRequestCount'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to grant access');
    },
  });
};

// Hook to deny access
export const useDenyAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId) => denyAccess(requestId),
    onSuccess: () => {
      message.success('Access denied');
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
      queryClient.invalidateQueries({ queryKey: ['accessRequestCount'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to deny access');
    },
  });
};
