// import React, { useEffect, useState } from 'react';
// import {
//   Button,
//   Form,
//   Select,
//   Input,
//   Card,
//   Layout,
//   Typography,
//   Avatar,
//   Statistic,
//   Row,
//   Col,
//   Mentions,
//   message,
//   Table,
//   Tooltip,
//   Modal,
//   InputNumber,
// } from 'antd';

// import pdf from '../assets/pdf.svg';

// import { LuArchive, LuMessageSquare, LuSend, LuUser } from 'react-icons/lu';

// import { FaHandshake } from 'react-icons/fa';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useViewDocument } from '../queryHooks/document';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import axiosInstance from '../Components/axiosInstance';
// import { useUser } from './CustomHook/useUser';
// import dayjs from 'dayjs';
// import { capitalize, formatMoney } from '../../utils/typography';
// import useStore from '../store/store';
// import { PDFViewer } from '../Components/PDFViewer/PdfViewer';
// import { BiEdit } from 'react-icons/bi';
// import { EditOutlined } from '@ant-design/icons';
// import { approveDocument } from '../http/addDocument';
// import { hasPermission, requiredPermissions } from '../../utils/Roles';
// import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';
// import { updateBudgetAmount } from '../http/budget';
// import Loader from '../Components/Loader/Loader';

// const { Content } = Layout;
// const { Title } = Typography;

// function ViewDocument() {
//   const { user: authUser } = useUser();

//   const openFileViewer = useStore((state) => state.openFileViewer);
//   const setOpenFileViewer = useStore((state) => state.setOpenFileViewer);

//   const [newComment, setNewComment] = useState('');
//   const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [showArchiveModal, setShowArchiveModal] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedBudgetItem, setSelectedBudgetItem] = useState(false);
//   const { user } = useUser();

//   const { id: docId } = useParams();

//   const { data: document, refetch } = useViewDocument(docId);

//   const [fileUrl, setFileUrl] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const [form] = Form.useForm();

//   const navigate = useNavigate();

//   const queryClient = useQueryClient();

//   useEffect(() => {
//     const fetchFile = async function () {
//       const response = await axiosInstance.get(
//         `/archive/file/${document?.data?.document?.file?.fileId}`,
//         {
//           responseType: 'blob',
//         }
//       );
//       const fileUrl = URL.createObjectURL(response.data);
//       setFileUrl(fileUrl);
//     };
//     try {
//       setIsLoading(true);
//       fetchFile();
//       setIsLoading(false);
//     } catch (e) {
//       setIsLoading(false);
//       console.log(e.message);
//     }
//   }, []);

//   const { mutate: forwardDocument, isPending: submitLoading } = useMutation({
//     mutationKey: 'forwardDocument',
//     mutationFn: (values) => {
//       return axiosInstance.patch(`/trail/${docId}`, {
//         ...values,
//         userId: values?.userId,
//         status: 'Forwarded',
//       });
//     },
//     onSuccess: () => {
//       message.success('Document has been successfully forwarded!');
//       form.resetFields();
//       queryClient.invalidateQueries({ queryKey: ['trail'] });

//       return navigate('/incoming');
//     },
//     onError: (err) => message.error(err.message),
//   });

//   const { data: divisions } = useQuery({
//     queryKey: ['divisions'],
//     queryFn: () => axiosInstance.get('/division'),
//   });

//   const { data: departments } = useQuery({
//     queryKey: ['departments', selectedDivision],
//     queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
//     enabled: !!selectedDivision,
//   });

//   const { data: users } = useQuery({
//     queryKey: ['users', selectedDepartment],
//     queryFn: () => axiosInstance.get(`/all-users/${selectedDepartment}`),
//     enabled: !!selectedDepartment,
//   });

//   const handleDivisionChange = (value) => setSelectedDivision(value);
//   const handleDepartmentChange = (value) => setSelectedDepartment(value);

//   const handleSubmit = (values) => {
//     forwardDocument(values);
//   };

//   const budgetColums = [
//     {
//       title: 'Item',
//       key: 'item',
//       dataIndex: ['budgetItem', 'item'],
//     },
//     {
//       title: 'Amount',
//       key: 'amount',
//       dataIndex: 'amount',
//       render: (value) => <span>{value && `¢${formatMoney(value)}`}</span>,
//     },
//     {
//       title: 'Allocation',
//       key: 'amount',
//       dataIndex: ['budgetItem', 'amount'],
//       render: (value) => <span>{`¢${formatMoney(value)}`}</span>,
//     },

//     {
//       title: 'Balance',
//       dataIndex: 'balance',
//       key: 'balance',
//       render: (value, record) => (
//         <span>
//           {(value && `¢${formatMoney(value)}`) ||
//             `¢${formatMoney(record?.amount)}`}
//         </span>
//       ),
//     },
//     hasPermission(authUser?.role[0].rolePermissions, [
//       requiredPermissions.UPDATE_DOCUMENT_AMOUNT,
//     ]) && {
//       title: 'Action',
//       dataIndex: 'id',
//       key: 'id',
//       render: (value) => {
//         return (
//           <Tooltip title="Edit Amount">
//             <EditOutlined
//               className="cursor-pointer"
//               onClick={() => {
//                 setShowModal(true);
//                 setSelectedBudgetItem(value);
//               }}
//             />
//           </Tooltip>
//         );
//       },
//     },
//   ];

//   const _data = document?.data?.document.budgetAllocations.map((item) => ({
//     ...item,
//     key: item.id,
//   }));

//   const { mutate: approveDoc, isPending: approvalLoading } = useMutation({
//     mutationKey: 'approveDoc',
//     mutationFn: () => {
//       return approveDocument(docId);
//     },
//     onSuccess: () => {
//       message.success('Request approved successfully');
//       refetch();
//     },
//     onError: (err) => {
//       message.error(err?.response?.data?.error);
//     },
//   });

//   const { mutate: updateAmount, isPending } = useMutation({
//     mutationKey: 'updateBudgetAmount',
//     mutationFn: () => {
//       return updateBudgetAmount(selectedBudgetItem);
//     },
//     onSuccess: () => {
//       message.success('Amount Updated Successfully');
//     },
//     onError: (err) => {
//       message.error('Error updating amount', err?.response?.data?.err);
//     },
//   });

//   const handleAmountUpdate = (values) => {
//     updateAmount(values);
//   };

//   return (
//     <div className="h-full">
//       <Modal
//         open={showModal}
//         onCancel={() => setShowModal(false)}
//         centered
//         footer={false}
//       >
//         <div className="mt-3">
//           <Form
//             layout="vertical"
//             onFinish={(values) => handleAmountUpdate(values)}
//           >
//             <Form.Item name="amount" label="Amount">
//               <InputNumber className="w-full" placeholder="Enter Amount...." />
//             </Form.Item>
//             <Button
//               className="w-full bg-[#582F08]"
//               htmlType="submit"
//               type="primary"
//               loading={isPending}
//             >
//               Submit
//             </Button>
//           </Form>
//         </div>
//       </Modal>

//       <Content className="p-4 h-full">
//         <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
//           {/* Document Preview Section */}
//           <Card
//             bordered={false}
//             className="h-full"
//             bodyStyle={{
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column',
//               padding: '16px',
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <h1 className="font-semibold  text-xl  flex-shrink-0">
//                 {document && document?.data?.document?.subject}
//               </h1>
//               {document &&
//                 document?.data?.document?.attachments?.length > 0 && (
//                   <span
//                     className="text-blue-400 cursor-pointer underline "
//                     onClick={() => {
//                       navigate(`/view-attachment/${docId}`);
//                     }}
//                   >
//                     View Files
//                   </span>
//                 )}
//             </div>

//             <div className="flex-1 overflow-hidden rounded-lg mb-4 bg-white ">
//               {fileUrl ? (
//                 <div className="text-center">
//                   {fileUrl && !isLoading ? (
//                     <iframe src={fileUrl} width="100%" height="650px" />
//                   ) : (
//                     <Loader />
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-7 justify-center items-center w-full h-full">
//                   <img
//                     src={pdf}
//                     className="w-[50%] h-[50%] cursor-not-allowed"
//                   />
//                   <p className="text-[#582F08]">No File Attached </p>
//                 </div>
//               )}
//             </div>
//             <Card
//               bordered={false}
//               className="bg-[#582F08]/5 flex-shrink-0"
//               bodyStyle={{ padding: '16px' }}
//             >
//               {document?.data?.document?.documentType === 'BudgetRelease' && (
//                 <Table
//                   dataSource={_data}
//                   columns={budgetColums}
//                   pagination={false}
//                 />
//               )}

//               {hasPermission(user?.role[0].rolePermissions, [
//                 requiredPermissions.APPROVE_DOCUMENT,
//               ]) &&
//                 !document?.data?.document?.isApproved &&
//                 document?.data?.document?.documentType !== 'General' && (
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={approvalLoading}
//                     icon={<FaHandshake className="w-4 h-4" />}
//                     className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80 w-full mt-6"
//                     onClick={() => approveDoc()}
//                   >
//                     Approve
//                   </Button>
//                 )}
//             </Card>
//           </Card>

//           {/* Comments Section */}
//           <Card
//             bordered={false}
//             className="h-full"
//             bodyStyle={{
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column',
//               padding: '16px',
//             }}
//           >
//             <div className="flex items-center gap-2 mb-4 flex-shrink-0">
//               <LuMessageSquare className="w-6 h-6" />
//               <Title level={4} style={{ margin: 0 }}>
//                 Comments
//               </Title>
//             </div>

//             <div
//               className="flex-1 bg-[#e4c8ad] rounded-lg p-4 overflow-y-auto mb-4"
//               style={{
//                 height: 'calc(100vh - 20rem)',
//                 minHeight: '200px',
//                 maxHeight: 'calc(100vh - 20rem)',
//               }}
//             >
//               {document &&
//                 document?.data.document.comments.map((comment) => (
//                   <div
//                     key={comment.id}
//                     className={`flex ${
//                       comment.userId === user?.userId
//                         ? 'justify-end'
//                         : 'justify-start'
//                     } mb-4`}
//                   >
//                     <div
//                       className={`flex gap-3 max-w-[80%] ${
//                         comment.userId === user?.userId
//                           ? 'flex-row-reverse'
//                           : 'flex-row'
//                       }`}
//                     >
//                       <Avatar icon={<LuUser className="w-5 h-5" />} />
//                       <div
//                         className={`rounded-lg p-4 ${
//                           comment.userId === user?.userId
//                             ? 'bg-[#582F08] text-white'
//                             : 'bg-[#9d4d01] text-white'
//                         }`}
//                       >
//                         <p className="font-medium text-sm">
//                           {comment.user?.name}
//                         </p>
//                         <p className="mt-1">{comment.body}</p>
//                         <p className="text-xs mt-2 opacity-75">
//                           {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>

//             <Form
//               onFinish={handleSubmit}
//               layout="vertical"
//               className="flex-shrink-0"
//               form={form}
//             >
//               <Form.Item
//                 name="divisionId"
//                 label="Division"
//                 rules={[{ required: true, message: 'Choose your Division!' }]}
//               >
//                 <Select
//                   placeholder="Choose your Division"
//                   allowClear
//                   options={divisions?.data?.map((division) => ({
//                     label: division?.divisionName,
//                     value: division?.divisionId,
//                   }))}
//                   onChange={handleDivisionChange}
//                 />
//               </Form.Item>

//               <Form.Item
//                 name="departmentId"
//                 label="Department"
//                 rules={[{ required: true, message: 'Choose your Department!' }]}
//               >
//                 <Select
//                   placeholder="Choose your Department"
//                   allowClear
//                   options={departments?.data?.data?.map((department) => ({
//                     label: department?.departmentName,
//                     value: department?.departmentId,
//                   }))}
//                   onChange={handleDepartmentChange}
//                 />
//               </Form.Item>

//               <Form.Item
//                 name="userId"
//                 label="Recipient"
//                 rules={[{ required: true, message: 'Select a User!' }]}
//               >
//                 <Select
//                   placeholder="Select a User"
//                   allowClear
//                   options={users?.data
//                     ?.filter((emp) => emp.userId !== user?.userId)
//                     .map((user) => ({
//                       label: user?.name,
//                       value: user?.userId,
//                     }))}
//                 />
//               </Form.Item>

//               <Form.Item label="Comment" name="comment" className="mb-2">
//                 <Mentions
//                   style={{ width: '100%' }}
//                   value={newComment}
//                   autoSize={{ minRows: 2, maxRows: 3 }}
//                   onChange={(value) => {
//                     setNewComment(value);
//                   }}
//                   onSelect={(onSelect) => console.log(onSelect)}
//                   options={
//                     users &&
//                     users?.data?.map((user) => ({
//                       label: user.name,
//                       value: user.name,
//                     }))
//                   }
//                 />
//               </Form.Item>

//               <Form.Item className="mb-0">
//                 <div className="flex gap-4">
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     icon={<LuSend className="w-4 h-4" />}
//                     className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
//                     loading={submitLoading}
//                   >
//                     Send
//                   </Button>
//                   {hasPermission(user?.role[0].rolePermissions, [
//                     requiredPermissions.ARCHIVE_DOCUMENT,
//                   ]) && (
//                     <Button
//                       icon={<LuArchive className="w-4 h-4" />}
//                       className="flex-1 bg-[#9d4d01] hover:bg-[#9d4d01]/80 text-white"
//                       onClick={() => {
//                         setShowArchiveModal(true);
//                       }}
//                     >
//                       Archive
//                     </Button>
//                   )}
//                 </div>
//               </Form.Item>
//             </Form>
//           </Card>
//         </div>
//       </Content>
//       {openFileViewer && (
//         <PDFViewer
//           fileId={document?.data?.document?.file?.fileId}
//           fileName={document?.data?.document?.file?.fileName}
//         />
//       )}
//       {showArchiveModal && (
//         <ArchiveFiles
//           show={showArchiveModal}
//           record={document?.data.document}
//           setShow={setShowArchiveModal}
//         />
//       )}
//     </div>
//   );
// }

// export default ViewDocument;

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
import { hasPermission, requiredPermissions } from '../../utils/Roles';
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
  const [form] = Form.useForm();

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
      form.resetFields();
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

  const { mutate: updateAmount, isPending: isUpdatingAmount } = useMutation({
    mutationKey: ['updateBudgetAmount', selectedBudgetItem],
    mutationFn: (values) => updateBudgetAmount(selectedBudgetItem, values),
    onSuccess: () => {
      message.success('Amount updated successfully');
      setShowModal(false);
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to update amount');
    },
  });

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
      render: (value, record) => (
        <span>
          {(value && `¢${formatMoney(value)}`) ||
            `¢${formatMoney(record?.amount)}`}
        </span>
      ),
    },
    ...(hasPermission(authUser?.role[0]?.rolePermissions, [
      requiredPermissions.UPDATE_DOCUMENT_AMOUNT,
    ])
      ? [
          {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            render: (value) => (
              <Tooltip title="Edit Amount">
                <EditOutlined
                  className="cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setSelectedBudgetItem(value);
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
          onFinish={handleAmountUpdate}
          initialValues={{ amount: 0 }}
        >
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter an amount' }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Enter amount..."
              min={0}
              step={0.01}
              precision={2}
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

              {hasPermission(user?.role[0]?.rolePermissions, [
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

            <Form
              onFinish={handleSubmit}
              layout="vertical"
              className="flex-shrink-0"
              form={form}
            >
              <Form.Item
                name="divisionId"
                label="Division"
                rules={[{ required: true, message: 'Division is required' }]}
              >
                <Select
                  placeholder="Select division"
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
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Select
                  placeholder="Select department"
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
                  {hasPermission(user?.role[0]?.rolePermissions, [
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
        />
      )}
    </div>
  );
}

export default ViewDocument;
