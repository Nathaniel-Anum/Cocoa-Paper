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

export const getAllBudgets = (qParams) => {
  return axiosInstance.get('/budget', { params: qParams });
};

export const deleteBudget = (id) => {
  return axiosInstance.delete(`/budget/${id}`);
};

export const updateBudgetAmount = (id, values) => {
  return axiosInstance.patch(`/document/budget-allocation/${id}`, values);
};
