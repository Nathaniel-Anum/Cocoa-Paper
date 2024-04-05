import axiosInstance from "../Components/axiosInstance";

export const addUser = (values) => {
  return axiosInstance.post("/staff", values);
};


