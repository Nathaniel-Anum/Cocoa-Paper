import axiosInstance from '../Components/axiosInstance';

export const getDepartments = () => {
  return axiosInstance.get('/department');
};

export const getDivisions = () => {
  return axiosInstance.get('/division');
};
