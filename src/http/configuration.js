import axiosInstance from '../Components/axiosInstance';

export const getConfiguration = () => {
  return axiosInstance.get('/configuration');
};

export const addConfiguration = (values) => {
  return axiosInstance.post('/configuration', values);
};

export const updateConfiguration = (id, values) => {
  return axiosInstance.put(`/configuration/${id}`, values);
};

export const deleteConfiguration = () => {
  return axiosInstance.delete('/configuration');
};
