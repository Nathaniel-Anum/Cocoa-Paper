export const getDepartments = () => {
  return axiosInstance.get("/department");
};
