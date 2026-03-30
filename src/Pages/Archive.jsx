import React, { useEffect, useState } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Breadcrumb,
  Dropdown,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DeleteOutlined,
  EditOutlined,
  FilePdfFilled,
  FolderFilled,
  UploadOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  MoreOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  MdDriveFileMoveOutline,
  MdOutlineCreateNewFolder,
  MdUnarchive,
} from 'react-icons/md';
import axiosInstance from '../Components/axiosInstance';
import useArchiveTransform from './CustomHook/useArchiveTransform';
import CreateFolder from '../Components/modals/Archive/CreateFolder';
import UploadFile from '../Components/modals/Archive/UploadFile';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { useUser } from './CustomHook/useUser';
import { PDFViewerContent } from '../Components/PDFViewer/PdfViewer';

const Archive = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { id } = useParams();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);
  const [searchText, setSearchText] = useState('');

  // State management
  const [modalStates, setModalStates] = useState({
    createFolder: false,
    uploadFile: false,
    editModal: false,
    moveModal: false,
    fileViewer: false,
  });

  const [selectedItem, setSelectedItem] = useState({
    record: null,
    file: null,
    rowKeys: [],
    currentFolder: null,
  });

  // New state for move modal navigation
  const [moveModalState, setMoveModalState] = useState({
    currentFolderId: null,
    navigationHistory: [],
    availableFolders: [],
    isNavigating: false,
  });

  const [breadcrumbs, setBreadcrumbs] = useState([
    { title: 'Archive', path: '/archive', id: 0 },
  ]);

  // Queries
  const { data: archiveData } = useQuery({
    queryKey: ['archive', id],
    queryFn: () => {
      return id
        ? axiosInstance.get(`archive/${id}`)
        : axiosInstance.get('/archive');
    },
  });
  // Replace the existing move folder query with this:
  const { data: moveFolderData, isLoading: isFetchingFolders } = useQuery({
    queryKey: ['moveFolder', moveModalState.currentFolderId],
    queryFn: async () => {
      let response;
      if (moveModalState.currentFolderId) {
        response = await axiosInstance.get(
          `/archive/${moveModalState.currentFolderId}`
        );
      } else if (selectedItem.record?.parentFolderId) {
        response = await axiosInstance.get(
          `/archive/${selectedItem.record.parentFolderId}`
        );
      } else {
        response = await axiosInstance.get('/archive');
      }
      return response;
    },
    enabled: modalStates.moveModal,
    onSuccess: (data) => {
      const folders = data.data.archive?.children || data.data.archives;
      const availableFolders = folders.filter(
        (folder) => folder.folderId !== selectedItem.record?.folderId
      );
      setMoveModalState((prev) => ({
        ...prev,
        availableFolders,
        isNavigating: false,
      }));
    },
  });

  console.log({ navHistory: moveModalState.navigationHistory });

  useEffect(() => {
    if (moveFolderData) {
      const folders =
        moveFolderData.data.archive?.children || moveFolderData.data.archives;
      // Filter out the selected folder from available folders
      const availableFolders = folders.filter(
        (folder) => folder.folderId !== selectedItem.record?.folderId
      );
      setMoveModalState((prev) => ({
        ...prev,
        availableFolders,
      }));
    }
  }, [moveFolderData, selectedItem.record]);

  // Mutations
  const mutations = {
    delete: useMutation({
      mutationFn: (record) => {
        const endpoint =
          record.type === 'Folder'
            ? `/archive/${record.folderId}`
            : `/archive/${record.fileId}`;
        return axiosInstance.delete(endpoint);
      },
      onSuccess: () => {
        message.success('Deleted Successfully');
        queryClient.invalidateQueries({
          queryKey: ['archive'],
          exact: false,
          refetchType: 'all',
        });
      },
    }),

    edit: useMutation({
      mutationFn: (values) => {
        const record = selectedItem.record;
        const endpoint =
          record.type === 'Folder'
            ? `/archive/${record.folderId}`
            : `/archive/${record.fileId}`;
        return axiosInstance.patch(endpoint, values);
      },
      onSuccess: () => {
        message.success('Successfully Updated');
        queryClient.invalidateQueries({
          queryKey: ['archive'],
          exact: false,
          refetchType: 'all',
        });
        setModalStates((prev) => ({ ...prev, editModal: false }));
      },
    }),

    move: useMutation({
      mutationFn: () => {
        const record = selectedItem.record;
        const endpoint =
          record.type === 'Folder'
            ? `/archive/${record.folderId}`
            : `/archive/${record.fileId}`;

        //Only send parentFolderId in the payload
        return axiosInstance.patch(endpoint, {
          ...record,
          parentFolderId: moveModalState.currentFolderId,
        });
      },
      onSuccess: () => {
        message.success('Moved Successfully');
        // Invalidate both queries to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ['archive'],
          exact: false,
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['moveFolder'],
          exact: false,
          refetchType: 'all',
        });

        // Reset states
        setModalStates((prev) => ({ ...prev, moveModal: false }));
        setMoveModalState({
          currentFolderId: null,
          navigationHistory: [],
          availableFolders: [],
        });
        // Clear selected item
        setSelectedItem((prev) => ({
          ...prev,
          record: null,
          rowKeys: [],
        }));
      },
    }),

    unarchive: useMutation({
      mutationFn: (record) =>
        axiosInstance.patch(`/unarchive/${record.fileId}`),
      onSuccess: () => {
        message.success('File Successfully unarchived');
        queryClient.invalidateQueries({
          queryKey: ['archive'],
          exact: false,
          refetchType: 'all',
        });
      },
    }),
  };

  // Move modal navigation handlers
  const handleFolderClick = (folder) => {
    setMoveModalState((prev) => ({
      ...prev,
      currentFolderId: folder.folderId,
      navigationHistory: [...prev.navigationHistory, prev.currentFolderId],
      isNavigating: true,
    }));
  };

  // Update the back click handler
  const handleBackClick = () => {
    const parentFolderId = moveFolderData?.data?.archive?.parentFolderId;
    setMoveModalState((prev) => ({
      ...prev,
      currentFolderId: parentFolderId,
      navigationHistory: [...prev.navigationHistory, prev.currentFolderId],
      isNavigating: true,
    }));
  };

  // Reset move modal state when closing
  const handleCloseMoveModal = () => {
    setModalStates((prev) => ({ ...prev, moveModal: false }));
    setMoveModalState({
      currentFolderId: null,
      navigationHistory: [],
      availableFolders: [],
    });
  };

  // Event Handlers
  const handleFileClick = async (record) => {
    if (record.type === 'File') {
      try {
        const response = await axiosInstance.get(
          `/archive/file/${record.fileId}`,
          {
            responseType: 'blob',
          }
        );
        // Ensure the blob has the correct MIME type for PDF
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const fileUrl = URL.createObjectURL(pdfBlob);
        setSelectedItem((prev) => ({ ...prev, file: { ...record, fileUrl } }));
        setModalStates((prev) => ({ ...prev, fileViewer: true }));
      } catch (error) {
        message.error('Error loading file');
      }
    }
  };

  const handleBreadcrumbUpdate = (item) => {
    const existingIndex = breadcrumbs.findIndex(
      (crumb) => crumb.id === item.folderId
    );

    if (existingIndex !== -1) {
      setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
    } else {
      setBreadcrumbs([
        ...breadcrumbs,
        {
          title: item.folderName,
          path: `/${item.folderId}`,
          id: item.folderId,
        },
      ]);
    }
  };

  // Table Configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'folderName',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.folderName?.toLowerCase().includes(search) ||
          record.fileName?.toLowerCase().includes(search) ||
          record.ref?.toLowerCase().includes(search) ||
          record.subject?.toLowerCase().includes(search) ||
          record.type?.toLowerCase().includes(search)
        );
      },
      render: (value, record) => (
        <div
          className="flex gap-2 cursor-pointer"
          onClick={() => handleBreadcrumbUpdate(record)}
        >
          {record.type === 'Folder' ? (
            <Link to={`/archive/${record.folderId}`}>
              <div className="flex gap-2">
                <FolderFilled className="text-[24px] text-[#FFAC28]" />
                {value}
              </div>
            </Link>
          ) : (
            <div onClick={() => handleFileClick(record)}>
              <FilePdfFilled className="text-[24px] text-[#eb3b3b]" />
              {record.fileName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      render: (value) => <span className="font-mono text-xs text-gray-500">{value || '—'}</span>,
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      render: (date) => {
        const d = new Date(date);
        return <span className="text-xs text-gray-500">{d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (val) => <span className="text-xs text-gray-500">{val}</span>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (value) => <span className="text-xs text-gray-600">{value || '—'}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => {
              setSelectedItem((prev) => ({ ...prev, record }));
              setModalStates((prev) => ({ ...prev, editModal: true }));
            },
          },
          ...(record.document?.docID
            ? [{
                key: 'unarchive',
                label: 'Unarchive',
                icon: <MdUnarchive />,
                onClick: () => mutations.unarchive.mutate(record),
              }]
            : []),
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => mutations.delete.mutate(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors">
              <MoreOutlined className="text-lg text-[#9D4D01]" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  // Transform data for table
  const archives = id
    ? archiveData?.data?.archive
    : archiveData?.data?.archives;
  const { _data } = useArchiveTransform(archives, id);
  const tableData = _data?.map((archive, index) => ({
    ...archive,
    key: index,
  }));

  // Effects
  useEffect(() => {
    const storedBreadcrumbs = JSON.parse(localStorage.getItem('breadcrumbs'));
    if (storedBreadcrumbs?.length) {
      setBreadcrumbs(storedBreadcrumbs);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
  }, [breadcrumbs]);

  useEffect(() => {
    if (selectedItem.record) {
      form.setFieldsValue(selectedItem.record);
    }
  }, [selectedItem.record, form]);

  // console.log(moveModalState.availableFolders);

  const onlyFolders = moveModalState.availableFolders?.filter(
    (i) => i.type === 'Folder'
  );
  // console.log(onlyFolders);

  console.log(moveFolderData);

  return (
    <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen">

      {/* ── Header card ── */}
      <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            {/* Inline SVG illustration */}
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#FDF4ED"/>
                {/* Cabinet body */}
                <rect x="12" y="16" width="32" height="24" rx="3" fill="#E3BC97"/>
                {/* Top drawer */}
                <rect x="12" y="16" width="32" height="11" rx="2" fill="#D4A068"/>
                <rect x="24" y="20" width="8" height="3" rx="1.5" fill="#9D4D01"/>
                {/* Bottom drawer */}
                <rect x="12" y="29" width="32" height="11" rx="2" fill="#C8955A"/>
                <rect x="24" y="33" width="8" height="3" rx="1.5" fill="#9D4D01"/>
                {/* Paper peeking out */}
                <rect x="20" y="11" width="16" height="8" rx="2" fill="white" opacity="0.9"/>
                <rect x="23" y="13" width="10" height="1.5" rx="0.75" fill="#9D4D01" opacity="0.5"/>
                <rect x="23" y="16" width="7" height="1.5" rx="0.75" fill="#9D4D01" opacity="0.3"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#582F08]">Archive</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your archived files, folders, and documents securely.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Search */}
            <Input
              placeholder="Search files and folders..."
              prefix={<SearchOutlined className="text-[#9D4D01]" />}
              allowClear
              size="middle"
              className="w-full md:w-64 rounded-lg"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              onClick={() => setModalStates((prev) => ({ ...prev, createFolder: true }))}
              className="flex items-center gap-2 px-3 py-2 bg-[#582F08] text-white rounded-lg hover:bg-[#6d3a0a] transition-colors text-sm font-medium whitespace-nowrap"
            >
              <MdOutlineCreateNewFolder className="text-base" />
              <span className="hidden sm:inline">New Folder</span>
            </button>
            <button
              onClick={() => setModalStates((prev) => ({ ...prev, uploadFile: true }))}
              className="flex items-center gap-2 px-3 py-2 border border-[#582F08] text-[#582F08] rounded-lg hover:bg-[#582F08] hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
            >
              <UploadOutlined className="text-base" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            {selectedItem.rowKeys.length > 0 && (
              <button
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
                onClick={() => {
                  setModalStates((prev) => ({ ...prev, moveModal: true }));
                  setMoveModalState((prev) => ({
                    ...prev,
                    currentFolderId: selectedItem.record?.parentFolderId || null,
                  }));
                }}
              >
                <MdDriveFileMoveOutline className="text-base" />
                <span>Move</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats + breadcrumb strip */}
        <div className="border-t border-[#f0e6da] px-6 py-3 flex items-center justify-between bg-[#fffaf6] flex-wrap gap-2">
          <Breadcrumb
            items={breadcrumbs}
            itemRender={(route, _, routes) => (
              <Link
                to={route.path === '/archive' ? '/archive' : `/archive${route.path}`}
                onClick={() => setBreadcrumbs(routes.slice(0, routes.indexOf(route) + 1))}
                className="text-sm text-[#9D4D01] hover:text-[#582F08] font-medium"
              >
                {route.title}
              </Link>
            )}
          />
          <span className="text-xs text-gray-400">
            {Array.isArray(tableData) ? tableData.length : 0} item{tableData?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        {/* Desktop table */}
        <div className="hidden md:block p-4">
          <Table
            columns={columns}
            dataSource={Array.isArray(tableData) ? tableData : []}
            showExpandColumn={false}
            rowSelection={{
              hideSelectAll: true,
              type: 'radio',
              selectedRowKeys: selectedItem.rowKeys,
              onChange: (keys, rows) =>
                setSelectedItem((prev) => ({ ...prev, rowKeys: keys, record: rows[0] })),
            }}
            scroll={{ x: 600 }}
            size="small"
            pagination={{ pageSize: 15, size: 'small' }}
            rowClassName={(_, i) => i % 2 !== 0 ? 'bg-[#fffaf6]' : ''}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <svg viewBox="0 0 80 70" className="w-24 h-20 mb-3" fill="none">
                    <ellipse cx="40" cy="65" rx="28" ry="4" fill="#f0e6da"/>
                    <rect x="15" y="15" width="50" height="42" rx="4" fill="#E3BC97" opacity="0.4"/>
                    <rect x="22" y="24" width="36" height="4" rx="2" fill="#9D4D01" opacity="0.3"/>
                    <rect x="22" y="32" width="24" height="4" rx="2" fill="#9D4D01" opacity="0.2"/>
                    <rect x="22" y="40" width="30" height="4" rx="2" fill="#9D4D01" opacity="0.2"/>
                  </svg>
                  <p className="font-medium text-[#582F08]">This folder is empty</p>
                  <p className="text-xs mt-1">Upload files or create a new folder to get started</p>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          {Array.isArray(tableData) && tableData.length > 0 ? (
            <div className="divide-y divide-[#f0e6da]">
              {tableData.map((record) => (
                <div
                  key={record.key}
                  className={`py-3 px-4 flex items-center gap-3 ${selectedItem.rowKeys.includes(record.key) ? 'bg-[#fdf4ed]' : ''}`}
                  onClick={() => setSelectedItem((prev) => ({ ...prev, rowKeys: [record.key], record }))}
                >
                  {record.type === 'Folder' ? (
                    <FolderFilled className="text-2xl text-[#FFAC28] flex-shrink-0" />
                  ) : (
                    <FilePdfFilled className="text-2xl text-[#eb3b3b] flex-shrink-0" />
                  )}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (record.type === 'Folder') handleBreadcrumbUpdate(record);
                      else handleFileClick(record);
                    }}
                  >
                    <p className="text-sm font-semibold text-[#582F08] truncate">
                      {record.type === 'Folder' ? record.folderName : record.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {record.ref || record.type} · {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          label: 'Rename',
                          icon: <EditOutlined />,
                          onClick: () => {
                            setSelectedItem((prev) => ({ ...prev, record }));
                            setModalStates((prev) => ({ ...prev, editModal: true }));
                          },
                        },
                        ...(record.document?.docID
                          ? [{ key: 'unarchive', label: 'Unarchive', icon: <MdUnarchive />, onClick: () => mutations.unarchive.mutate(record) }]
                          : []),
                        { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => mutations.delete.mutate(record) },
                      ],
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreOutlined className="text-[#9D4D01]" />
                    </button>
                  </Dropdown>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <FolderOpenOutlined className="text-4xl mb-2 text-[#E3BC97]" />
              <p className="font-medium text-[#582F08]">This folder is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modalStates.createFolder && (
        <CreateFolder
          open={modalStates.createFolder}
          setOpen={(value) => setModalStates((prev) => ({ ...prev, createFolder: value }))}
          id={id}
        />
      )}
      {modalStates.uploadFile && (
        <UploadFile
          show={modalStates.uploadFile}
          setShow={(value) => setModalStates((prev) => ({ ...prev, uploadFile: value }))}
          id={id}
        />
      )}

      {/* Edit Modal */}
      <Modal
        title={`Rename ${selectedItem.record?.type || 'Item'}`}
        open={modalStates.editModal}
        onCancel={() => setModalStates((prev) => ({ ...prev, editModal: false }))}
        footer={null}
        width={400}
      >
        <Form form={form} onFinish={(values) => mutations.edit.mutate(values)} layout="vertical" className="mt-4">
          {selectedItem.record?.type === 'Folder' ? (
            <Form.Item name="folderName" label="Folder Name" rules={[{ required: true, message: 'Please input folder name' }]}>
              <Input placeholder="Enter folder name" />
            </Form.Item>
          ) : (
            <>
              <Form.Item name="fileName" label="File Name" rules={[{ required: true }]}>
                <Input placeholder="File name" />
              </Form.Item>
              <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                <Input placeholder="Subject" />
              </Form.Item>
              <Form.Item name="ref" label="Reference" rules={[{ required: true }]}>
                <Input placeholder="Reference" />
              </Form.Item>
            </>
          )}
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" className="w-full bg-[#582F08]">Save</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Move Modal */}
      <Modal
        title="Move to..."
        open={modalStates.moveModal}
        onCancel={handleCloseMoveModal}
        footer={[
          <Button key="cancel" onClick={handleCloseMoveModal}>Cancel</Button>,
          <Button key="move" type="primary" onClick={() => mutations.move.mutate()} className="bg-[#582F08]">
            Move Here
          </Button>,
        ]}
        width={600}
      >
        <div className="mt-4">
          {moveFolderData?.data?.archive?.parentFolderId && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#582F08] mb-4"
            >
              <ArrowLeftOutlined /> Back
            </button>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {isFetchingFolders ? (
              <div className="col-span-full py-8 text-center text-gray-400">Loading...</div>
            ) : onlyFolders?.length > 0 ? (
              onlyFolders.map((folder) => (
                <div
                  key={folder.folderId}
                  onClick={() => handleFolderClick(folder)}
                  className="p-3 cursor-pointer hover:bg-[#fdf4ed] rounded-lg flex flex-col items-center text-center"
                >
                  <FolderFilled className="text-3xl text-[#FFAC28]" />
                  <p className="text-xs mt-1 text-gray-700 truncate w-full">{folder.folderName}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-400">No folders available</div>
            )}
          </div>
        </div>
      </Modal>

      {/* File Viewer Modal */}
      <Modal
        title={selectedItem.file?.fileName || 'Document'}
        open={modalStates.fileViewer}
        onCancel={() => {
          setModalStates((prev) => ({ ...prev, fileViewer: false }));
          if (selectedItem.file?.fileUrl) URL.revokeObjectURL(selectedItem.file.fileUrl);
          setSelectedItem((prev) => ({ ...prev, file: null }));
        }}
        footer={null}
        width={850}
        className="!top-9"
      >
        {selectedItem.file?.fileUrl && (
          <PDFViewerContent
            pdfUrl={selectedItem.file.fileUrl}
            documentId={selectedItem.file.fileId}
            fileId={selectedItem.file.fileId}
            hideToolbar={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default Archive;
