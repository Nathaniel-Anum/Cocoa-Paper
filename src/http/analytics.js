import axiosInstance from '../Components/axiosInstance';

export const getAnalytics = () => {
  return axiosInstance.get('/analytics');
};
