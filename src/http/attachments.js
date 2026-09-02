import axiosInstance from '../Components/axiosInstance';

export const addDocumentAttachments = async (docId, attachmentIds) => {
  const response = await axiosInstance.post(`/document/${docId}/attachments`, {
    attachmentIds,
  });
  return response.data;
};
