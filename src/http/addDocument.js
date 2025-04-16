import axiosInstance from '../Components/axiosInstance';

export const uploadFile = (fileData) => {
  return axiosInstance.post('/upload', fileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const addDocument = (values) => {
  return axiosInstance.post('/document', values);
};
