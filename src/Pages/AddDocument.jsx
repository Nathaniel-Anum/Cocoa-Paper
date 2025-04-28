// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //   MinusCircleOutlined,
// // //   PlusCircleOutlined,
// // //   PlusOutlined,
// // //   UploadOutlined,
// // // } from '@ant-design/icons';
// // // import {
// // //   Form,
// // //   Input,
// // //   Select,
// // //   message,
// // //   Button,
// // //   Upload,
// // //   Checkbox,
// // //   InputNumber,
// // //   Tooltip,
// // // } from 'antd';
// // // import axiosInstance from '../Components/axiosInstance';
// // // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // // import Lottie from 'react-lottie';
// // // import CreateDoc from '../../src/lotties/create-doc.json';
// // // import { useUser } from './CustomHook/useUser';
// // // import { addDocument, uploadFile } from '../http/addDocument';
// // // import TextArea from 'antd/es/input/TextArea';
// // // import { useGetAllBudgets } from '../queryHooks/budget';
// // // import { useNavigate } from 'react-router-dom';

// // // const AddDocument = () => {
// // //   const queryClient = useQueryClient();
// // //   const defaultOptions = {
// // //     loop: true,
// // //     autoplay: true,
// // //     animationData: CreateDoc,
// // //     rendererSettings: {
// // //       preserveAspectRatio: 'xMidYMid slice',
// // //     },
// // //   };

// // //   const [form] = Form.useForm();
// // //   const [selectedDivision, setSelectedDivision] = useState('');
// // //   const [selectedDepartment, setSelectedDepartment] = useState('');
// // //   const [loading, setLoading] = useState(false);
// // //   const [requestType, setRequestType] = useState('');
// // //   const [isPhysical, setIsPhysical] = useState(false);
// // //   const { user } = useUser();
// // //   const [budgetUnits, setBudgetUnits] = useState([]);
// // //   const [selectedCategories, setSelectedCategories] = useState([]);

// // //   const { data: divisions } = useQuery({
// // //     queryKey: ['divisions'],
// // //     queryFn: () => axiosInstance.get('/division'),
// // //   });

// // //   const { data: departments } = useQuery({
// // //     queryKey: ['departments', selectedDivision],
// // //     queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
// // //     enabled: !!selectedDivision,
// // //   });

// // //   // useEffect(() => {
// // //   //   if (selectedDivision) {
// // //   //     form.setFieldValue('departmentId', '');
// // //   //   }
// // //   // }, [selectedDivision]);

// // //   const { data: users } = useQuery({
// // //     queryKey: ['users', selectedDepartment],
// // //     queryFn: () => axiosInstance.get(`/all-users/${selectedDepartment}`),
// // //     enabled: !!selectedDepartment,
// // //   });

// // //   // useEffect(() => {
// // //   //   if (selectedDepartment) {
// // //   //     form.setFieldValue('userId', '');
// // //   //   }
// // //   // }, [selectedDepartment]);

// // //   const handleDivisionChange = (value) => setSelectedDivision(value);
// // //   const handleDepartmentChange = (value) => setSelectedDepartment(value);
// // //   const handleUserChange = (value) => console.log(`selected User: ${value}`);

// // //   const handleRequestChange = (value) => setRequestType(value);

// // //   // const { mutate: startDocument, isPending } = useMutation({
// // //   //   mutationKey: 'addDoc',
// // //   //   mutationFn: (data) => addDocument(data),
// // //   //   onSuccess: () => message.success('Document Created Successfully!'),
// // //   //   onError: (err) => message.error(err.message),
// // //   // });

// // //   const navigate = useNavigate();

// // //   const { mutate: startDocument, isPending } = useMutation({
// // //     mutationKey: 'document',
// // //     mutationFn: (values) => {
// // //       console.log(values);
// // //       return addDocument(values);
// // //     },
// // //     onSuccess: () => {
// // //       setLoading(false);
// // //       message.success('Document Created Successfully!');
// // //       form.resetFields();
// // //       queryClient.invalidateQueries({ queryKey: ['trail'] });
// // //       return isPhysical ? navigate('/physicalDocs') : navigate('/outgoing');
// // //     },
// // //     onError: (error) => {
// // //       setLoading(false);
// // //       message.error(error?.response?.data?.error);
// // //     },
// // //   });

// // //   const { mutate: uploadDoc } = useMutation({
// // //     mutationKey: 'upload',
// // //     mutationFn: (data) => {
// // //       uploadFile(data)
// // //         .then((response) => {
// // //           // console.log(response?.data?.newFile?.fileId);
// // //           startDocument({
// // //             ...form.getFieldsValue(),
// // //             fileId: response?.data?.newFile?.fileId,
// // //           });
// // //           // Optionally trigger document mutation here
// // //         })
// // //         .catch((err) => message.error(err.response?.data?.msg));
// // //     },
// // //   });

// // //   const { data: budgetaryItems } = useGetAllBudgets();

// // //   const handleItemCategoryChange = (selectedCategoryIds) => {
// // //     setSelectedCategories(selectedCategoryIds);

// // //     const selectedItems = budgetaryItems?.data?.data?.filter((item) =>
// // //       selectedCategoryIds.includes(item?.id)
// // //     );

// // //     const allBudgetItems =
// // //       selectedItems?.flatMap((item) => item?.budgetItems) || [];

// // //     const uniqueItems = Array.from(
// // //       new Map(allBudgetItems.map((item) => [item.id, item])).values()
// // //     );

// // //     setBudgetUnits(uniqueItems);
// // //     form.setFieldValue('budgetaryItem', []);
// // //   };

// // //   // useEffect(() => {
// // //   //   form.setFieldValue('departmentId', '');
// // //   //   if (requestType === 'BUDGET_RELEASE') {
// // //   //     const division = divisions?.data?.find(
// // //   //       (div) => div?.divisionName === 'COCOBOD'
// // //   //     );
// // //   //     if (division) setSelectedDivision(division?.divisionId);
// // //   //   }
// // //   // }, [requestType]);

// // //   const props = {
// // //     name: 'file',
// // //     beforeUpload: () => false,
// // //     onChange(info) {
// // //       if (info.file.status === 'done') {
// // //         message.success(`${info.file.name} uploaded successfully`);
// // //       } else if (info.file.status === 'error') {
// // //         message.error(`${info.file.name} upload failed.`);
// // //       }
// // //     },
// // //   };

// // //   const handleSubmit = (values) => {
// // //     const _values = { ...values, physicalDoc: isPhysical };
// // //     setLoading(true);
// // //     if (_values['physicalDoc'] === false || values['file']) {
// // //       const formData = new FormData();
// // //       formData.append('file', _values['file'].file);
// // //       formData.append('ref', _values.ref);
// // //       formData.append('subject', _values.subject);
// // //       uploadDoc(formData);
// // //     } else {
// // //       startDocument(_values);
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <div className="w-[60%] mx-auto">
// // //         <div className="bg-white rounded-md px-[3rem]">
// // //           <p className="font-bold text-[29px] text-[#694421] py-2">
// // //             Add Document
// // //             <div className="w-[11rem] h-1 bg-[#694421]"></div>
// // //           </p>

// // //           <div className="py-6 ">
// // //             <Form
// // //               form={form}
// // //               layout="vertical"
// // //               name="Add Document"
// // //               onFinish={handleSubmit}
// // //             >
// // //               <Form.Item name="documentType" label="Request Type" required>
// // //                 <Select
// // //                   placeholder="Select Request Type"
// // //                   onChange={handleRequestChange}
// // //                   options={[
// // //                     { label: 'General', value: 'GENERAL' },
// // //                     { label: 'Budget Release', value: 'BudgetRelease' },
// // //                     { label: 'Out of Budget', value: 'OutOfBudgetRelease' },
// // //                   ]}
// // //                 />
// // //               </Form.Item>

// // //               <Form.Item
// // //                 label="Reference"
// // //                 name="ref"
// // //                 rules={[
// // //                   { required: true, message: 'Please input a Reference!' },
// // //                 ]}
// // //               >
// // //                 <Input placeholder="Input a Reference Number" />
// // //               </Form.Item>

// // //               <Form.Item
// // //                 label="Subject"
// // //                 name="subject"
// // //                 rules={[{ required: true, message: 'Please input a Subject' }]}
// // //               >
// // //                 <Input placeholder="Input a Subject" />
// // //               </Form.Item>

// // //               {(requestType === 'BudgetRelease' ||
// // //                 requestType === 'OutOfBudgetRelease') && (
// // //                 <Form.Item
// // //                   label="Amount"
// // //                   name="amount"
// // //                   rules={[
// // //                     { required: true, message: 'Please input an amount' },
// // //                   ]}
// // //                 >
// // //                   <InputNumber
// // //                     type="number"
// // //                     placeholder="Input an Amount"
// // //                     className="w-full"
// // //                   />
// // //                 </Form.Item>
// // //               )}

// // //               {requestType === 'BudgetRelease' && (
// // //                 <>
// // //                   <Form.Item name="itemCategory" required label="Item Category">
// // //                     <Select
// // //                       mode="multiple"
// // //                       placeholder="Choose Item Categories"
// // //                       onChange={handleItemCategoryChange}
// // //                       options={budgetaryItems?.data?.data.map((item) => ({
// // //                         label: item?.name,
// // //                         value: item?.id,
// // //                       }))}
// // //                     />
// // //                   </Form.Item>

// // //                   <Form.Item
// // //                     name="budgetItemIds"
// // //                     required
// // //                     label="Budgetary Item"
// // //                   >
// // //                     <Select
// // //                       mode="multiple"
// // //                       placeholder="Choose Budgetary Items"
// // //                       options={budgetUnits.map((item) => ({
// // //                         label: item?.item,
// // //                         value: item?.id,
// // //                       }))}
// // //                     />
// // //                   </Form.Item>

// // //                   <Form.List name="budgetItems">
// // //                     {(fields, { add, remove }) => (
// // //                       <>
// // //                         {fields.map(({ key, name, ...restField }) => (
// // //                           <div
// // //                             key={key}
// // //                             className="flex justify-between items-center gap-2 w-[inherit]"
// // //                           >
// // //                             <Form.Item
// // //                               name="itemCategory"
// // //                               required
// // //                               label="Item Category"
// // //                             >
// // //                               <Select
// // //                                 // mode="multiple"
// // //                                 placeholder="Choose Item Categories"
// // //                                 className="w-full"
// // //                                 onChange={handleItemCategoryChange}
// // //                                 options={budgetaryItems?.data?.data.map(
// // //                                   (item) => ({
// // //                                     label: item?.name,
// // //                                     value: item?.id,
// // //                                   })
// // //                                 )}
// // //                               />
// // //                             </Form.Item>

// // //                             <Form.Item
// // //                               name="budgetItemIds"
// // //                               required
// // //                               label="Budgetary Item"
// // //                             >
// // //                               <Select
// // //                                 // mode="multiple"
// // //                                 className="w-full"
// // //                                 placeholder="Choose Budgetary Items"
// // //                                 options={budgetUnits.map((item) => ({
// // //                                   label: item?.item,
// // //                                   value: item?.id,
// // //                                 }))}
// // //                               />
// // //                             </Form.Item>

// // //                             <Form.Item
// // //                               {...restField}
// // //                               name={[name, 'quantity']}
// // //                               label="Quantity"
// // //                               className="w-full"
// // //                             >
// // //                               <InputNumber
// // //                                 className="w-full"
// // //                                 placeholder="Quantity"
// // //                               />
// // //                             </Form.Item>

// // //                             <Form.Item
// // //                               {...restField}
// // //                               name={[name, 'amount']}
// // //                               label="Amount"
// // //                               rules={[
// // //                                 {
// // //                                   required: true,
// // //                                   message: 'Amount is required',
// // //                                 },
// // //                               ]}
// // //                               className="w-full"
// // //                             >
// // //                               <InputNumber
// // //                                 className="w-full"
// // //                                 placeholder="Amount"
// // //                               />
// // //                             </Form.Item>

// // //                             <div className="flex items-center ">
// // //                               <MinusCircleOutlined
// // //                                 onClick={() => remove(name)}
// // //                                 className="text-red-500 text-xl cursor-pointer"
// // //                               />
// // //                             </div>
// // //                           </div>
// // //                         ))}

// // //                         <Form.Item>
// // //                           <Tooltip title="Add Budget Item">
// // //                             <PlusCircleOutlined
// // //                               onClick={() => add()}
// // //                               className="text-2xl text-green-600 cursor-pointer flex justify-center"
// // //                             />
// // //                           </Tooltip>
// // //                         </Form.Item>
// // //                       </>
// // //                     )}
// // //                   </Form.List>
// // //                 </>
// // //               )}

// // //               <Form.Item name="quantity" label="Quantity">
// // //                 <InputNumber
// // //                   placeholder="Enter Quantity if applicable"
// // //                   className="w-full"
// // //                 />
// // //               </Form.Item>

// // //               <Form.Item
// // //                 name="divisionId"
// // //                 label="Division"
// // //                 rules={[{ required: true, message: 'Choose your Division!' }]}
// // //               >
// // //                 <Select
// // //                   placeholder="Choose your Division"
// // //                   allowClear
// // //                   options={divisions?.data.map((division) => ({
// // //                     label: division?.divisionName,
// // //                     value: division?.divisionId,
// // //                   }))}
// // //                   onChange={handleDivisionChange}
// // //                 />
// // //               </Form.Item>

// // //               <Form.Item
// // //                 name="departmentId"
// // //                 label="Department"
// // //                 rules={[{ required: true, message: 'Choose your Department!' }]}
// // //               >
// // //                 <Select
// // //                   placeholder="Choose your Department"
// // //                   allowClear
// // //                   options={departments?.data?.data?.map((department) => ({
// // //                     label: department?.departmentName,
// // //                     value: department?.departmentId,
// // //                   }))}
// // //                   onChange={handleDepartmentChange}
// // //                 />
// // //               </Form.Item>

// // //               <Form.Item
// // //                 name="userId"
// // //                 label="Recipient"
// // //                 rules={[{ required: true, message: 'Select a User!' }]}
// // //               >
// // //                 <Select
// // //                   placeholder="Select a User"
// // //                   allowClear
// // //                   options={users?.data
// // //                     ?.filter((emp) => emp.userId !== user?.userId)
// // //                     .map((user) => ({
// // //                       label: user?.name,
// // //                       value: user?.userId,
// // //                     }))}
// // //                   onChange={handleUserChange}
// // //                 />
// // //               </Form.Item>

// // //               <Form.Item label="Comment" name="comment">
// // //                 <TextArea rows={4} placeholder="Enter Comment...." />
// // //               </Form.Item>

// // //               <Form.Item name={'physicalDoc'}>
// // //                 <Checkbox onChange={(e) => setIsPhysical(e.target.checked)}>
// // //                   Physical Document?
// // //                 </Checkbox>
// // //               </Form.Item>

// // //               {!isPhysical && (
// // //                 <Form.Item name="file">
// // //                   <Upload {...props}>
// // //                     <Button
// // //                       style={{ width: '100%' }}
// // //                       icon={<UploadOutlined />}
// // //                       className="cursor-pointer"
// // //                     >
// // //                       Upload PDF
// // //                     </Button>
// // //                   </Upload>
// // //                 </Form.Item>
// // //               )}

// // //               <Form.Item>
// // //                 <Button
// // //                   type="primary"
// // //                   htmlType="submit"
// // //                   className="bg-[#582F08] text-white px-5 w-full py-1"
// // //                   loading={isPending}
// // //                 >
// // //                   Send
// // //                 </Button>
// // //               </Form.Item>
// // //             </Form>
// // //           </div>
// // //         </div>

// // //         {/* <div className="fixed top-[16rem] right-20">
// // //           <Lottie options={defaultOptions} height={450} width={450} />
// // //         </div> */}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AddDocument;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   MinusCircleOutlined,
// //   PlusCircleOutlined,
// //   PlusOutlined,
// //   UploadOutlined,
// // } from '@ant-design/icons';
// // import {
// //   Form,
// //   Input,
// //   Select,
// //   message,
// //   Button,
// //   Upload,
// //   Checkbox,
// //   InputNumber,
// //   Tooltip,
// //   Row,
// //   Col,
// // } from 'antd';
// // import axiosInstance from '../Components/axiosInstance';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import Lottie from 'react-lottie';
// // import CreateDoc from '../../src/lotties/create-doc.json';
// // import { useUser } from './CustomHook/useUser';
// // import { addDocument, uploadFile } from '../http/addDocument';
// // import TextArea from 'antd/es/input/TextArea';
// // import { useGetAllBudgets } from '../queryHooks/budget';
// // import { useNavigate } from 'react-router-dom';

// // const AddDocument = () => {
// //   const queryClient = useQueryClient();
// //   const defaultOptions = {
// //     loop: true,
// //     autoplay: true,
// //     animationData: CreateDoc,
// //     rendererSettings: {
// //       preserveAspectRatio: 'xMidYMid slice',
// //     },
// //   };

// //   const [form] = Form.useForm();
// //   const [selectedDivision, setSelectedDivision] = useState('');
// //   const [selectedDepartment, setSelectedDepartment] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [requestType, setRequestType] = useState('');
// //   const [isPhysical, setIsPhysical] = useState(false);
// //   const { user } = useUser();
// //   const [budgetUnits, setBudgetUnits] = useState([]);
// //   const [selectedCategories, setSelectedCategories] = useState([]);

// //   const { data: divisions } = useQuery({
// //     queryKey: ['divisions'],
// //     queryFn: () => axiosInstance.get('/division'),
// //   });

// //   const { data: departments } = useQuery({
// //     queryKey: ['departments', selectedDivision],
// //     queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
// //     enabled: !!selectedDivision,
// //   });

// //   const { data: users } = useQuery({
// //     queryKey: ['users', selectedDepartment],
// //     queryFn: () => axiosInstance.get(`/all-users/${selectedDepartment}`),
// //     enabled: !!selectedDepartment,
// //   });

// //   const handleDivisionChange = (value) => setSelectedDivision(value);
// //   const handleDepartmentChange = (value) => setSelectedDepartment(value);
// //   const handleUserChange = (value) => console.log(`selected User: ${value}`);

// //   const handleRequestChange = (value) => setRequestType(value);

// //   const navigate = useNavigate();

// //   const { mutate: startDocument, isPending } = useMutation({
// //     mutationKey: 'document',
// //     mutationFn: (values) => {
// //       console.log('Starting document creation with:', values);
// //       return addDocument(values);
// //     },
// //     onSuccess: () => {
// //       setLoading(false);
// //       message.success('Document Created Successfully!');
// //       form.resetFields();
// //       queryClient.invalidateQueries({ queryKey: ['trail'] });
// //       return isPhysical ? navigate('/physicalDocs') : navigate('/outgoing');
// //     },
// //     onError: (error) => {
// //       console.log('Document creation error:', error);
// //       setLoading(false);

// //       // Handle different error response formats
// //       if (error?.response?.data?.error) {
// //         if (Array.isArray(error.response.data.error)) {
// //           error.response.data.error.forEach((e) => message.error(e.msg || e));
// //         } else {
// //           message.error(
// //             typeof error.response.data.error === 'string'
// //               ? error.response.data.error
// //               : 'Document creation failed'
// //           );
// //         }
// //       } else {
// //         message.error('Failed to create document. Please try again.');
// //       }
// //     },
// //   });

// //   const { mutate: uploadDoc, isLoading: isUploading } = useMutation({
// //     mutationKey: 'upload',
// //     mutationFn: async (data) => {
// //       console.log('Starting file upload with:', data);
// //       try {
// //         const response = await uploadFile(data);
// //         console.log('Upload response:', response);
// //         return response?.data?.newFile?.fileId;
// //       } catch (err) {
// //         console.log('Upload error:', err);
// //         // Convert error to a format that will be handled by onError
// //         throw err;
// //       }
// //     },
// //     onSuccess: (fileId) => {
// //       console.log('Upload successful, fileId:', fileId);
// //       const values = form.getFieldsValue();
// //       startDocument({ ...values, fileId });
// //     },
// //     onError: (err) => {
// //       console.log('Upload error in onError handler:', err);
// //       setLoading(false);

// //       if (err?.response?.data?.error) {
// //         if (Array.isArray(err.response.data.error)) {
// //           err.response.data.error.forEach((e) => message.error(e.msg || e));
// //         } else {
// //           message.error(
// //             typeof err.response.data.error === 'string'
// //               ? err.response.data.error
// //               : 'File upload failed'
// //           );
// //         }
// //       } else if (err?.response?.data?.msg) {
// //         message.error(err.response.data.msg);
// //       } else {
// //         message.error('File upload failed. Please try again.');
// //       }
// //     },
// //   });

// //   const { data: budgetaryItems } = useGetAllBudgets();

// //   const handleItemCategoryChange = (selectedCategoryId) => {
// //     // console.log({ selectedCategoryId });

// //     const selectedBudget = budgetaryItems?.data?.data?.find(
// //       (item) => selectedCategoryId === item.id
// //     );

// //     console.log({ selectedBudget });

// //     setBudgetUnits(
// //       selectedBudget?.budgetItems?.map((unit) => ({
// //         label: unit.item,
// //         value: unit.id,
// //       }))
// //     );
// //   };

// //   const props = {
// //     name: 'file',
// //     beforeUpload: () => false,
// //     onChange(info) {
// //       if (info.file.status === 'done') {
// //         message.success(`${info.file.name} uploaded successfully`);
// //       } else if (info.file.status === 'error') {
// //         message.error(`${info.file.name} upload failed.`);
// //       }
// //     },
// //   };

// //   const handleSubmit = (values) => {
// //     const _values = { ...values, physicalDoc: isPhysical };
// //     console.log('Form submission values:', _values);

// //     setLoading(true);

// //     // Logic fix: Upload file if NOT physical document AND file exists
// //     if (!isPhysical && values.file && values.file.file) {
// //       const formData = new FormData();
// //       formData.append('file', _values.file.file);
// //       formData.append('ref', _values.ref);
// //       formData.append('subject', _values.subject);
// //       uploadDoc(formData);
// //     } else {
// //       // Direct document creation without file
// //       startDocument(_values);
// //     }
// //   };

// //   return (
// //     <div className="py-6 px-4">
// //       <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow-md">
// //         <div className="px-8 py-6">
// //           <div className="pb-4">
// //             <p className="font-bold text-2xl text-[#694421]">
// //               Add Document
// //               <div className="w-44 h-1 bg-[#694421] mt-1"></div>
// //             </p>
// //           </div>

// //           <div className="py-4">
// //             <Form
// //               form={form}
// //               layout="vertical"
// //               name="Add Document"
// //               onFinish={handleSubmit}
// //             >
// //               <Form.Item name="documentType" label="Request Type" required>
// //                 <Select
// //                   placeholder="Select Request Type"
// //                   onChange={handleRequestChange}
// //                   options={[
// //                     { label: 'General Correspondence', value: 'GENERAL' },
// //                     { label: 'Budget Release', value: 'BudgetRelease' },
// //                     {
// //                       label: 'Out of Budget Release',
// //                       value: 'OutOfBudgetRelease',
// //                     },
// //                   ]}
// //                 />
// //               </Form.Item>

// //               <Form.Item
// //                 label="Reference"
// //                 name="ref"
// //                 rules={[
// //                   { required: true, message: 'Please input a Reference!' },
// //                 ]}
// //               >
// //                 <Input placeholder="Input a Reference Number" />
// //               </Form.Item>

// //               <Form.Item
// //                 label="Subject"
// //                 name="subject"
// //                 rules={[{ required: true, message: 'Please input a Subject' }]}
// //               >
// //                 <Input placeholder="Input a Subject" />
// //               </Form.Item>

// //               {requestType === 'OutOfBudgetRealease' && (
// //                 <Form.Item name="amount" label="Amount">
// //                   <InputNumber placeholder="Enter Amount" className="w-full" />
// //                 </Form.Item>
// //               )}

// //               {requestType === 'BudgetRelease' && (
// //                 <>
// //                   <Form.List name="budgetAllocations">
// //                     {(fields, { add, remove }) => (
// //                       <div className="border border-dashed p-5 mb-2">
// //                         {fields.map(({ key, name, ...restField }) => (
// //                           <div key={key} className="mb-4">
// //                             <Row gutter={16}>
// //                               <Col span={8}>
// //                                 <Form.Item
// //                                   {...restField}
// //                                   name={[name, 'itemCategory']}
// //                                   label="Item Category"
// //                                   rules={[
// //                                     { required: true, message: 'Required' },
// //                                   ]}
// //                                 >
// //                                   <Select
// //                                     placeholder="Item Category"
// //                                     onChange={(value) =>
// //                                       handleItemCategoryChange(value)
// //                                     }
// //                                     options={budgetaryItems?.data?.data?.map(
// //                                       (item) => ({
// //                                         label: item?.name,
// //                                         value: item?.id,
// //                                       })
// //                                     )}
// //                                   />
// //                                 </Form.Item>
// //                               </Col>
// //                               <Col span={8}>
// //                                 <Form.Item
// //                                   {...restField}
// //                                   name={[name, 'budgetItemId']}
// //                                   label="Budgetary Item"
// //                                   rules={[
// //                                     { required: true, message: 'Required' },
// //                                   ]}
// //                                 >
// //                                   <Select
// //                                     placeholder="Budgetary Items"
// //                                     options={budgetUnits || []}
// //                                   />
// //                                 </Form.Item>
// //                               </Col>

// //                               <Col span={7}>
// //                                 <Form.Item
// //                                   {...restField}
// //                                   name={[name, 'amount']}
// //                                   label="Amount"
// //                                   // rules={[
// //                                   //   { required: true, message: 'Required' },
// //                                   // ]}
// //                                 >
// //                                   <InputNumber
// //                                     placeholder="Amount"
// //                                     className="w-full"
// //                                   />
// //                                 </Form.Item>
// //                               </Col>
// //                               <Col
// //                                 span={1}
// //                                 className="flex items-center justify-center "
// //                               >
// //                                 <MinusCircleOutlined
// //                                   onClick={() => remove(name)}
// //                                   className="text-red-500 text-xl cursor-pointer"
// //                                 />
// //                               </Col>
// //                             </Row>
// //                             {/* <Row gutter={16}>

// //                             </Row> */}
// //                           </div>
// //                         ))}

// //                         <Form.Item>
// //                           <Button
// //                             type="dashed"
// //                             onClick={() => add()}
// //                             block
// //                             icon={<PlusOutlined />}
// //                             className="mt-2"
// //                           >
// //                             Add Budget Item
// //                           </Button>
// //                         </Form.Item>
// //                       </div>
// //                     )}
// //                   </Form.List>
// //                 </>
// //               )}

// //               {/* <Form.Item name="quantity" label="Quantity">
// //                 <InputNumber
// //                   placeholder="Enter Quantity if applicable"
// //                   className="w-full"
// //                 />
// //               </Form.Item> */}

// //               <Form.Item
// //                 name="divisionId"
// //                 label="Division"
// //                 rules={[{ required: true, message: 'Choose your Division!' }]}
// //               >
// //                 <Select
// //                   placeholder="Choose your Division"
// //                   allowClear
// //                   options={divisions?.data?.map((division) => ({
// //                     label: division?.divisionName,
// //                     value: division?.divisionId,
// //                   }))}
// //                   onChange={handleDivisionChange}
// //                 />
// //               </Form.Item>

// //               <Form.Item
// //                 name="departmentId"
// //                 label="Department"
// //                 rules={[{ required: true, message: 'Choose your Department!' }]}
// //               >
// //                 <Select
// //                   placeholder="Choose your Department"
// //                   allowClear
// //                   options={departments?.data?.data?.map((department) => ({
// //                     label: department?.departmentName,
// //                     value: department?.departmentId,
// //                   }))}
// //                   onChange={handleDepartmentChange}
// //                 />
// //               </Form.Item>

// //               <Form.Item
// //                 name="userId"
// //                 label="Recipient"
// //                 rules={[{ required: true, message: 'Select a User!' }]}
// //               >
// //                 <Select
// //                   placeholder="Select a User"
// //                   allowClear
// //                   options={users?.data
// //                     ?.filter((emp) => emp.userId !== user?.userId)
// //                     .map((user) => ({
// //                       label: user?.name,
// //                       value: user?.userId,
// //                     }))}
// //                   onChange={handleUserChange}
// //                 />
// //               </Form.Item>

// //               <Form.Item label="Comment" name="comment">
// //                 <TextArea rows={4} placeholder="Enter Comment...." />
// //               </Form.Item>

// //               <Form.Item name="physicalDoc">
// //                 <Checkbox onChange={(e) => setIsPhysical(e.target.checked)}>
// //                   Physical Document?
// //                 </Checkbox>
// //               </Form.Item>

// //               {!isPhysical && (
// //                 <Form.Item name="file" required>
// //                   <Upload {...props}>
// //                     <Button
// //                       style={{ width: '100%' }}
// //                       icon={<UploadOutlined />}
// //                       className="cursor-pointer"
// //                     >
// //                       Upload PDF
// //                     </Button>
// //                   </Upload>
// //                 </Form.Item>
// //               )}

// //               <Form.Item>
// //                 <Button
// //                   type="primary"
// //                   htmlType="submit"
// //                   className="bg-[#582F08] hover:bg-[#582F08]/90 text-white w-full py-1 h-10"
// //                   loading={isPending || loading}
// //                 >
// //                   Send
// //                 </Button>
// //               </Form.Item>
// //             </Form>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AddDocument;

// import React, { useState } from 'react';
// import {
//   MinusCircleOutlined,
//   PlusOutlined,
//   UploadOutlined,
// } from '@ant-design/icons';
// import {
//   Form,
//   Input,
//   Select,
//   message,
//   Button,
//   Upload,
//   Checkbox,
//   InputNumber,
//   Row,
//   Col,
//   Spin,
// } from 'antd';
// import axiosInstance from '../Components/axiosInstance';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Lottie from 'react-lottie';
// import CreateDoc from '../../src/lotties/create-doc.json';
// import { useUser } from './CustomHook/useUser';
// import { addDocument, uploadFile } from '../http/addDocument';
// import TextArea from 'antd/es/input/TextArea';
// import { useGetAllBudgets } from '../queryHooks/budget';
// import { useNavigate } from 'react-router-dom';

// const AddDocument = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const { user } = useUser();

//   // State variables
//   const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [requestType, setRequestType] = useState('');
//   const [isPhysical, setIsPhysical] = useState(false);
//   const [budgetUnits, setBudgetUnits] = useState([]);

//   // Animation options
//   const defaultOptions = {
//     loop: true,
//     autoplay: true,
//     animationData: CreateDoc,
//     rendererSettings: {
//       preserveAspectRatio: 'xMidYMid slice',
//     },
//   };

//   // Fetch divisions
//   const { data: divisions, isLoading: divisionsLoading } = useQuery({
//     queryKey: ['divisions'],
//     queryFn: async () => {
//       try {
//         const response = await axiosInstance.get('/division');
//         return response;
//       } catch (error) {
//         console.error('Error fetching divisions:', error);
//         message.error('Failed to load divisions');
//         return { data: [] };
//       }
//     },
//   });

//   // Fetch departments based on selected division
//   const { data: departments, isLoading: departmentsLoading } = useQuery({
//     queryKey: ['departments', selectedDivision],
//     queryFn: async () => {
//       try {
//         const response = await axiosInstance.get(
//           `/department/${selectedDivision}`
//         );
//         return response;
//       } catch (error) {
//         console.error('Error fetching departments:', error);
//         message.error('Failed to load departments');
//         return { data: { data: [] } };
//       }
//     },
//     enabled: !!selectedDivision,
//   });

//   // Fetch users based on selected department
//   const { data: users, isLoading: usersLoading } = useQuery({
//     queryKey: ['users', selectedDepartment],
//     queryFn: async () => {
//       try {
//         const response = await axiosInstance.get(
//           `/all-users/${selectedDepartment}`
//         );
//         return response;
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         message.error('Failed to load users');
//         return { data: [] };
//       }
//     },
//     enabled: !!selectedDepartment,
//   });

//   // Fetch budget items
//   const { data: budgetaryItems, isLoading: budgetsLoading } =
//     useGetAllBudgets();

//   // Document creation mutation
//   const { mutate: startDocument, isPending: isDocumentSubmitting } =
//     useMutation({
//       mutationKey: ['document'],
//       mutationFn: async (values) => {
//         console.log('Creating document with data:', values);
//         try {
//           const response = await addDocument(values);
//           return response;
//         } catch (error) {
//           console.error('Error in document creation:', error);
//           const errorMsg =
//             error?.response?.data?.error ||
//             error?.response?.data?.msg ||
//             error?.message ||
//             'Failed to create document';

//           throw new Error(errorMsg);
//         }
//       },
//       onSuccess: () => {
//         setLoading(false);
//         message.success('Document Created Successfully!');
//         form.resetFields();
//         queryClient.invalidateQueries({ queryKey: ['trail'] });
//         isPhysical ? navigate('/physicalDocs') : navigate('/outgoing');
//       },
//       onError: (error) => {
//         setLoading(false);
//         console.error('Document creation error:', error);
//         message.error(error.message || 'Failed to create document');
//       },
//     });

//   // File upload mutation
//   const { mutate: uploadDoc, isPending: isUploading } = useMutation({
//     mutationKey: ['upload'],
//     mutationFn: async (formData) => {
//       console.log('Uploading file...');
//       try {
//         const response = await uploadFile(formData);

//         if (!response?.data?.newFile?.fileId) {
//           throw new Error('No file ID returned from server');
//         }

//         return response.data.newFile.fileId;
//       } catch (error) {
//         console.error('Error in file upload:', error);
//         const errorMsg =
//           error?.response?.data?.error ||
//           error?.response?.data?.msg ||
//           error?.message ||
//           'Failed to upload file';

//         throw new Error(errorMsg);
//       }
//     },
//     onSuccess: (fileId) => {
//       console.log('File uploaded successfully with ID:', fileId);
//       const values = form.getFieldsValue();
//       startDocument({ ...values, fileId });
//     },
//     onError: (error) => {
//       setLoading(false);
//       console.error('File upload error:', error);
//       message.error(error.message || 'Failed to upload file');
//     },
//   });

//   // Event handlers
//   const handleDivisionChange = (value) => {
//     setSelectedDivision(value);
//     setSelectedDepartment('');
//     form.setFieldValue('departmentId', undefined);
//     form.setFieldValue('userId', undefined);
//   };

//   const handleDepartmentChange = (value) => {
//     setSelectedDepartment(value);
//     form.setFieldValue('userId', undefined);
//   };

//   const handleRequestChange = (value) => {
//     setRequestType(value);
//     // Reset related fields when request type changes
//     form.setFieldsValue({
//       budgetAllocations: undefined,
//       amount: undefined,
//     });
//   };

//   const handleItemCategoryChange = (categoryId, fieldKey) => {
//     const selectedBudget = budgetaryItems?.data?.data?.find(
//       (item) => item.id === categoryId
//     );

//     if (selectedBudget?.budgetItems) {
//       const options = selectedBudget.budgetItems.map((unit) => ({
//         label: unit.item,
//         value: unit.id,
//       }));

//       // Create a copy of the current budgetUnits
//       const updatedBudgetUnits = { ...budgetUnits };
//       // Update the specific fieldKey's options
//       updatedBudgetUnits[fieldKey] = options;
//       setBudgetUnits(updatedBudgetUnits);

//       // Reset the budgetItemId for this row
//       const budgetAllocations = form.getFieldValue('budgetAllocations');
//       if (budgetAllocations && budgetAllocations[fieldKey]) {
//         budgetAllocations[fieldKey].budgetItemId = undefined;
//         form.setFieldValue('budgetAllocations', budgetAllocations);
//       }
//     }
//   };

//   // Form submission handler
//   const handleSubmit = (values) => {
//     try {
//       setLoading(true);

//       // Prepare submission data
//       const submissionData = {
//         ...values,
//         physicalDoc: isPhysical,
//       };

//       console.log('Form submission values:', submissionData);

//       // Check if we need to upload a file first
//       if (!isPhysical && values.file && values.file.file) {
//         const formData = new FormData();
//         formData.append('file', values.file.file);
//         formData.append('ref', values.ref);
//         formData.append('subject', values.subject);
//         uploadDoc(formData);
//       } else {
//         // Direct document creation (no file)
//         startDocument(submissionData);
//       }
//     } catch (error) {
//       setLoading(false);
//       console.error('Error in form submission:', error);
//       message.error('Form submission failed');
//     }
//   };

//   // Upload configuration
//   const uploadProps = {
//     name: 'file',
//     beforeUpload: () => false, // Prevent auto upload
//     onChange(info) {
//       if (info.file.status !== 'uploading') {
//         console.log(info.file, info.fileList);
//       }
//     },
//   };

//   // Loading state
//   const isPageLoading =
//     divisionsLoading || departmentsLoading || usersLoading || budgetsLoading;
//   const isSubmitting = loading || isDocumentSubmitting || isUploading;

//   if (isPageLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Spin size="large" tip="Loading form..." />
//       </div>
//     );
//   }

//   return (
//     <div className="py-6 px-4">
//       <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow-md">
//         <div className="px-8 py-6">
//           <div className="pb-4">
//             <p className="font-bold text-2xl text-[#694421]">
//               Add Document
//               <div className="w-44 h-1 bg-[#694421] mt-1"></div>
//             </p>
//           </div>

//           <div className="py-4">
//             <Form
//               form={form}
//               layout="vertical"
//               name="addDocumentForm"
//               onFinish={handleSubmit}
//               disabled={isSubmitting}
//             >
//               {/* Request Type */}
//               <Form.Item
//                 name="documentType"
//                 label="Request Type"
//                 rules={[
//                   { required: true, message: 'Please select a request type' },
//                 ]}
//               >
//                 <Select
//                   placeholder="Select Request Type"
//                   onChange={handleRequestChange}
//                   options={[
//                     { label: 'General Correspondence', value: 'GENERAL' },
//                     { label: 'Budget Release', value: 'BudgetRelease' },
//                     {
//                       label: 'Out of Budget Release',
//                       value: 'OutOfBudgetRelease',
//                     },
//                   ]}
//                 />
//               </Form.Item>

//               {/* Reference */}
//               <Form.Item
//                 label="Reference"
//                 name="ref"
//                 rules={[
//                   { required: true, message: 'Please input a Reference!' },
//                 ]}
//               >
//                 <Input placeholder="Input a Reference Number" />
//               </Form.Item>

//               {/* Subject */}
//               <Form.Item
//                 label="Subject"
//                 name="subject"
//                 rules={[{ required: true, message: 'Please input a Subject' }]}
//               >
//                 <Input placeholder="Input a Subject" />
//               </Form.Item>

//               {/* Amount (for Out of Budget) */}
//               {requestType === 'OutOfBudgetRelease' && (
//                 <Form.Item
//                   name="amount"
//                   label="Amount"
//                   rules={[
//                     { required: true, message: 'Please enter an amount' },
//                   ]}
//                 >
//                   <InputNumber
//                     placeholder="Enter Amount"
//                     className="w-full"
//                     formatter={(value) =>
//                       `₵ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
//                     }
//                     parser={(value) => value.replace(/₵\s?|(,*)/g, '')}
//                   />
//                 </Form.Item>
//               )}

//               {/* Budget Items (for Budget Release) */}
//               {requestType === 'BudgetRelease' && (
//                 <Form.List name="budgetAllocations">
//                   {(fields, { add, remove }) => (
//                     <div className="border border-dashed p-5 mb-4 rounded-md">
//                       <div className="mb-3 font-medium">Budget Allocations</div>

//                       {fields.map((field, index) => (
//                         <div
//                           key={field.key}
//                           className="mb-4 pb-4 border-b border-dashed last:border-b-0"
//                         >
//                           <Row gutter={16}>
//                             <Col span={8}>
//                               <Form.Item
//                                 {...field}
//                                 name={[field.name, 'itemCategory']}
//                                 label="Item Category"
//                                 rules={[
//                                   { required: true, message: 'Required' },
//                                 ]}
//                               >
//                                 <Select
//                                   placeholder="Select Item Category"
//                                   onChange={(value) =>
//                                     handleItemCategoryChange(value, index)
//                                   }
//                                   options={
//                                     budgetaryItems?.data?.data?.map((item) => ({
//                                       label: item?.name,
//                                       value: item?.id,
//                                     })) || []
//                                   }
//                                 />
//                               </Form.Item>
//                             </Col>
//                             <Col span={8}>
//                               <Form.Item
//                                 {...field}
//                                 name={[field.name, 'budgetItemId']}
//                                 label="Budgetary Item"
//                                 rules={[
//                                   { required: true, message: 'Required' },
//                                 ]}
//                               >
//                                 <Select
//                                   placeholder="Select Budgetary Item"
//                                   options={budgetUnits[index] || []}
//                                   disabled={
//                                     !form.getFieldValue([
//                                       'budgetAllocations',
//                                       index,
//                                       'itemCategory',
//                                     ])
//                                   }
//                                 />
//                               </Form.Item>
//                             </Col>
//                             <Col span={7}>
//                               <Form.Item
//                                 {...field}
//                                 name={[field.name, 'amount']}
//                                 label="Amount"
//                                 rules={[
//                                   { required: true, message: 'Required' },
//                                 ]}
//                               >
//                                 <InputNumber
//                                   placeholder="Amount"
//                                   className="w-full"
//                                   formatter={(value) =>
//                                     `₵ ${value}`.replace(
//                                       /\B(?=(\d{3})+(?!\d))/g,
//                                       ','
//                                     )
//                                   }
//                                   parser={(value) =>
//                                     value.replace(/₵\s?|(,*)/g, '')
//                                   }
//                                 />
//                               </Form.Item>
//                             </Col>
//                             <Col
//                               span={1}
//                               className="flex items-end justify-center pb-2"
//                             >
//                               <Button
//                                 type="text"
//                                 danger
//                                 icon={<MinusCircleOutlined />}
//                                 onClick={() => remove(field.name)}
//                               />
//                             </Col>
//                           </Row>
//                         </div>
//                       ))}

//                       <Form.Item>
//                         <Button
//                           type="dashed"
//                           onClick={() => add()}
//                           block
//                           icon={<PlusOutlined />}
//                           className="mt-2"
//                         >
//                           Add Budget Item
//                         </Button>
//                       </Form.Item>
//                     </div>
//                   )}
//                 </Form.List>
//               )}

//               {/* Division */}
//               <Form.Item
//                 name="divisionId"
//                 label="Division"
//                 rules={[
//                   { required: true, message: 'Please select a Division' },
//                 ]}
//               >
//                 <Select
//                   placeholder="Select Division"
//                   onChange={handleDivisionChange}
//                   options={
//                     divisions?.data?.map((division) => ({
//                       label: division?.divisionName,
//                       value: division?.divisionId,
//                     })) || []
//                   }
//                 />
//               </Form.Item>

//               {/* Department */}
//               <Form.Item
//                 name="departmentId"
//                 label="Department"
//                 rules={[
//                   { required: true, message: 'Please select a Department' },
//                 ]}
//               >
//                 <Select
//                   placeholder="Select Department"
//                   onChange={handleDepartmentChange}
//                   options={
//                     departments?.data?.data?.map((department) => ({
//                       label: department?.departmentName,
//                       value: department?.departmentId,
//                     })) || []
//                   }
//                   disabled={!selectedDivision}
//                 />
//               </Form.Item>

//               {/* Recipient */}
//               <Form.Item
//                 name="userId"
//                 label="Recipient"
//                 rules={[
//                   { required: true, message: 'Please select a Recipient' },
//                 ]}
//               >
//                 <Select
//                   placeholder="Select Recipient"
//                   options={(users?.data || [])
//                     .filter((emp) => emp.userId !== user?.userId)
//                     .map((user) => ({
//                       label: user?.name,
//                       value: user?.userId,
//                     }))}
//                   disabled={!selectedDepartment}
//                 />
//               </Form.Item>

//               {/* Comment */}
//               <Form.Item label="Comment" name="comment">
//                 <TextArea
//                   rows={4}
//                   placeholder="Enter any additional comments..."
//                 />
//               </Form.Item>

//               {/* Physical Document */}
//               <Form.Item>
//                 <Checkbox
//                   checked={isPhysical}
//                   onChange={(e) => setIsPhysical(e.target.checked)}
//                 >
//                   Physical Document?
//                 </Checkbox>
//               </Form.Item>

//               {/* File Upload (for electronic documents) */}
//               {!isPhysical && (
//                 <Form.Item
//                   name="file"
//                   rules={[{ required: true, message: 'Please upload a file' }]}
//                 >
//                   <Upload {...uploadProps} maxCount={1}>
//                     <Button
//                       icon={<UploadOutlined />}
//                       className="w-full cursor-pointer"
//                     >
//                       Upload PDF
//                     </Button>
//                   </Upload>
//                 </Form.Item>
//               )}

//               {/* Submit Button */}
//               <Form.Item>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   className="bg-[#582F08] hover:bg-[#694421] text-white w-full py-1 h-10"
//                   loading={isSubmitting}
//                 >
//                   {isSubmitting ? 'Processing...' : 'Send Document'}
//                 </Button>
//               </Form.Item>
//             </Form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddDocument;

import React, { useState } from 'react';
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  notification,
  Button,
  Upload,
  Checkbox,
  InputNumber,
  Row,
  Col,
  Spin,
} from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Lottie from 'react-lottie';
import CreateDoc from '../../src/lotties/create-doc.json';
import { useUser } from './CustomHook/useUser';
import { addDocument, uploadFile } from '../http/addDocument';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllBudgets } from '../queryHooks/budget';
import { useNavigate } from 'react-router-dom';

// Set up notification configuration
notification.config({
  placement: 'topRight',
  duration: 4,
});

const AddDocument = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useUser();

  // State variables
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [isPhysical, setIsPhysical] = useState(false);
  const [budgetUnits, setBudgetUnits] = useState({});

  // Animation options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: CreateDoc,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Helper function to show error notification
  const showErrorNotification = (title, error) => {
    let description = 'An unexpected error occurred.';

    // Try to extract error message from different formats
    if (typeof error === 'string') {
      description = error;
    } else if (error?.message) {
      description = error.message;
    } else if (error?.response?.data?.error) {
      if (Array.isArray(error.response.data.error)) {
        description = error.response.data.error
          .map((e) => e.msg || e)
          .join(', ');
      } else {
        description = error.response.data.error;
      }
    } else if (error?.response?.data?.msg) {
      description = error.response.data.msg;
    }

    // Log the error for debugging
    console.error(`${title}:`, error);

    // Show notification
    notification.error({
      message: title,
      description,
    });
  };

  // Helper function to show success notification
  const showSuccessNotification = (title, description) => {
    notification.success({
      message: title,
      description,
    });
  };

  // Fetch divisions
  const { data: divisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        return await axiosInstance.get('/division');
      } catch (error) {
        showErrorNotification('Failed to Load Divisions', error);
        return { data: [] };
      }
    },
  });

  // Fetch departments based on selected division
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${selectedDivision}`);
      } catch (error) {
        showErrorNotification('Failed to Load Departments', error);
        return { data: { data: [] } };
      }
    },
    enabled: !!selectedDivision,
  });

  // Fetch users based on selected department
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', selectedDepartment],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/all-users/${selectedDepartment}`);
      } catch (error) {
        showErrorNotification('Failed to Load Users', error);
        return { data: [] };
      }
    },
    enabled: !!selectedDepartment,
  });

  // Fetch budget items
  const { data: budgetaryItems, isLoading: budgetsLoading } =
    useGetAllBudgets();

  // Document creation mutation
  const { mutate: startDocument, isPending: isDocumentSubmitting } =
    useMutation({
      mutationKey: ['document'],
      mutationFn: async (values) => {
        console.log('Creating document with data:', values);
        const response = await addDocument(values);
        return response;
      },
      onSuccess: () => {
        setLoading(false);
        showSuccessNotification(
          'Document Created',
          'Your document has been created successfully!'
        );
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['trail'] });
        isPhysical ? navigate('/') : navigate('/outgoing');
      },
      onError: (error) => {
        setLoading(false);
        showErrorNotification(
          'Document Creation Failed',
          error?.response?.data?.error
        );
      },
    });

  // File upload mutation
  const { mutate: uploadDoc, isPending: isUploading } = useMutation({
    mutationKey: ['upload'],
    mutationFn: async (formData) => {
      console.log('Uploading file...');
      try {
        const response = await uploadFile(formData);

        if (!response?.data?.newFile?.fileId) {
          throw new Error('File upload successful but no file ID was returned');
        }

        return response.data.newFile.fileId;
      } catch (error) {
        // Re-throw for onError handler
        throw error;
      }
    },
    onSuccess: (fileId) => {
      console.log('File uploaded successfully with ID:', fileId);
      const values = form.getFieldsValue();
      startDocument({ ...values, fileId });
    },
    onError: (error) => {
      setLoading(false);
      showErrorNotification('File Upload Failed', error);
    },
  });

  // Event handlers
  const handleDivisionChange = (value) => {
    setSelectedDivision(value);
    setSelectedDepartment('');
    form.setFieldsValue({
      departmentId: undefined,
      userId: undefined,
    });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    form.setFieldsValue({
      userId: undefined,
    });
  };

  const handleRequestChange = (value) => {
    setRequestType(value);
    // Reset related fields when request type changes
    form.setFieldsValue({
      budgetAllocations: undefined,
      amount: undefined,
    });
  };

  const handleItemCategoryChange = (categoryId, fieldKey) => {
    const selectedBudget = budgetaryItems?.data?.data?.find(
      (item) => item.id === categoryId
    );

    if (selectedBudget?.budgetItems) {
      const options = selectedBudget.budgetItems.map((unit) => ({
        label: unit.item,
        value: unit.id,
      }));

      // Update state with new options for this specific field
      setBudgetUnits((prev) => ({
        ...prev,
        [fieldKey]: options,
      }));

      // Reset the budgetItemId for this row
      const budgetAllocations = form.getFieldValue('budgetAllocations') || [];
      if (budgetAllocations[fieldKey]) {
        budgetAllocations[fieldKey].budgetItemId = undefined;
        form.setFieldValue('budgetAllocations', budgetAllocations);
      }
    }
  };

  // Form submission handler
  const handleSubmit = (values) => {
    setLoading(true);

    // Prepare submission data
    const submissionData = {
      ...values,
      physicalDoc: isPhysical,
    };

    console.log('Form submission values:', submissionData);

    // Check if we need to upload a file first
    if (!isPhysical && values.file && values.file.file) {
      const formData = new FormData();
      formData.append('file', values.file.file);
      formData.append('ref', values.ref);
      formData.append('subject', values.subject);

      uploadDoc(formData);
    } else {
      startDocument(submissionData);
    }
  };

  // Upload configuration
  const uploadProps = {
    name: 'file',
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log('File selected:', info.file.name);
    },
    accept: '.pdf',
  };

  // Loading state
  const isPageLoading =
    divisionsLoading || departmentsLoading || usersLoading || budgetsLoading;
  const isSubmitting = loading || isDocumentSubmitting || isUploading;

  // Close processing notification when done
  React.useEffect(() => {
    if (!isSubmitting) {
      notification.destroy('document-processing');
    }
  }, [isSubmitting]);

  // if (isPageLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Spin size="large" tip="Loading form..." />
  //     </div>
  //   );
  // }

  return (
    <div className="py-6 px-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow-md">
        <div className="px-8 py-6">
          <div className="pb-4">
            <p className="font-bold text-2xl text-[#694421]">
              Add Document
              <div className="w-44 h-1 bg-[#694421] mt-1"></div>
            </p>
          </div>

          <div className="py-4">
            <Form
              form={form}
              layout="vertical"
              name="addDocumentForm"
              onFinish={handleSubmit}
              disabled={isSubmitting}
              initialValues={{
                documentType: undefined,
                divisionId: undefined,
                departmentId: undefined,
                userId: undefined,
              }}
            >
              {/* Request Type */}
              <Form.Item
                name="documentType"
                label="Request Type"
                rules={[
                  { required: true, message: 'Please select a request type' },
                ]}
              >
                <Select
                  placeholder="Select Request Type"
                  onChange={handleRequestChange}
                  options={[
                    { label: 'General Correspondence', value: 'GENERAL' },
                    { label: 'Budget Release', value: 'BudgetRelease' },
                    {
                      label: 'Out of Budget Release',
                      value: 'OutOfBudgetRelease',
                    },
                  ]}
                />
              </Form.Item>

              {/* Reference
              <Form.Item
                label="Reference"
                name="ref"
                rules={[
                  { required: true, message: 'Please input a Reference!' },
                ]}
              >
                <Input placeholder="Input a Reference Number" />
              </Form.Item> */}

              {/* Subject */}
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: 'Please input a Subject' }]}
              >
                <Input placeholder="Input a Subject" />
              </Form.Item>

              {/* Amount (for Out of Budget) */}
              {requestType === 'OutOfBudgetRelease' && (
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={
                    [
                      // { required: true, message: 'Please enter an amount' },
                    ]
                  }
                >
                  <InputNumber
                    placeholder="Enter Amount"
                    className="w-full"
                    formatter={(value) =>
                      `₵ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value?.replace(/₵\s?|(,*)/g, '')}
                  />
                </Form.Item>
              )}

              {/* Budget Items (for Budget Release) */}
              {requestType === 'BudgetRelease' && (
                <Form.List name="budgetAllocations">
                  {(fields, { add, remove }) => (
                    <div className="border border-dashed p-5 mb-4 rounded-md">
                      <div className="mb-3 font-medium">Budget Allocations</div>

                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className="mb-4 pb-4 border-b border-dashed last:border-b-0"
                        >
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'itemCategory']}
                                label="Item Category"
                                rules={[
                                  { required: true, message: 'Required' },
                                ]}
                              >
                                <Select
                                  placeholder="Select Item Category"
                                  onChange={(value) =>
                                    handleItemCategoryChange(value, field.name)
                                  }
                                  options={
                                    budgetaryItems?.data?.data?.map((item) => ({
                                      label: item?.name,
                                      value: item?.id,
                                    })) || []
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'budgetItemId']}
                                label="Budgetary Item"
                                rules={[
                                  { required: true, message: 'Required' },
                                ]}
                              >
                                <Select
                                  placeholder="Select Budgetary Item"
                                  options={budgetUnits[field.name] || []}
                                  disabled={
                                    !form.getFieldValue([
                                      'budgetAllocations',
                                      field.name,
                                      'itemCategory',
                                    ])
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={7}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'amount']}
                                label="Amount"
                                rules={
                                  [
                                    // { required: true, message: 'Required' },
                                  ]
                                }
                              >
                                <InputNumber
                                  placeholder="Amount"
                                  className="w-full"
                                  formatter={(value) =>
                                    `₵ ${value}`.replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ','
                                    )
                                  }
                                  parser={(value) =>
                                    value?.replace(/₵\s?|(,*)/g, '')
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              span={1}
                              className="flex items-end justify-center pb-2"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}

                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          className="mt-2"
                        >
                          Add Budget Item
                        </Button>
                      </Form.Item>
                    </div>
                  )}
                </Form.List>
              )}

              {/* Division */}
              <Form.Item
                name="divisionId"
                label="Division"
                rules={[
                  { required: true, message: 'Please select a Division' },
                ]}
              >
                <Select
                  placeholder="Select Division"
                  onChange={handleDivisionChange}
                  options={
                    divisions?.data?.map((division) => ({
                      label: division?.divisionName,
                      value: division?.divisionId,
                    })) || []
                  }
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              {/* Department */}
              <Form.Item
                name="departmentId"
                label="Department"
                rules={[
                  { required: true, message: 'Please select a Department' },
                ]}
              >
                <Select
                  placeholder="Select Department"
                  onChange={handleDepartmentChange}
                  options={
                    departments?.data?.data?.map((department) => ({
                      label: department?.departmentName,
                      value: department?.departmentId,
                    })) || []
                  }
                  disabled={!selectedDivision}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              {/* Recipient */}
              <Form.Item
                name="userId"
                label="Recipient"
                rules={[
                  { required: true, message: 'Please select a Recipient' },
                ]}
              >
                <Select
                  placeholder="Select Recipient"
                  options={(users?.data || [])
                    .filter((emp) => emp.userId !== user?.userId)
                    .map((user) => ({
                      label: user?.name,
                      value: user?.userId,
                    }))}
                  disabled={!selectedDepartment}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              {/* Comment */}
              <Form.Item label="Comment" name="comment">
                <TextArea
                  rows={4}
                  placeholder="Enter any additional comments..."
                />
              </Form.Item>

              {/* Physical Document */}
              <Form.Item>
                <Checkbox
                  checked={isPhysical}
                  onChange={(e) => setIsPhysical(e.target.checked)}
                >
                  Physical Document?
                </Checkbox>
                <div className="text-gray-500 text-sm mt-1">
                  {isPhysical
                    ? 'No file upload needed for physical documents'
                    : 'Please upload a PDF file for electronic documents'}
                </div>
              </Form.Item>

              {/* File Upload (for electronic documents) */}
              {!isPhysical && (
                <Form.Item
                  name="file"
                  rules={[
                    { required: true, message: 'Please upload a PDF file' },
                  ]}
                >
                  <Upload {...uploadProps} maxCount={1} listType="text">
                    <Button
                      icon={<UploadOutlined />}
                      className="w-full cursor-pointer"
                    >
                      Upload PDF
                    </Button>
                  </Upload>
                </Form.Item>
              )}

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-[#582F08] hover:bg-[#694421] text-white w-full py-1 h-10"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Document'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;
