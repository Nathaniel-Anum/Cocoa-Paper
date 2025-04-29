import axiosInstance from '../Components/axiosInstance';

export const getAnalytics = (id) => {
  return axiosInstance.get('/analytics', { params: { divisionId: id } });
};
