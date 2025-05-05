import { useEffect, useState } from 'react';
import useStore from '../../store/store';
import { Modal, Spin } from 'antd';
import axiosInstance from '../axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Loader from '../Loader/Loader';

export const PDFViewer = ({ fileId, fileName }) => {
  const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);
  const openFileViewer = useStore((state) => state.openFileViewer);
  const [fileUrl, setFileUrl] = useState('');

  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFile = async function () {
      const response = await axiosInstance.get(`/archive/file/${fileId}`, {
        responseType: 'blob',
      });
      const fileUrl = URL.createObjectURL(response.data);
      setFileUrl(fileUrl);
    };
    try {
      setIsLoading(true);
      fetchFile();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
    }
  }, []);

  return (
    <Modal
      title={fileName || 'Document Viewer'}
      open={openFileViewer}
      onCancel={() => {
        if (fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
        setOpenFileViewer();
      }}
      footer={null}
      width={850}
      className="!top-9"
    >
      {fileUrl && !loading ? (
        <iframe src={fileUrl} width="100%" height="650px" title={fileName} />
      ) : (
        <Loader />
      )}
    </Modal>
  );
};
