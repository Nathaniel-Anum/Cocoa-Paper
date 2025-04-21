// import React, { useState, useEffect } from 'react';
// import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
// import { Form, Input, Select, message, Button, Upload, Checkbox } from 'antd';
// import axiosInstance from '../Components/axiosInstance';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Lottie from 'react-lottie';
// import CreateDoc from '../../src/lotties/create-doc.json';
// import { useUser } from './CustomHook/useUser';
// import { addDocument, uploadFile } from '../http/addDocument';
// import TextArea from 'antd/es/input/TextArea';
// import { useGetAllBudgets } from '../queryHooks/budget';

// const AddDocument = () => {
//   const queryClient = useQueryClient();
//   const defaultOptions = {
//     loop: true,
//     autoplay: true,
//     animationData: CreateDoc,
//     rendererSettings: {
//       preserveAspectRatio: 'xMidYMid slice',
//     },
//   };

//   const [form] = Form.useForm();
//   const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [requestType, setRequestType] = useState('');
//   const [isPhysical, setIsPhysical] = useState(false);
//   const { user } = useUser();
//   const [budgetUnits, setBudgetUnits] = useState(null);

//   // axiosInstance.get("/document").then((res) => {
//   //   console.log(res);
//   // }).catch(error => console.log(error));

//   // useQuery for getting all  divisions
//   const { data: divisions } = useQuery({
//     queryKey: ['divisions'],
//     queryFn: () => {
//       return axiosInstance.get('/division');
//     },
//   });
//   // console.log(divisions.data);

//   // useQuery for getting all departments in a selected Division
//   const { data: departments, refetch } = useQuery({
//     queryKey: ['departments', selectedDivision],
//     queryFn: () => {
//       return axiosInstance.get(`/department/${selectedDivision}`);
//     },
//     enabled: !!selectedDivision,
//   });
//   // console.log(departments?.data?.data);

//   // useQuery for getting all users in a selected Department
//   const { data: users, refetch: fetchUsers } = useQuery({
//     queryKey: ['users', selectedDepartment],
//     queryFn: () => {
//       return axiosInstance.get(`/all-users/${selectedDepartment}`);
//     },
//     enabled: !!selectedDepartment,
//   });
//   // console.log(users?.data);

//   // // useMutation to add Documents
//   // const { mutate:startDocument, isLoading } = useMutation({
//   //   mutationKey: 'document',
//   //   mutationFn: (values) => {
//   //     // console.log(values);
//   //     return addDocument(values);
//   //   },
//   //   onSuccess: () => {
//   //     setLoading(false);
//   //     message.success('Document Created Successfully!');
//   //     form.resetFields();
//   //     queryClient.invalidateQueries({ queryKey: ['trail'] });
//   //   },
//   //   onError: (error) => {
//   //     setLoading(false);
//   //     message.error(error?.response?.data?.error);
//   //   },
//   // });

//   // console.log(selectedDepartment);

//   useEffect(() => {
//     if (selectedDivision) {
//       // refetch();
//       form.setFieldValue('departmentId', '');
//     }
//   }, [selectedDivision]);

//   useEffect(() => {
//     if (selectedDepartment) {
//       // fetchUsers();
//       form.setFieldValue('userId', '');
//     }
//   }, [selectedDepartment]);

//   const handleDivisionChange = (value) => {
//     // console.log(`selected Division: ${value}`);
//     setSelectedDivision(value);
//   };

//   const handleDepartmentChange = (value) => {
//     // console.log(`selected Department: ${value}`);
//     setSelectedDepartment(value);
//   };

//   const handleUserChange = (value) => {
//     console.log(`selected User: ${value}`);
//   };

//   const handleSubmit = (values) => {
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('file', values['file'].file);
//     formData.append('ref', values.ref);
//     formData.append('subject', values.subject);
//     uploadDoc(formData);
//     // mutate({ ...values, documentType: 'Custom' });
//     // form.resetFields();
//     // console.log(values);
//     // console.log("object");
//   };

//   useEffect(() => {
//     form.setFieldValue('departmentId', '');
//     if (requestType === 'BUDGET_RELEASE') {
//       const divsion = divisions?.data?.find(
//         (div) => div?.divisionName === 'COCOBOD'
//       );
//       // console.log(divsion);
//       if (divsion) {
//         setSelectedDivision(divsion?.divisionId);
//       }
//       // setSelectedDivision('COCOBOD');
//     }
//   }, [requestType]);

//   const handleRequestChange = (value) => {
//     setRequestType(value);
//   };

//   const props = {
//     name: 'file',
//     beforeUpload: () => false,
//     onChange(info) {
//       if (info.file.status !== 'uploading') {
//         console.log(info.file, info.fileList);
//       }
//       if (info.file.status === 'done') {
//         message.success(`${info.file.name} file uploaded successfully`);
//       } else if (info.file.status === 'error') {
//         message.error(`${info.file.name} file upload failed.`);
//       }
//     },
//   };

//   const { mutate: startDocument, isPending } = useMutation({
//     mutationKey: 'addDoc',
//     mutationFn: (data) => addDocument(data),

//     onSuccess: () => {
//       message.success('Document Created Successfully!');
//     },

//     onError: (err) => {
//       message.error(err.message);
//     },
//   });

//   const { mutate: uploadDoc } = useMutation({
//     mutationKey: 'upload',
//     mutationFn: (data) => {
//       uploadFile(data)
//         .then((response) => {
//           clg(response);
//           // startDocument({ file_path: response?.data?.filePath });
//         })
//         .catch((err) => {
//           console.log(err);
//           message.error(err.response?.data?.msg);
//         });
//     },

//     onError: (err) => message.error(err.message),
//   });

//   const { data: budgetaryItems, isLoading } = useGetAllBudgets();
//   // console.log({ selectedDivision });

//   const handleItemCategoryChange = (value) => {
//     const foundBudgetItem =
//       budgetaryItems &&
//       budgetaryItems?.data?.data?.find((item) => item?.id === value);
//     setBudgetUnits(foundBudgetItem?.budgetItems);
//   };

//   return (
//     <div>
//       <div className="  grid gap-8 place-items-center grid-cols-2">
//         <div className="  bg-white rounded-md px-[3rem] ">
//           <div className=" bg-white ">
//             <p className="font-bold text-[29px] text-[#694421] py-2 ">
//               Add Document
//               <div className="w-[11rem] h-1 bg-[#694421]"></div>
//             </p>

//             <div className=" py-6 w-[30rem] ">
//               <Form
//                 form={form}
//                 layout="vertical"
//                 className=""
//                 name="Add Document"
//                 onFinish={(values) => handleSubmit(values)}
//               >
//                 <Form.Item name="requestType" label="Request Type" required>
//                   <Select
//                     placeholder="Select Request Type"
//                     onChange={(value) => handleRequestChange(value)}
//                     options={[
//                       { label: 'General', value: 'GENERAL' },
//                       { label: 'Budget Release', value: 'BUDGET_RELEASE' },
//                       {
//                         label: 'Out of Budget',
//                         value: 'OUT_OF_BUDGET_RELEASE',
//                       },
//                     ]}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   label="Reference"
//                   name="ref"
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Please input a Reference!',
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Input a Reference Number" />
//                 </Form.Item>
//                 <Form.Item
//                   label="Subject"
//                   name="subject"
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Please input a Subject',
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Input a Subject" />
//                 </Form.Item>
//                 {(requestType === 'BUDGET_RELEASE' ||
//                   requestType === 'OUT_OF_BUDGET_RELEASE') && (
//                   <div>
//                     <Form.Item
//                       label="Amount"
//                       name="amount"
//                       rules={[
//                         {
//                           required: true,
//                           message: 'Please input an amount',
//                         },
//                       ]}
//                     >
//                       <Input
//                         // prefix={<DollarOutlined />}
//                         type="number"
//                         placeholder="Input a Amount"
//                       />
//                     </Form.Item>
//                     <Form.Item
//                       name="itemCategory"
//                       required
//                       label="Item Category"
//                     >
//                       <Select
//                         placeholder="Please choose item Category"
//                         onChange={(value) => handleItemCategoryChange(value)}
//                         options={
//                           budgetaryItems &&
//                           budgetaryItems?.data?.data.map((item) => ({
//                             label: item?.name,
//                             value: item?.id,
//                           }))
//                         }
//                       />
//                     </Form.Item>
//                     <Form.Item
//                       name="budgetaryItem"
//                       required
//                       label="Budgetary Item"
//                     >
//                       <Select
//                         placeholder="Please choose budgetary Item"
//                         options={budgetUnits?.map((item) => ({
//                           label: item?.item,
//                           value: item?.id,
//                         }))}
//                       />
//                     </Form.Item>
//                     <Form.Item name={'quantity'} label="Quantity">
//                       <Input placeholder="Enter Quantity if applicable" />
//                     </Form.Item>
//                   </div>
//                 )}

//                 {requestType !== 'BUDGET_RELEASE' && (
//                   <Form.Item
//                     name="divisionId"
//                     label="Division"
//                     rules={[
//                       {
//                         required: true,
//                         message: 'Please choose your Division!',
//                       },
//                     ]}
//                   >
//                     <Select
//                       placeholder="Please choose your Division"
//                       allowClear
//                       options={divisions?.data.map((division, index) => {
//                         return {
//                           label: division?.divisionName,
//                           value: division?.divisionId,
//                         };
//                       })}
//                       onChange={handleDivisionChange}
//                     />
//                   </Form.Item>
//                 )}

//                 <Form.Item
//                   name="departmentId"
//                   label="Department"
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Please choose your Department!',
//                     },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Please choose your Department"
//                     allowClear
//                     options={departments?.data?.data?.map(
//                       (department, index) => {
//                         return {
//                           label: department?.departmentName,
//                           value: department?.departmentId,
//                         };
//                       }
//                     )}
//                     onChange={handleDepartmentChange}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="userId"
//                   label="Recipient"
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Please select a User!',
//                     },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Please select a User"
//                     allowClear
//                     options={users?.data
//                       .filter((emp) => emp.userId !== user?.userId)
//                       .map((user, index) => {
//                         return {
//                           label: user?.name,
//                           value: user?.userId,
//                         };
//                       })}
//                     onChange={handleUserChange}
//                   />
//                 </Form.Item>

//                 <Form.Item label={'Comment'}>
//                   <TextArea rows={4} placeholder="Enter Comment...." />
//                 </Form.Item>

//                 <Form.Item>
//                   <Checkbox onChange={(e) => setIsPhysical(e.target.checked)}>
//                     Physical Document?
//                   </Checkbox>
//                 </Form.Item>
//                 {!isPhysical && (
//                   <Form.Item name="file">
//                     <Upload {...props}>
//                       <Button
//                         style={{ width: '26.5rem' }}
//                         icon={<UploadOutlined />}
//                         className="cursor-pointer"
//                       >
//                         Upload PDF
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 )}

//                 <Form.Item className="">
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     className="bg-[#582F08] text-white px-5 w-full py-1"
//                     loading={isPending}
//                   >
//                     Send
//                   </Button>
//                 </Form.Item>
//               </Form>
//             </div>
//           </div>
//         </div>
//         <div className="fixed top-[16rem] right-20">
//           <Lottie options={defaultOptions} height={450} width={450} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddDocument;

import React, { useState, useEffect } from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  message,
  Button,
  Upload,
  Checkbox,
  InputNumber,
} from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Lottie from 'react-lottie';
import CreateDoc from '../../src/lotties/create-doc.json';
import { useUser } from './CustomHook/useUser';
import { addDocument, uploadFile } from '../http/addDocument';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllBudgets } from '../queryHooks/budget';

const AddDocument = () => {
  const queryClient = useQueryClient();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: CreateDoc,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const [form] = Form.useForm();
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [isPhysical, setIsPhysical] = useState(false);
  const { user } = useUser();
  const [budgetUnits, setBudgetUnits] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: !!selectedDivision,
  });

  const { data: users } = useQuery({
    queryKey: ['users', selectedDepartment],
    queryFn: () => axiosInstance.get(`/all-users/${selectedDepartment}`),
    enabled: !!selectedDepartment,
  });

  useEffect(() => {
    if (selectedDivision) {
      form.setFieldValue('departmentId', '');
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      form.setFieldValue('userId', '');
    }
  }, [selectedDepartment]);

  const handleDivisionChange = (value) => setSelectedDivision(value);
  const handleDepartmentChange = (value) => setSelectedDepartment(value);
  const handleUserChange = (value) => console.log(`selected User: ${value}`);

  const handleRequestChange = (value) => setRequestType(value);

  // const { mutate: startDocument, isPending } = useMutation({
  //   mutationKey: 'addDoc',
  //   mutationFn: (data) => addDocument(data),
  //   onSuccess: () => message.success('Document Created Successfully!'),
  //   onError: (err) => message.error(err.message),
  // });

  const { mutate: startDocument, isPending } = useMutation({
    mutationKey: 'document',
    mutationFn: (values) => {
      console.log(values);
      return addDocument(values);
    },
    onSuccess: () => {
      setLoading(false);
      message.success('Document Created Successfully!');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['trail'] });
    },
    onError: (error) => {
      setLoading(false);
      message.error(error?.response?.data?.error);
    },
  });

  const { mutate: uploadDoc } = useMutation({
    mutationKey: 'upload',
    mutationFn: (data) => {
      uploadFile(data)
        .then((response) => {
          // console.log(response?.data?.newFile?.fileId);
          startDocument({
            ...form.getFieldsValue(),
            fileId: response?.data?.newFile?.fileId,
          });
          // Optionally trigger document mutation here
        })
        .catch((err) => message.error(err.response?.data?.msg));
    },
  });

  const { data: budgetaryItems } = useGetAllBudgets();

  const handleItemCategoryChange = (selectedCategoryIds) => {
    setSelectedCategories(selectedCategoryIds);

    const selectedItems = budgetaryItems?.data?.data?.filter((item) =>
      selectedCategoryIds.includes(item?.id)
    );

    const allBudgetItems =
      selectedItems?.flatMap((item) => item?.budgetItems) || [];

    const uniqueItems = Array.from(
      new Map(allBudgetItems.map((item) => [item.id, item])).values()
    );

    setBudgetUnits(uniqueItems);
    form.setFieldValue('budgetaryItem', []);
  };

  // useEffect(() => {
  //   form.setFieldValue('departmentId', '');
  //   if (requestType === 'BUDGET_RELEASE') {
  //     const division = divisions?.data?.find(
  //       (div) => div?.divisionName === 'COCOBOD'
  //     );
  //     if (division) setSelectedDivision(division?.divisionId);
  //   }
  // }, [requestType]);

  const props = {
    name: 'file',
    beforeUpload: () => false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  const handleSubmit = (values) => {
    // console.log(values);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', values['file'].file);
    formData.append('ref', values.ref);
    formData.append('subject', values.subject);
    uploadDoc(formData);
  };

  return (
    <div>
      <div className="grid gap-8 place-items-center grid-cols-2">
        <div className="bg-white rounded-md px-[3rem]">
          <p className="font-bold text-[29px] text-[#694421] py-2">
            Add Document
            <div className="w-[11rem] h-1 bg-[#694421]"></div>
          </p>

          <div className="py-6 w-[30rem]">
            <Form
              form={form}
              layout="vertical"
              name="Add Document"
              onFinish={handleSubmit}
            >
              <Form.Item name="documentType" label="Request Type" required>
                <Select
                  placeholder="Select Request Type"
                  onChange={handleRequestChange}
                  options={[
                    { label: 'General', value: 'GENERAL' },
                    { label: 'Budget Release', value: 'BudgetRelease' },
                    { label: 'Out of Budget', value: 'OutOfBudgetRelease' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Reference"
                name="ref"
                rules={[
                  { required: true, message: 'Please input a Reference!' },
                ]}
              >
                <Input placeholder="Input a Reference Number" />
              </Form.Item>

              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: 'Please input a Subject' }]}
              >
                <Input placeholder="Input a Subject" />
              </Form.Item>

              {(requestType === 'BudgetRelease' ||
                requestType === 'OutOfBudgetRelease') && (
                <Form.Item
                  label="Amount"
                  name="amount"
                  rules={[
                    { required: true, message: 'Please input an amount' },
                  ]}
                >
                  <InputNumber
                    type="number"
                    placeholder="Input an Amount"
                    className="w-full"
                  />
                </Form.Item>
              )}

              {requestType === 'BudgetRelease' && (
                <>
                  <Form.Item name="itemCategory" required label="Item Category">
                    <Select
                      mode="multiple"
                      placeholder="Choose Item Categories"
                      onChange={handleItemCategoryChange}
                      options={budgetaryItems?.data?.data.map((item) => ({
                        label: item?.name,
                        value: item?.id,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="budgetItemIds"
                    required
                    label="Budgetary Item"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Choose Budgetary Items"
                      options={budgetUnits.map((item) => ({
                        label: item?.item,
                        value: item?.id,
                      }))}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item name="quantity" label="Quantity">
                <InputNumber
                  placeholder="Enter Quantity if applicable"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="divisionId"
                label="Division"
                rules={[{ required: true, message: 'Choose your Division!' }]}
              >
                <Select
                  placeholder="Choose your Division"
                  allowClear
                  options={divisions?.data.map((division) => ({
                    label: division?.divisionName,
                    value: division?.divisionId,
                  }))}
                  onChange={handleDivisionChange}
                />
              </Form.Item>

              <Form.Item
                name="departmentId"
                label="Department"
                rules={[{ required: true, message: 'Choose your Department!' }]}
              >
                <Select
                  placeholder="Choose your Department"
                  allowClear
                  options={departments?.data?.data?.map((department) => ({
                    label: department?.departmentName,
                    value: department?.departmentId,
                  }))}
                  onChange={handleDepartmentChange}
                />
              </Form.Item>

              <Form.Item
                name="userId"
                label="Recipient"
                rules={[{ required: true, message: 'Select a User!' }]}
              >
                <Select
                  placeholder="Select a User"
                  allowClear
                  options={users?.data
                    ?.filter((emp) => emp.userId !== user?.userId)
                    .map((user) => ({
                      label: user?.name,
                      value: user?.userId,
                    }))}
                  onChange={handleUserChange}
                />
              </Form.Item>

              <Form.Item label="Comment">
                <TextArea rows={4} placeholder="Enter Comment...." />
              </Form.Item>

              <Form.Item name={'physicalDoc'}>
                <Checkbox onChange={(e) => setIsPhysical(e.target.checked)}>
                  Physical Document?
                </Checkbox>
              </Form.Item>

              {!isPhysical && (
                <Form.Item name="file">
                  <Upload {...props}>
                    <Button
                      style={{ width: '100%' }}
                      icon={<UploadOutlined />}
                      className="cursor-pointer"
                    >
                      Upload PDF
                    </Button>
                  </Upload>
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-[#582F08] text-white px-5 w-full py-1"
                  loading={isPending}
                >
                  Send
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className="fixed top-[16rem] right-20">
          <Lottie options={defaultOptions} height={450} width={450} />
        </div>
      </div>
    </div>
  );
};

export default AddDocument;
