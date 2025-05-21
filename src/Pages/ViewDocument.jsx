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
} from 'antd';
import { LuArchive, LuMessageSquare, LuSend, LuUser } from 'react-icons/lu';
import { FaHandshake } from 'react-icons/fa';
import { BiEdit } from 'react-icons/bi';
import { EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import pdf from '../assets/pdf.svg';
import { useViewDocument } from '../queryHooks/document';
import axiosInstance from '../Components/axiosInstance';
import { useUser } from './CustomHook/useUser';
import { capitalize, formatMoney } from '../../utils/typography';
import useStore from '../store/store';
import { PDFViewer } from '../Components/PDFViewer/PdfViewer';
import { approveDocument } from '../http/addDocument';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';
import { updateBudgetAmount } from '../http/budget';
import Loader from '../Components/Loader/Loader';

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

  // Data fetching
  const { data: document, refetch } = useViewDocument(docId);
  const { user } = useUser();

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
        error.response?.data?.message || 'Failed to forward document'
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

  // Handlers
  const handleDivisionChange = (value) => setSelectedDivision(value);
  const handleDepartmentChange = (value) => setSelectedDepartment(value);
  const handleSubmit = (values) => forwardDocument(values);
  const handleAmountUpdate = (values) => updateAmount(values);

  // Table configuration
  const budgetColumns = [
    {
      title: 'Item',
      key: 'item',
      dataIndex: ['budgetItem', 'item'],
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      render: (value) => <span>{value ? `¢${formatMoney(value)}` : '--'}</span>,
    },
    {
      title: 'Dollar Amount',
      key: 'dollarAmount',
      dataIndex: 'dollarAmount',
      render: (value) => <span>{value ? `$${formatMoney(value)}` : '--'}</span>,
    },
    {
      title: 'Allocation',
      key: 'allocation',
      dataIndex: ['budgetItem', 'amount'],
      render: (value) => <span>{`¢${formatMoney(value)}`}</span>,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value) => <span>{value && `¢${formatMoney(value)}`}</span>,
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

      <Content className="p-4 h-full">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-xl flex-shrink-0">
                {document.data.document.subject}
              </h1>
              {document.data.document.attachments?.length > 0 && (
                <span
                  className="text-blue-400 cursor-pointer underline"
                  onClick={() => navigate(`/view-attachment/${docId}`)}
                >
                  View Files
                </span>
              )}
            </div>

            <div className="flex-1 overflow-hidden rounded-lg mb-4 bg-white">
              {fileUrl ? (
                <Spin spinning={isLoading} tip="Loading document...">
                  <iframe
                    src={fileUrl}
                    width="100%"
                    height="650px"
                    title="Document Preview"
                  />
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
              {document.data.document.comments?.length > 0 ? (
                document.data.document.comments.map((comment) => (
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
            {document.data.document.trail === 'Received' && (
              <Form
                onFinish={handleSubmit}
                layout="vertical"
                className="flex-shrink-0"
                form={forwardForm}
              >
                <Form.Item
                  name="divisionId"
                  label="Division"
                  rules={[{ required: true, message: 'Division is required' }]}
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
                  rules={[{ required: true, message: 'Recipient is required' }]}
                >
                  <Select
                    placeholder="Select recipient"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={users?.data
                      ?.filter((emp) => emp.userId !== user?.userId)
                      .map((user) => ({
                        label: user.name,
                        value: user.userId,
                      }))}
                    loading={!users && !!selectedDepartment}
                    disabled={!selectedDepartment}
                  />
                </Form.Item>

                <Form.Item label="Comment" name="comment" className="mb-2">
                  <Input.TextArea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
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
        <PDFViewer
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
