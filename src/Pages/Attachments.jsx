import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useViewDocument } from '../queryHooks/document';
import pdf from '../assets/pdf.svg';
import { PDFViewer } from '../Components/PDFViewer/PdfViewer';
import useStore from '../store/store';
import { EyeOutlined } from '@ant-design/icons';
import { Table } from 'antd';
const Attachments = () => {
  const { id: docId } = useParams();

  const { data: document, refetch } = useViewDocument(docId);

  const openFileViewer = useStore((state) => state.openFileViewer);
  const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);

  const [selectedFile, setSelectedFile] = React.useState(null);

  useEffect(() => {
    if (selectedFile) {
      setOpenFileViewer(true);
    }
  }, [selectedFile]);

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Uploaded By',
      dataIndex: ['user', 'name'],
      key: 'user',
    },

    {
      title: 'Department',
      dataIndex: ['user', 'department', 'departmentName'],
      key: 'department',
    },
    {
      title: 'Division',
      dataIndex: ['user', 'division', 'divisionName'],
      key: 'division',
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      render: (value, record) => {
        return (
          <EyeOutlined
            onClick={() => setSelectedFile(record)}
            color="blue"
            className="cursor-pointer"
          />
        );
      },
    },
  ];

  return (
    <div className="mt-8 w-[95%] mx-auto">
      {openFileViewer && (
        <PDFViewer
          fileId={selectedFile?.fileId}
          fileName={selectedFile.fileName}
        />
      )}
      <Table
        columns={columns}
        dataSource={
          document &&
          document?.data.document.attachments.map((file) => ({
            ...file,
            key: file.fileId,
          }))
        }
      />
    </div>
  );
};

export default Attachments;
