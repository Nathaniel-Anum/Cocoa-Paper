import axiosInstance from '../Components/axiosInstance';

export const changeDocumentStatus = async (docId, senderId) => {
  try {
    const res = await axiosInstance.patch(`/trail/${docId}`, {
      userId: senderId,
      status: 'Archived',
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getAuditTrail = () => {
  return axiosInstance.get('/audit-trail');
};
