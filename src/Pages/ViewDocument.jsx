import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Form,
  Select,
  Input,
  Card,
  Layout,
  Typography,
  Avatar,
  Table,
  Tooltip,
  Modal,
  InputNumber,
  Spin,
  message,
  Checkbox,
  Mentions,
  Upload,
} from 'antd';
import { LuArchive, LuMessageSquare, LuSend, LuUser } from 'react-icons/lu';
import { FaHandshake } from 'react-icons/fa';
import { BiEdit } from 'react-icons/bi';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import pdf from '../assets/pdf.svg';
import { useViewDocument } from '../queryHooks/document';
import axiosInstance from '../Components/axiosInstance';
import { useUser } from './CustomHook/useUser';
import { capitalize, formatMoney } from '../../utils/typography';
import useStore from '../store/store';

import { approveDocument, uploadFile } from '../http/addDocument';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';
import { updateBudgetAmount } from '../http/budget';
import Loader from '../Components/Loader/Loader';
import { useGetAllUsers } from '../queryHooks/user';
import { PDFViewerContent } from '../Components/PDFViewer/PdfViewer';

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
  const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Data fetching
  const { data: document, refetch } = useViewDocument(docId);
  const { user } = useUser();

  const [form] = Form.useForm();

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
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Approval failed');
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

  console.log({ selectedBudgetItem });

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

  return (
    <div className="h-full">
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
      <div></div>

      <Content className="p-4 h-full mb-10">
        <div className="w-5/6 mx-auto mb-4 ">
          <h1 className=" text-center font-semibold text-xl text-slate-500 ">
            {document.data.document.subject}
          </h1>
        </div>

        <div className="h-full  mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Document Preview Section */}
          <Card
            bordered={false}
            className="h-full"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <div className="flex justify-between items-center mb-3">
              {document.data.document.attachments?.length > 0 && (
                <span
                  className="text-blue-400 cursor-pointer underline"
                  onClick={() => navigate(`/view-attachment/${docId}`)}
                >
                  View Attachments
                </span>
              )}
            </div>

            <div className="flex-1 overflow-hidden rounded-lg mb-4 bg-white">
              {fileUrl ? (
                <Spin spinning={isLoading} tip="Loading document...">
                  <PDFViewerContent pdfUrl={fileUrl} documentId={docId} />
                </Spin>
              ) : (
                <div className="flex flex-col gap-7 justify-center items-center w-full h-full">
                  <img
                    src={pdf}
                    className="w-[50%] h-[50%] cursor-not-allowed"
                    alt="PDF icon"
                  />
                  <p className="text-[#582F08]">No File Attached</p>
                </div>
              )}
            </div>

            <Card
              bordered={false}
              className="bg-[#582F08]/5 flex-shrink-0"
              bodyStyle={{ padding: '16px' }}
            >
              {document.data.document.documentType === 'BudgetRelease' && (
                <Table
                  dataSource={budgetData}
                  columns={budgetColumns}
                  pagination={false}
                  loading={isLoading}
                  locale={{ emptyText: 'No budget data available' }}
                />
              )}

              {hasPermission(getAllRolePermissions(user), [
                requiredPermissions.APPROVE_DOCUMENT,
              ]) &&
                !document.data.document.isApproved &&
                document.data.document.documentType !== 'General' && (
                  <Button
                    type="primary"
                    htmlType="button"
                    loading={approvalLoading}
                    icon={<FaHandshake className="w-4 h-4" />}
                    className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80 w-full mt-6"
                    onClick={() => approveDoc()}
                  >
                    Approve
                  </Button>
                )}
            </Card>
          </Card>

          {/* Comments Section */}
          <Card
            bordered={false}
            className="h-full"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <LuMessageSquare className="w-6 h-6" />
              <Title level={4} style={{ margin: 0 }}>
                Comments
              </Title>
            </div>

            <div
              className="flex-1 bg-[#e4c8ad] rounded-lg p-4 overflow-y-auto mb-4"
              style={{
                height: 'calc(100vh - 20rem)',
                minHeight: '200px',
                maxHeight: 'calc(100vh - 20rem)',
              }}
            >
              {commentsToShow.length > 0 ? (
                commentsToShow.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex ${
                      comment.userId === user?.userId
                        ? 'justify-end'
                        : 'justify-start'
                    } mb-4`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        comment.userId === user?.userId
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      }`}
                    >
                      <Avatar icon={<LuUser className="w-5 h-5" />} />
                      <div
                        className={`rounded-lg p-4 ${
                          comment.userId === user?.userId
                            ? 'bg-[#582F08] text-white'
                            : 'bg-[#9d4d01] text-white'
                        }`}
                      >
                        <p className="font-medium text-sm">
                          {comment.user?.name || 'Unknown User'}
                        </p>
                        <p className="mt-1">{comment.body}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No comments yet</p>
                </div>
              )}
            </div>
            {document &&
              document.data.document.trail[
                document.data.document.trail.length - 1
              ].status === 'Received' &&
              document.data.document.trail[
                document.data.document.trail.length - 1
              ].receiverId === user.userId && (
                <Form
                  onFinish={handleSubmit}
                  layout="vertical"
                  className="flex-shrink-0"
                  form={forwardForm}
                >
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
                  <Form.Item label="">
                    <Checkbox onChange={() => setIsPrivate(!isPrivate)}>
                      Private Comment?
                    </Checkbox>
                  </Form.Item>

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
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <div className="flex gap-4">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<LuSend className="w-4 h-4" />}
                        className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
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
                          className="flex-1 bg-[#9d4d01] hover:bg-[#9d4d01]/80 text-white"
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
          record={document.data.document}
          setShow={setShowArchiveModal}
          sender={authUser?.userId}
        />
      )}
    </div>
  );
}

export default ViewDocument;
