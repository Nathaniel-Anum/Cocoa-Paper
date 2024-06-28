import axiosInstance from "../Components/axiosInstance";

export const getArchive = async () => {
  try {
    const res = await axiosInstance.get("/archive");

    if (res.data) {
      return res.data.archives;
    }

    return [];
  } catch (error) {
    throw error;
  }
};

export const getArchiveByFolderId = async (folderId) => {
  try {
    const res = await axiosInstance.get(`/archive/${folderId}`);

    if (res.data) {
      return res.data.archive?.children;
    }
    return [];
  } catch (error) {
    throw error;
  }
};
