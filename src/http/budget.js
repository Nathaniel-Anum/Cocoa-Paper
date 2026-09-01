import axiosInstance from "../Components/axiosInstance";

export const addBudgetItem = (data) => {
  return axiosInstance.post("/budget", data);
};

export const updateBudget = (id, data) => {
  return axiosInstance.patch(`/budget/${id}`, data);
};

export const getFinancialYears = () => {
  return axiosInstance.get("/financial-year");
};

export const addFinancialYear = (data) => {
  return axiosInstance.post("/financial-year", data);
};

export const updateFinancialYear = (id, data) => {
  return axiosInstance.patch(`/financial-year/${id}`, data);
};

export const getAllBudgets = (qParams) => {
  return axiosInstance.get("/budget", { params: qParams });
};

export const getArchivedBudgets = (qParams) => {
  return axiosInstance.get("/budget/archived", { params: qParams });
};

export const getBudgetById = (id) => {
  return axiosInstance.get(`/budget/${id}`);
};

export const deleteBudget = (id) => {
  return axiosInstance.delete(`/budget/${id}`);
};

export const updateBudgetAmount = (id, values) => {
  return axiosInstance.patch(`/document/budget-allocation/${id}`, values);
};

export const downloadBudgetTemplate = () => {
  return axiosInstance.get("/budget/template/download", {
    responseType: "blob",
  });
};

export const uploadBudgetFile = (file, departmentId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("departmentId", departmentId);
  return axiosInstance.post("/budget/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getBudgetStats = () => {
  return axiosInstance.get("/budget/stats");
};

export const compareBudgetsByYear = (params) => {
  return axiosInstance.get("/budget/year-compare", { params });
};

// ── Workflow transitions ──────────────────────────────────────────────────────

export const submitBudget = (id) => axiosInstance.patch(`/budget/${id}/submit`);

export const startCommitteeReview = (id) =>
  axiosInstance.patch(`/budget/${id}/start-review`);

export const recommendBudget = (id, note) =>
  axiosInstance.patch(`/budget/${id}/recommend`, { note });

export const approveBudget = (id, note) =>
  axiosInstance.patch(`/budget/${id}/approve`, { note });

export const rejectBudget = (id, note) =>
  axiosInstance.patch(`/budget/${id}/reject`, { note });

export const returnBudget = (id, note) =>
  axiosInstance.patch(`/budget/${id}/return`, { note });
