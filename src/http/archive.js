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

export const attachArchiveFiles = async (fileId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await axiosInstance.post(
    `/archive/file/${fileId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const getCombinedArchiveFile = async (fileId, { download = false } = {}) => {
  const response = await axiosInstance.get(`/archive/file/${fileId}/combined`, {
    responseType: "blob",
    params: download ? { download: true } : {},
  });
  return response;
};
