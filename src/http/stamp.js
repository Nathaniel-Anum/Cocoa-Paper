import axiosInstance from '../Components/axiosInstance';

export const addStamp = (values) => {
  return axiosInstance.post('/stamp', values);
};

export const getStamps = () => {
  return axiosInstance.get(`/stamp`);
};

export const deleteStamp = () => {
  return axiosInstance.delete('/stamp');
};

export const updateStamp = (id, values) => {
  return axiosInstance.put(`/stamp/${id}`, values);
};
