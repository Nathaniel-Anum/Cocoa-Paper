import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useViewDocument } from '../queryHooks/document';
import pdf from '../assets/pdf.svg';

import useStore from '../store/store';
import { EyeOutlined } from '@ant-design/icons';
import { Card, Input, Modal, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import PDFViewer from '../Components/PDFViewer/PdfViewer';
import { WordViewer, ExcelViewer, getFileType } from '../Components/DocumentViewers';
import axiosInstance from '../Components/axiosInstance';

const Attachments = () => {
  const { id: docId } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const { data: document } = useViewDocument(docId);

  const openFileViewer = useStore((state) => state.openFileViewer);
  const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);

  const [fileUrl, setFileUrl] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const setShowToolbar = useStore((state) => state.setShowToolbar);

  useEffect(() => {
    if (selectedFile) {
      setOpenFileViewer(true);
    }
  }, [selectedFile, setOpenFileViewer]);

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.fileName?.toLowerCase().includes(search) ||
          record.user?.name?.toLowerCase().includes(search) ||
          record.user?.department?.departmentName?.toLowerCase().includes(search) ||
          record.user?.division?.divisionName?.toLowerCase().includes(search)
        );
      },
      render: (value) => (
        <div>
          <p className="font-medium text-[#582F08] break-all">{value}</p>
        </div>
      ),
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
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm').toString(),
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      render: (_, record) => {
        return (
          <button
            onClick={() => {
              setShowToolbar(true);
              handleAttachmentSelect(record);
            }}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors"
          >
            <EyeOutlined className="text-[#9D4D01] text-base" />
          </button>
        );
      },
    },
  ];

  async function handleAttachmentSelect(record) {
    setSelectedFile(record);

    const response = await axiosInstance.get(`/archive/file/${record.fileId}`, {
      responseType: 'blob',
    });
    const fileUrl = URL.createObjectURL(response.data);
    setFileUrl(fileUrl);
  }

  // Get the file type for the selected file
  const selectedFileType = selectedFile ? getFileType(selectedFile.fileName) : null;

  // Render the appropriate viewer based on file type
  const renderFileViewer = () => {
    if (!fileUrl || !selectedFile) return null;

    switch (selectedFileType) {
      case 'word':
        return (
          <Modal
            open={openFileViewer}
            onCancel={() => setOpenFileViewer(false)}
            footer={null}
            width="80%"
            style={{ top: 20 }}
            bodyStyle={{ height: '80vh', overflow: 'auto' }}
          >
            <WordViewer fileUrl={fileUrl} fileName={selectedFile.fileName} />
          </Modal>
        );
      case 'excel':
        return (
          <Modal
            open={openFileViewer}
            onCancel={() => setOpenFileViewer(false)}
            footer={null}
            width="90%"
            style={{ top: 20 }}
            bodyStyle={{ height: '80vh', overflow: 'auto' }}
          >
            <ExcelViewer fileUrl={fileUrl} fileName={selectedFile.fileName} />
          </Modal>
        );
      case 'image':
        return (
          <Modal
            open={openFileViewer}
            onCancel={() => setOpenFileViewer(false)}
            footer={null}
            width="80%"
            style={{ top: 20 }}
            bodyStyle={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <img
              src={fileUrl}
              alt={selectedFile.fileName}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Modal>
        );
      case 'pdf':
      default:
        return (
          <PDFViewer
            pdfUrl={fileUrl}
            fileId={selectedFile?.fileId}
            fileName={selectedFile.fileName}
            documentId={selectedFile?.fileId}
          />
        );
    }
  };

  const attachmentRows =
    document?.data.document.attachments.map((file) => ({
      ...file,
      key: file.fileId,
    })) || [];

  return (
    <div className="pl-[10rem] md:pl-[11rem] pr-3 md:pr-8 pt-4 md:pt-6 pb-10 md:pb-12 min-h-screen">
      {openFileViewer && renderFileViewer()}
      <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-5 md:mb-6">
        <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="28" r="28" fill="#FDF4ED" />
                  <rect x="14" y="19" width="28" height="18" rx="3" fill="#FFF8F1" stroke="#9D4D01" strokeWidth="1.5" />
                  <path d="M21 25h14M21 30h10" stroke="#582F08" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M35 16v7m0 0h7m-7 0 6-6" stroke="#9D4D01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-[#582F08] leading-tight break-words">
                  Document Attachments
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Review supporting files linked to this document and open any attachment in place.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-2">
              <Input.Search
                placeholder="Search by file name, uploader, department..."
                className="w-full md:w-[22rem]"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button
                onClick={() => navigate(`/view-document/${docId}`)}
                className="inline-flex items-center justify-center rounded-lg border border-[#E3BC97] px-4 h-[40px] text-sm font-medium text-[#9D4D01] hover:bg-[#fdf4ed] transition-colors"
              >
                Back To Document
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#f0e6da] bg-[#fffaf6] px-4 md:px-6 py-3 md:py-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">Subject</p>
            <p className="font-medium text-[#582F08] break-words">{document?.data.document.subject || '--'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">Reference</p>
            <p className="font-medium text-[#582F08] break-all">{document?.data.document.ref || '--'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">Attachments</p>
            <p className="font-medium text-[#582F08]">{attachmentRows.length}</p>
          </div>
        </div>
      </div>

      <Card
        bordered={false}
        className="rounded-2xl border border-[#f0e6da] shadow-sm overflow-hidden"
        bodyStyle={{ padding: '0' }}
        styles={{ body: { padding: '0' } }}
      >
        <div className="px-4 md:px-5 py-4 border-b border-[#f0e6da] bg-white">
          <h2 className="text-lg font-semibold text-[#582F08]">Attachment Library</h2>
          <p className="text-sm text-gray-500 mt-1">Each file keeps its original viewer and can be opened without leaving this screen.</p>
        </div>
        <div className="p-3 md:p-5 bg-[#fffaf6]">
          <div className="rounded-2xl border border-[#f0e6da] bg-white overflow-hidden">
            <Table
              columns={columns}
              dataSource={attachmentRows}
              locale={{ emptyText: 'No attachments found' }}
              rowClassName={(_, index) =>
                index % 2 !== 0 ? 'bg-[#fffaf6]' : ''
              }
              scroll={{ x: 900 }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Attachments;
