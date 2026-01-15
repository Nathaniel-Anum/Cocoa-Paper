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
  Popover,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DeleteTwoTone,
  EditTwoTone,
  FilePdfFilled,
  FolderFilled,
  UploadOutlined,
  ArrowLeftOutlined,
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
      render: (value) => value || '-',
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      render: (date) => {
        const dateObj = new Date(date);
        return (
          <div className="flex gap-2">
            <span>{dateObj.toDateString()}</span>
            <span>{dateObj.toLocaleTimeString()}</span>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (value) => value || '-',
    },
    {
      title: 'Action',
      render: (_, record) => (
        <div className="flex gap-3 text-[17px]">
          <div className="flex item-center">
            <button
              onClick={() => {
                setSelectedItem((prev) => ({ ...prev, record }));
                setModalStates((prev) => ({ ...prev, editModal: true }));
              }}
            >
              <EditTwoTone />
            </button>
          </div>
          <Popconfirm
            title={`Delete this ${record.type.toLowerCase()}?`}
            onConfirm={() => mutations.delete.mutate(record)}
            okText="Yes"
            cancelText="No"
            overlayClassName="custom-popconfirm"
          >
            <button>
              <DeleteTwoTone twoToneColor="#FF0000" />
            </button>
          </Popconfirm>
          {record.document?.docID && (
            <Popconfirm
              title="Unarchive this file?"
              onConfirm={() => mutations.unarchive.mutate(record)}
              okText="Yes"
              cancelText="No"
            >
              <Popover content="Unarchive">
                <Button icon={<MdUnarchive />} />
              </Popover>
            </Popconfirm>
          )}
        </div>
      ),
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
    <div className="pb-8">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-[#582F08]">Archive</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your files and folders</p>
      </div>

      {/* Clean Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setModalStates((prev) => ({ ...prev, createFolder: true }))
            }
            className="flex items-center gap-2 px-3 py-2 bg-[#582F08] text-white rounded-lg hover:bg-[#6d3a0a] transition-colors text-sm font-medium"
          >
            <MdOutlineCreateNewFolder className="text-base" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          
          <button
            onClick={() =>
              setModalStates((prev) => ({ ...prev, uploadFile: true }))
            }
            className="flex items-center gap-2 px-3 py-2 border border-[#582F08] text-[#582F08] rounded-lg hover:bg-[#582F08] hover:text-white transition-colors text-sm font-medium"
          >
            <UploadOutlined className="text-base" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {selectedItem.rowKeys.length > 0 && (
            <button
              className="flex items-center gap-2 px-3 py-2 text-[#582F08] hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
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

        {/* Search */}
        <div className="w-full md:w-72">
          <Input.Search
            placeholder="Search..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            size="middle"
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-4 text-sm">
        <Breadcrumb
          items={breadcrumbs}
          itemRender={(route, _, routes) => (
            <Link
              to={route.path === '/archive' ? '/archive' : `/archive${route.path}`}
              onClick={() => setBreadcrumbs(routes.slice(0, routes.indexOf(route) + 1))}
              className="text-gray-600 hover:text-[#582F08]"
            >
              {route.title}
            </Link>
          )}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={Array.isArray(tableData) ? tableData : []}
          showExpandColumn={false}
          rowSelection={{
            hideSelectAll: true,
            type: 'radio',
            selectedRowKeys: selectedItem.rowKeys,
            onChange: (keys, rows) =>
              setSelectedItem((prev) => ({
                ...prev,
                rowKeys: keys,
                record: rows[0],
              })),
          }}
          scroll={{ x: 600 }}
          size="small"
          pagination={{ pageSize: 15, size: 'small' }}
        />
      </div>

      {/* Mobile List */}
      <div className="md:hidden">
        {Array.isArray(tableData) && tableData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {tableData.map((record) => (
              <div
                key={record.key}
                className={`py-3 px-1 flex items-center gap-3 ${
                  selectedItem.rowKeys.includes(record.key) ? 'bg-[#FDF8F4]' : ''
                }`}
                onClick={() =>
                  setSelectedItem((prev) => ({
                    ...prev,
                    rowKeys: [record.key],
                    record: record,
                  }))
                }
              >
                {/* Icon */}
                {record.type === 'Folder' ? (
                  <FolderFilled className="text-2xl text-[#FFAC28] flex-shrink-0" />
                ) : (
                  <FilePdfFilled className="text-2xl text-[#eb3b3b] flex-shrink-0" />
                )}
                
                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (record.type === 'Folder') {
                      handleBreadcrumbUpdate(record);
                    } else {
                      handleFileClick(record);
                    }
                  }}
                >
                  <p className="text-sm font-medium text-[#582F08] truncate">
                    {record.type === 'Folder' ? record.folderName : record.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {record.ref || record.type} · {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem((prev) => ({ ...prev, record }));
                      setModalStates((prev) => ({ ...prev, editModal: true }));
                    }}
                    className="p-2 text-gray-400 hover:text-[#582F08]"
                  >
                    <EditTwoTone />
                  </button>
                  <Popconfirm
                    title={`Delete ${record.type.toLowerCase()}?`}
                    onConfirm={() => mutations.delete.mutate(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button 
                      className="p-2 text-gray-400 hover:text-red-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteTwoTone twoToneColor="#FF0000" />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FolderFilled className="text-4xl mb-2" />
            <p>No items</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalStates.createFolder && (
        <CreateFolder
          open={modalStates.createFolder}
          setOpen={(value) =>
            setModalStates((prev) => ({ ...prev, createFolder: value }))
          }
          id={id}
        />
      )}
      {modalStates.uploadFile && (
        <UploadFile
          show={modalStates.uploadFile}
          setShow={(value) =>
            setModalStates((prev) => ({ ...prev, uploadFile: value }))
          }
          id={id}
        />
      )}

      {/* Edit Modal */}
      <Modal
        title={`Edit ${selectedItem.record?.type || 'Item'}`}
        open={modalStates.editModal}
        onCancel={() =>
          setModalStates((prev) => ({ ...prev, editModal: false }))
        }
        footer={null}
        width={400}
      >
        <Form form={form} onFinish={(values) => mutations.edit.mutate(values)} layout="vertical" className="mt-4">
          {selectedItem.record?.type === 'Folder' ? (
            <Form.Item
              name="folderName"
              label="Folder Name"
              rules={[{ required: true, message: 'Please input folder name' }]}
            >
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
            <Button type="primary" htmlType="submit" className="w-full bg-[#582F08]">
              Save
            </Button>
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
          </Button>
        ]}
        width={600}
      >
        <div className="mt-4">
          {moveFolderData?.data?.archive?.parentFolderId && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#582F08] mb-4"
            >
              <ArrowLeftOutlined />
              Back
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
                  className="p-3 cursor-pointer hover:bg-gray-50 rounded-lg flex flex-col items-center text-center"
                >
                  <FolderFilled className="text-3xl text-[#FFAC28]" />
                  <p className="text-xs mt-1 text-gray-700 truncate w-full">{folder.folderName}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-400">No folders</div>
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
          if (selectedItem.file?.fileUrl) {
            URL.revokeObjectURL(selectedItem.file.fileUrl);
          }
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
