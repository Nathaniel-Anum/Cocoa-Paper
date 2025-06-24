import axiosInstance from '../Components/axiosInstance';

export const getUserGroups = () => {
  return axiosInstance.get('/user-group');
};
