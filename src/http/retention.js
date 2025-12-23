import axiosInstance from '../Components/axiosInstance';

// Get retention policy status
export const getRetentionStatus = async () => {
  const response = await axiosInstance.get('/retention/status');
  return response.data;
};

// Trigger auto-archive manually
export const triggerAutoArchive = async () => {
  const response = await axiosInstance.post('/retention/auto-archive');
  return response.data;
};
