import axiosInstance from '../Components/axiosInstance';

export const addBudgetItem = (data) => {
  return axiosInstance.post('/budget', data);
};

export const updateBudget = (id, data) => {
  return axiosInstance.patch(`/budget/${id}`, data);
};

export const getFinancialYears = () => {
  return axiosInstance.get('/financial-year');
};

export const addFinancialYear = (data) => {
  return axiosInstance.post('/financial-year', data);
};

export const updateFinancialYear = (id, data) => {
  return axiosInstance.patch(`/financial-year/${id}`, data);
};

export const getAllBudgets = () => {
  return axiosInstance.get('/budget');
};

export const deleteBudget = (id) => {
  return axiosInstance.delete(`/budget/${id}`);
};
