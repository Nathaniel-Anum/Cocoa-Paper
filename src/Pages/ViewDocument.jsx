import {
  Spin,
  Form,
  Card,
  Table,
  Modal,
  Button,
  Select,
  Avatar,
  Layout,
  Upload,
  Tooltip,
  message,
  Checkbox,
  Mentions,
  Typography,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import { FaHandshake } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditOutlined, EyeOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { LuArchive, LuMessageSquare, LuSend, LuUser } from 'react-icons/lu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import pdf from '../assets/pdf.svg';
import { useViewDocument } from '../queryHooks/document';
import axiosInstance from '../Components/axiosInstance';
import { useUser } from './CustomHook/useUser';
import { formatMoney } from '../../utils/typography';
import useStore from '../store/store';
import { recordDocumentView } from '../http/documentViews';

import { approveDocument, reverseApproval, recallDocument, uploadFile } from '../http/addDocument';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';
import { updateBudgetAmount } from '../http/budget';
import Loader from '../Components/Loader/Loader';
import { PDFViewerContent } from '../Components/PDFViewer/PdfViewer';
import { WordViewer, ExcelViewer, getFileType } from '../Components/DocumentViewers';
import TextArea from 'antd/es/input/TextArea';
import OTPVerificationModal from '../Components/OTPVerificationModal';
import { useGetAllUserGroups, useGetAllUsers } from '../queryHooks/user';
import AttachFilesModal from '../Components/modals/AttachFilesModal';

const { Content } = Layout;
const { Title } = Typography;

function ViewDocument() {
  const { user: authUser } = useUser();
  const { id: docId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [forwardForm] = Form.useForm();
  const [amountForm] = Form.useForm();

  // State management
  const openFileViewer = useStore((state) => state.openFileViewer);
  const chosenRecord = useStore((state) => state.chosenRecord);

  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBudgetItem, setSelectedBudgetItem] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

  // Data fetching
  const { data: document, refetch } = useViewDocument(docId);
  const { user } = useUser();
  const { data: userGroups } = useGetAllUserGroups();
  const { data: ccUsers } = useGetAllUsers();

  const [form] = Form.useForm();

  const setShowToolbar = useStore((state) => state.setShowToolbar);

  // Fetch file data
  const fetchFile = useCallback(async () => {
    if (!document?.data?.document?.file?.fileId) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/archive/file/${document.data.document.file.fileId}`,
        { responseType: 'blob' }
      );
      const fileUrl = URL.createObjectURL(response.data);
      setFileUrl(fileUrl);
    } catch (error) {
      console.error('Error fetching file:', error.message);
      message.error('Failed to load document file');
    } finally {
      setIsLoading(false);
    }
  }, [document]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  // Record document view when component mounts
  useEffect(() => {
    if (docId) {
      recordDocumentView(docId)
        .then(() => {
          console.log('Document view recorded');
        })
        .catch((error) => {
          console.error('Failed to record view:', error);
          // Don't show error to user - this is a background operation
        });
    }
  }, [docId]);

  // Note: Toolbar visibility is controlled by the source page:
  // - Incoming: setShowToolbar(true) for documents that can be annotated
  // - Outgoing: setShowToolbar(false) since senders shouldn't annotate their own docs

  // Mutations
  const { mutate: forwardDocument, isPending: submitLoading } = useMutation({
    mutationKey: ['forwardDocument', docId],
    mutationFn: (values) =>
      axiosInstance.patch(`/trail/${docId}`, {
        ...values,
        userId: values?.userId,
        status: 'Forwarded',
      }),
    onSuccess: () => {
      message.success('Document forwarded successfully');
      forwardForm.resetFields();
      queryClient.invalidateQueries(['trail']);
      navigate('/incoming');
    },
    onError: (error) => {
      message.error(
        error.response?.data?.error || 'Failed to forward document'
      );
    },
  });

  const { mutate: approveDoc, isPending: approvalLoading } = useMutation({
    mutationKey: ['approveDocument', docId],
    mutationFn: () => approveDocument(docId),
    onSuccess: () => {
      message.success('Request approved successfully');
      refetch();
      qClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Approval failed');
    },
  });

  const { mutate: reverseDoc, isPending: reverseLoading } = useMutation({
    mutationKey: ['reverseApproval', docId],
    mutationFn: () => reverseApproval(docId),
    onSuccess: () => {
      message.success('Approval reversed successfully. Balance has been restored.');
      refetch();
      qClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Reverse failed');
    },
  });

  const qClient = useQueryClient();

  const { mutate: updateAmount, isPending: isUpdatingAmount } = useMutation({
    mutationKey: ['updateBudgetAmount', selectedBudgetItem],
    mutationFn: (values) => updateBudgetAmount(selectedBudgetItem, values),
    onSuccess: () => {
      message.success('Amount updated successfully');
      qClient.invalidateQueries({ queryKey: ['document', docId] });
      setShowModal(false);
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to update amount');
    },
  });

  useEffect(() => {
    if (selectedBudgetItem) {
      amountForm.setFieldValue('amount', selectedBudgetItem.amount || 0);
    }
  }, [selectedBudgetItem, amountForm]);

  // Data queries
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: !!selectedDivision,
    staleTime: 1000 * 60 * 5,
  });

  const { data: users } = useQuery({
    queryKey: ['users', selectedDepartment],
    queryFn: () => axiosInstance.get(`/all-users/${selectedDepartment}`),
    enabled: !!selectedDepartment,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: uploadMultipleFiles, isPending: isMultipleUploading } =
    useMutation({
      mutationKey: ['uploadMultiple'],
      mutationFn: async ({ files, subject, ref }) => {
        // Create an array of promises for each file upload
        const uploadPromises = files.map((file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('subject', subject);
          formData.append('ref', ref);

          return uploadFile(formData).then((response) => {
            if (!response?.data?.newFile?.fileId) {
              throw new Error(
                `File upload successful for ${file.name} but no file ID was returned`
              );
            }
            return response.data.newFile.fileId;
          });
        });

        // Wait for all uploads to complete
        return Promise.all(uploadPromises);
      },
      onSuccess: (fileIds) => {
        console.log('All files uploaded successfully with IDs:', fileIds);

        // Get form values and add file IDs
        const values = forwardForm.getFieldsValue();
        forwardDocument({
          ...values,
          status: 'Forwarded',
          isPrivate,
          attachmentIds: fileIds,
        });
      },
      onError: (error) => {
        // showErrorNotification('Attachment Upload Failed', error);
        message.error(error?.response?.data?.error);
      },
    });

  // Handlers
  const handleDivisionChange = (value) => setSelectedDivision(value);
  const handleDepartmentChange = (value) => setSelectedDepartment(value);

  const handleApproveDocument = () => {
    approveDoc();
  };

  const handleReverseApproval = () => {
    reverseDoc();
  };

  const handleSubmit = (values) => {
    const attachmentFiles = values.attachments?.fileList;

    if (!attachmentFiles || attachmentFiles.length === 0) {
      // No attachments, just upload the main file

      forwardDocument({ ...values, status: 'Forwarded', isPrivate });
    } else {
      const attachmentFilesArray = attachmentFiles.map(
        (fileItem) => fileItem.originFileObj
      );

      // Upload all attachments with reference to main file
      uploadMultipleFiles({
        files: attachmentFilesArray,
        subject: '',
        ref: '',
      });
    }

    // forwardDocument({ ...values, isPrivate })
  };
  const handleAmountUpdate = (values) => updateAmount(values);

  // Table configuration
  const budgetColumns = [
    {
      title: 'Item',
      key: 'item',
      dataIndex: ['budgetItem', 'item'],
      render: (value, record) => (
        <span
          className={
            record?.balance > record.amount && (
              <span className="text-red-500"></span>
            )
          }
        >
          {value}
        </span>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      render: (value, record) => (
        <span
          className={
            record?.balance > record.amount && (
              <span className="text-red-500"></span>
            )
          }
        >
          {value ? `¢${formatMoney(value)}` : '--'}
        </span>
      ),
    },

    {
      title: 'Allocation',
      key: 'allocation',
      dataIndex: ['budgetItem', 'amount'],
      render: (value, record) => (
        <span
          className={
            record?.balance > record.amount && (
              <span className="text-red-500"></span>
            )
          }
        >{`¢${formatMoney(value)}`}</span>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value, record) => (
        <span
          className={
            record?.balance > record.amount && (
              <span className="text-red-500"></span>
            )
          }
        >
          {value && `¢${formatMoney(value)}`}
        </span>
      ),
    },
    ...(hasPermission(getAllRolePermissions(user), [
      requiredPermissions.UPDATE_DOCUMENT_AMOUNT,
    ])
      ? [
          {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            render: (value, record) => (
              <Tooltip title="Edit Amount">
                <EditOutlined
                  className="cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setSelectedBudgetItem(record);
                  }}
                />
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  const budgetData =
    document?.data?.document.budgetAllocations?.map((item) => ({
      ...item,
      key: item.id,
    })) || [];

  // Early return if no document
  if (!document) {
    return <Loader fullScreen />;
  }

  const filteredComments =
    document.data.document.comments?.filter((comment) => {
      // Show if not private, or if private and current user is recipient
      return (
        !comment.isPrivate ||
        (comment.isPrivate && comment.receipientId === user?.userId)
      );
    }) || [];

  const lastUserCommentIndex = filteredComments.findLastIndex(
    (comment) =>
      comment.userId === user?.userId || comment.receipientId === user?.userId
  );

  const attachmentUploadProps = {
    name: 'file', // The name of the file input field, not the form field name
    multiple: true,
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log(
        'Attachment files selected:',
        info.fileList.map((f) => f.name)
      );
      // The fileList will be stored in the form
      form.setFieldsValue({ attachments: { fileList: info.fileList } });
    },
    accept: '.pdf',
  };

  const commentsToShow =
    lastUserCommentIndex === -1
      ? filteredComments
      : filteredComments.slice(0, lastUserCommentIndex + 1);

  const documentRecord = document.data.document;
  const latestTrail = documentRecord.trail[documentRecord.trail.length - 1];
  const showForwardForm =
    latestTrail.status === 'Received' &&
    ((latestTrail.receiverId === user.userId &&
      latestTrail.carbonCopies.length < 1) ||
      (chosenRecord?.isCarbonCopy && chosenRecord?.ccEnableForward));
  const fileName = documentRecord.file?.fileName || 'No file attached';
  const attachmentCount = documentRecord.attachments?.length || 0;

  return (
    <div className="page-shell">
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        centered
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={(values) => handleAmountUpdate(values)}
          form={amountForm}
        >
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter an amount' }]}
          >
            <InputNumber
              placeholder="Enter Amount"
              className="w-full"
              formatter={(value) =>
                `¢ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value?.replace(/¢\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Button
            className="w-full bg-[#582F08]"
            htmlType="submit"
            type="primary"
            loading={isUpdatingAmount}
          >
            Update Amount
          </Button>
        </Form>
      </Modal>
      <Content className="h-full mb-10">
        <div className="mb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-[#582F08] leading-tight break-words">
                {documentRecord.subject}
              </h1>
              <p className="mt-1 font-mono text-sm text-[#7a6859]">{documentRecord.ref || '—'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-[#FDF4ED] px-3 py-1 text-xs font-medium text-[#9D4D01] border border-[#f2d8bd]">
                  {documentRecord.documentType || 'General'}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${documentRecord.isApproved ? 'bg-[#eef8f0] text-[#2f6b3d] border-[#cbe5d1]' : 'bg-[#fff6eb] text-[#9D4D01] border-[#f2d8bd]'}`}>
                  {documentRecord.isApproved ? 'Approved' : 'Awaiting action'}
                </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)] gap-4 md:gap-6 items-start">
          {/* Document Preview Section */}
          <Card
            bordered={false}
            className="order-1 rounded-2xl border border-[#f0e6da] shadow-sm overflow-hidden"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
            }}
            styles={{ body: { padding: '0' } }}
          >
            <div className="px-4 md:px-5 py-4 border-b border-[#f0e6da] bg-white">
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#582F08]">Document Preview</h2>
                  <p className="text-sm text-[#7a6859] mt-1">Open the original file and inspect supporting data below.</p>
                </div>
                {(showForwardForm || attachmentCount > 0) && (
                  <div
                    className={`grid gap-2 w-full max-w-md ${
                      showForwardForm && attachmentCount > 0 ? 'grid-cols-2' : 'grid-cols-1 sm:w-auto'
                    }`}
                  >
                    {showForwardForm && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-[#E3BC97] bg-white px-3 text-sm font-medium text-[#9D4D01] hover:bg-[#fdf4ed] transition-colors"
                        onClick={() => setIsAttachModalOpen(true)}
                      >
                        <PaperClipOutlined />
                        Attach files
                      </button>
                    )}
                    {attachmentCount > 0 && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-[#E3BC97] bg-white px-3 text-sm font-medium text-[#9D4D01] hover:bg-[#fdf4ed] transition-colors"
                        onClick={() => {
                          setShowToolbar(false);
                          navigate(`/view-attachment/${docId}`);
                        }}
                      >
                        <EyeOutlined />
                        View attachments
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 md:p-5 bg-[#fffaf6]">
              <div className="flex-1 overflow-hidden rounded-2xl border border-[#f0e6da] bg-white min-h-[480px]">
                {fileUrl ? (
                  <Spin spinning={isLoading} tip="Loading document...">
                    {(() => {
                      const fileType = getFileType(fileName);

                      switch (fileType) {
                        case 'word':
                          return (
                            <WordViewer
                              fileUrl={fileUrl}
                              fileName={fileName}
                            />
                          );
                        case 'excel':
                          return (
                            <ExcelViewer
                              fileUrl={fileUrl}
                              fileName={fileName}
                            />
                          );
                        case 'image':
                          return (
                            <div className="image-viewer">
                              <div className="image-viewer-content" style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                              </div>
                            </div>
                          );
                        case 'pdf':
                        default:
                          return (
                            <PDFViewerContent
                              pdfUrl={fileUrl}
                              documentId={docId}
                              fileId={documentRecord.file.fileId}
                            />
                          );
                      }
                    })()}
                  </Spin>
                ) : (
                  <div className="flex flex-col gap-7 justify-center items-center w-full h-full min-h-[480px]">
                    <img
                      src={pdf}
                      className="w-[50%] h-[50%] cursor-not-allowed"
                      alt="PDF icon"
                    />
                    <p className="text-[#582F08]">No File Attached</p>
                  </div>
                )}
              </div>
            </div>

            <Card
              bordered={false}
              className="bg-white border-t border-[#f0e6da] rounded-none flex-shrink-0"
              bodyStyle={{ padding: '16px' }}
              styles={{ body: { padding: '16px' } }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-[#582F08]">Budget Summary</h3>
                  <p className="text-sm text-gray-500 mt-1">Allocation details and approval controls remain available here.</p>
                </div>
              </div>
              {documentRecord.documentType === 'BudgetRelease' && (
                <div className="overflow-x-auto rounded-xl border border-[#f0e6da]">
                  <Table
                    dataSource={budgetData}
                    columns={budgetColumns}
                    pagination={false}
                    loading={isLoading}
                    locale={{ emptyText: 'No budget data available' }}
                    size="small"
                    scroll={{ x: 'max-content' }}
                    rowClassName={(_, index) =>
                      index % 2 !== 0 ? 'bg-[#fffaf6]' : ''
                    }
                  />
                </div>
              )}

              {hasPermission(getAllRolePermissions(user), [
                requiredPermissions.APPROVE_DOCUMENT,
              ]) &&
                !documentRecord.isApproved &&
                documentRecord.documentType !== 'General' && (
                  <Button
                    type="primary"
                    htmlType="button"
                    loading={approvalLoading}
                    icon={<FaHandshake className="w-4 h-4" />}
                    className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80 w-full mt-4 md:mt-6 h-11 rounded-xl"
                    onClick={handleApproveDocument}
                  >
                    Approve
                  </Button>
                )}

              {hasPermission(getAllRolePermissions(user), [
                requiredPermissions.APPROVE_DOCUMENT,
              ]) &&
                documentRecord.isApproved &&
                documentRecord.documentType !== 'General' && (
                  <Button
                    type="primary"
                    htmlType="button"
                    loading={reverseLoading}
                    danger
                    icon={<FaHandshake className="w-4 h-4" />}
                    className="flex-1 w-full mt-6 h-11 rounded-xl"
                    onClick={handleReverseApproval}
                  >
                    Reverse Approval
                  </Button>
                )}
            </Card>
          </Card>

          {/* Comments Section */}
          <Card
            bordered={false}
            className="h-full order-2 rounded-2xl border border-[#f0e6da] shadow-sm overflow-hidden"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
            }}
            styles={{ body: { padding: '0' } }}
          >
            <div className="px-4 md:px-5 py-4 border-b border-[#f0e6da] bg-white flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#FDF4ED] flex items-center justify-center text-[#9D4D01]">
                <LuMessageSquare className="w-5 h-5" />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }} className="text-base md:text-lg text-[#582F08]">
                  Comments And Forwarding
                </Title>
                <p className="text-sm text-gray-500 mt-1">Read the thread and continue the workflow when forwarding is available.</p>
              </div>
            </div>

            <div
              className="flex-1 bg-[#fffaf6] p-3 md:p-5 overflow-y-auto"
              style={{
                height: 'calc(100vh - 26rem)',
                minHeight: '200px',
                maxHeight: 'calc(100vh - 26rem)',
              }}
            >
              {commentsToShow.length > 0 ? (
                <div className="space-y-4">
                  {commentsToShow.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex ${
                        comment.userId === user?.userId
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[88%] ${
                          comment.userId === user?.userId
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <Avatar
                          icon={<LuUser className="w-4 h-4 md:w-5 md:h-5" />}
                          size="small"
                          className="flex-shrink-0 mt-1"
                          style={{ backgroundColor: comment.userId === user?.userId ? '#582F08' : '#9D4D01' }}
                        />
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm border ${
                            comment.userId === user?.userId
                              ? 'bg-[#582F08] text-white border-[#582F08]'
                              : 'bg-white text-[#582F08] border-[#f0e6da]'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-xs md:text-sm">
                              {comment.user?.name || 'Unknown User'}
                            </p>
                            {comment.isPrivate && (
                              <span className={`text-[10px] uppercase tracking-[0.12em] ${comment.userId === user?.userId ? 'text-white/70' : 'text-[#9D4D01]'}`}>
                                Private
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm md:text-[15px] whitespace-pre-wrap">{comment.body}</p>
                          <p className={`text-[10px] md:text-xs mt-2 ${comment.userId === user?.userId ? 'text-white/70' : 'text-gray-400'}`}>
                            {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-[#e9d6c2] bg-white flex items-center justify-center">
                  <p className="text-sm text-gray-500">No comments yet</p>
                </div>
              )}
            </div>
            {/* Forward Form - Show for regular receivers or CC recipients with enableForward permission */}
            {document && showForwardForm && (
                <Form
                  onFinish={handleSubmit}
                  layout="vertical"
                  className="flex-shrink-0 px-4 md:px-5 py-4 md:py-5 border-t border-[#f0e6da] bg-white"
                  form={forwardForm}
                >
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-[#582F08]">Forward Document</h3>
                    <p className="text-sm text-gray-500 mt-1">Choose the next recipient, add context, and optionally archive after sending.</p>
                  </div>
                  <Form.Item
                    name="divisionId"
                    label="Division"
                    rules={[
                      { required: true, message: 'Division is required' },
                    ]}
                  >
                    <Select
                      placeholder="Select division"
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={divisions?.data?.map((division) => ({
                        label: division.divisionName,
                        value: division.divisionId,
                      }))}
                      onChange={handleDivisionChange}
                      loading={!divisions}
                    />
                  </Form.Item>

                  <Form.Item
                    name="departmentId"
                    label="Department"
                    rules={[
                      { required: true, message: 'Department is required' },
                    ]}
                  >
                    <Select
                      placeholder="Select department"
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={departments?.data?.data?.map((department) => ({
                        label: department.departmentName,
                        value: department.departmentId,
                      }))}
                      onChange={handleDepartmentChange}
                      loading={!departments && !!selectedDivision}
                      disabled={!selectedDivision}
                    />
                  </Form.Item>

                  <Form.Item
                    name="userId"
                    label="Recipient"
                    rules={[
                      { required: true, message: 'Recipient is required' },
                    ]}
                  >
                    <Select
                      placeholder="Select recipient"
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={
                        users &&
                        users?.data
                          ?.filter((emp) => emp.userId !== user?.userId)
                          .map((user) => ({
                            label: user.name,
                            value: user.userId,
                          }))
                      }
                      loading={!users && !!selectedDepartment}
                      disabled={!selectedDepartment}
                    />
                  </Form.Item>
                  <Form.Item name="carbonCopyIds" label="CC" initialValue={[]}>
                    <Select
                      optionFilterProp="label"
                      mode="multiple"
                      showSearch
                      placeholder="Copy group or Users"
                      options={[
                        {
                          label: <span>User Groups</span>,
                          title: 'User Groups',
                          options:
                            userGroups &&
                            userGroups?.data?.data?.map((group) => ({
                              label: group?.name,
                              value: group?.id,
                            })),
                        },
                        {
                          label: <span>Users</span>,
                          title: 'Users',
                          options:
                            ccUsers &&
                            ccUsers?.data?.users
                              ?.filter((emp) => emp.userId !== user?.userId)
                              .map((u) => ({
                                label: u?.name,
                                value: u?.userId,
                              })),
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="">
                    <Checkbox onChange={() => setIsPrivate(!isPrivate)}>
                      Private Comment?
                    </Checkbox>
                  </Form.Item>
                  {isPrivate && (
                    <Form.Item name="privateComment" label="Private Comment">
                      <TextArea
                        rows={4}
                        placeholder="Enter your private comments..."
                        className="outline outline-1 outline-red-500 rounded-md p-2"
                      />
                    </Form.Item>
                  )}

                  <Form.Item label="Comment" name="comment" className="mb-2">
                    <Mentions
                      rows={5}
                      options={
                        users &&
                        users?.data
                          ?.filter((emp) => emp.userId !== user?.userId)
                          .map((user) => ({
                            label: user.name,
                            value: user.name,
                          }))
                      }
                      placeholder="Add a new comment"
                    />
                  </Form.Item>
                  <div className="mt-2">&nbsp;</div>
                  <Form.Item name="attachments">
                    <Upload {...attachmentUploadProps}>
                      <Button
                        icon={<UploadOutlined />}
                        loading={isMultipleUploading}
                        style={{ width: '100%' }}
                        className="cursor-pointer w-full"
                      >
                        Upload Additional Docs
                      </Button>
                    </Upload>
                    <p className="text-xs text-[#7a6859] mt-2 mb-0">
                      Added files are visible to the people you send this to, not the original sender.
                    </p>
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<LuSend className="w-4 h-4" />}
                        className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80 h-11 rounded-xl"
                        loading={submitLoading}
                        disabled={submitLoading}
                      >
                        Send
                      </Button>
                      {hasPermission(getAllRolePermissions(user), [
                        requiredPermissions.ARCHIVE_DOCUMENT,
                      ]) && (
                        <Button
                          icon={<LuArchive className="w-4 h-4" />}
                          className="flex-1 bg-[#9d4d01] hover:bg-[#9d4d01]/80 text-white h-11 rounded-xl"
                          onClick={() => setShowArchiveModal(true)}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </Form.Item>
                </Form>
              )}
          </Card>
        </div>
      </Content>

      {openFileViewer && (
        <PDFViewerContent
          fileId={document.data.document.file?.fileId}
          fileName={document.data.document.file?.fileName}
        />
      )}

      {showArchiveModal && (
        <ArchiveFiles
          show={showArchiveModal}
          sender={authUser?.userId}
          setShow={setShowArchiveModal}
          record={documentRecord}
        />
      )}
      <AttachFilesModal
        open={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        documentId={docId}
        documentSubject={documentRecord.subject}
      />
    </div>
  );
}

export default ViewDocument;
