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

export const getDocument = (id) => {
  return axiosInstance.get(`/document/${id}`);
};

export const approveDocument = (id, otpToken) => {
  return axiosInstance.patch(`/document/approve/${id}`, { otpToken });
};

export const recallDocument = (id) => {
  return axiosInstance.patch(`/trail/${id}/recall`);
};
