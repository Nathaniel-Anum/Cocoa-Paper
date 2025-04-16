import axiosInstance from '../Components/axiosInstance';

export const addBudgetItem = (data) => {
  return axiosInstance.post('/budget', data);
};

export const updateBudget = (id, data) => {
  return axiosInstance.patch(`/budget/${id}`, data);
};
