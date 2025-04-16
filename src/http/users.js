import axiosInstance from '../Components/axiosInstance';

export const addUser = (values) => {
  return axiosInstance.post('/staff', values);
};

export const getUsers = () => {
  return axiosInstance.get('/all-users');
};
