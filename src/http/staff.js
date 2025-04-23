import axiosInstance from '../Components/axiosInstance';

export const getStaff = () => {
  return axiosInstance.get('/staff');
};

export const getRoles = () => {
  return axiosInstance.get('/role');
};
