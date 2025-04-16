import React, { useState, useEffect } from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Form, Input, Select, message, Button, Upload, Checkbox } from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Lottie from 'react-lottie';
import CreateDoc from '../../src/lotties/create-doc.json';
import { useUser } from './CustomHook/useUser';
import { addDocument, uploadFile } from '../http/addDocument';
import TextArea from 'antd/es/input/TextArea';

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

  // axiosInstance.get("/document").then((res) => {
  //   console.log(res);
  // }).catch(error => console.log(error));

  // useQuery for getting all  divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });
  // console.log(divisions.data);

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: !!selectedDivision,
  });
  // console.log(departments?.data?.data);

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ['users', selectedDepartment],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: !!selectedDepartment,
  });
  // console.log(users?.data);

  // // useMutation to add Documents
  // const { mutate:startDocument, isLoading } = useMutation({
  //   mutationKey: 'document',
  //   mutationFn: (values) => {
  //     // console.log(values);
  //     return addDocument(values);
  //   },
  //   onSuccess: () => {
  //     setLoading(false);
  //     message.success('Document Created Successfully!');
  //     form.resetFields();
  //     queryClient.invalidateQueries({ queryKey: ['trail'] });
  //   },
  //   onError: (error) => {
  //     setLoading(false);
  //     message.error(error?.response?.data?.error);
  //   },
  // });

  // console.log(selectedDepartment);

  useEffect(() => {
    if (selectedDivision) {
      // refetch();
      form.setFieldValue('departmentId', '');
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      // fetchUsers();
      form.setFieldValue('userId', '');
    }
  }, [selectedDepartment]);

  const handleDivisionChange = (value) => {
    // console.log(`selected Division: ${value}`);
    setSelectedDivision(value);
  };

  const handleDepartmentChange = (value) => {
    // console.log(`selected Department: ${value}`);
    setSelectedDepartment(value);
  };

  const handleUserChange = (value) => {
    console.log(`selected User: ${value}`);
  };

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', values['file'].file);
    formData.append('ref', values.ref);
    formData.append('subject', values.subject);
    uploadDoc(formData);
    mutate({ ...values, documentType: 'Custom' });
    // form.resetFields();
    // console.log(values);
    // console.log("object");
  };

  useEffect(() => {
    form.setFieldValue('departmentId', '');
    if (requestType === 'F&A') {
      const divsion = divisions?.data?.find(
        (div) => div?.divisionName === 'COCOBOD'
      );
      // console.log(divsion);
      if (divsion) {
        setSelectedDivision(divsion?.divisionId);
      }
      // setSelectedDivision('COCOBOD');
    }
  }, [requestType]);

  const handleRequestChange = (value) => {
    setRequestType(value);
  };

  const props = {
    name: 'file',
    beforeUpload: () => false,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const { mutate: startDocument, isPending } = useMutation({
    mutationKey: 'addDoc',
    mutationFn: (data) => addDocument(data),

    onSuccess: () => {
      message.success('Document Created Successfully!');
    },

    onError: (err) => {
      message.error(err.message);
    },
  });

  const { mutate: uploadDoc } = useMutation({
    mutationKey: 'upload',
    mutationFn: (data) => {
      uploadFile(data)
        .then((response) => {
          clg(response);
          // startDocument({ file_path: response?.data?.filePath });
        })
        .catch((err) => {
          console.log(err);
          message.error(err.response?.data?.msg);
        });
    },

    onError: (err) => message.error(err.message),
  });

  // console.log({ selectedDivision });

  return (
    <div>
      <div className="  grid gap-8 place-items-center grid-cols-2">
        <div className="  bg-white rounded-md px-[3rem] ">
          <div className=" bg-white ">
            <p className="font-bold text-[29px] text-[#694421] py-2 ">
              Add Document
              <div className="w-[11rem] h-1 bg-[#694421]"></div>
            </p>

            <div className=" py-6 w-[30rem] ">
              <Form
                form={form}
                layout="vertical"
                className=""
                name="Add Document"
                onFinish={(values) => handleSubmit(values)}
              >
                <Form.Item name="requestType" label="Request Type" required>
                  <Select
                    placeholder="Select Request Type"
                    onChange={(value) => handleRequestChange(value)}
                    options={[
                      { label: 'General', value: 'GENERAL' },
                      { label: 'F&A', value: 'F&A' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="Reference"
                  name="ref"
                  rules={[
                    {
                      required: true,
                      message: 'Please input a Reference!',
                    },
                  ]}
                >
                  <Input placeholder="Input a Reference Number" />
                </Form.Item>
                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[
                    {
                      required: true,
                      message: 'Please input a Subject',
                    },
                  ]}
                >
                  <Input placeholder="Input a Subject" />
                </Form.Item>
                {requestType === 'F&A' && (
                  <div>
                    <Form.Item
                      label="Amount"
                      name="amount"
                      rules={[
                        {
                          required: true,
                          message: 'Please input an amount',
                        },
                      ]}
                    >
                      <Input
                        // prefix={<DollarOutlined />}
                        type="number"
                        placeholder="Input a Amount"
                      />
                    </Form.Item>
                    <Form.Item
                      name="itemCategory"
                      required
                      label="Item Category"
                    >
                      <Select placeholder="Please choose item Category" />
                    </Form.Item>
                    <Form.Item
                      name="budgetaryItem"
                      required
                      label="Budgetary Item"
                    >
                      <Select placeholder="Please choose budgetary Item" />
                    </Form.Item>
                    <Form.Item name={'quantity'} label="Quantity">
                      <Input placeholder="Enter Quantity if applicable" />
                    </Form.Item>
                  </div>
                )}

                {requestType !== 'F&A' && (
                  <Form.Item
                    name="divisionId"
                    label="Division"
                    rules={[
                      {
                        required: true,
                        message: 'Please choose your Division!',
                      },
                    ]}
                  >
                    <Select
                      placeholder="Please choose your Division"
                      allowClear
                      options={divisions?.data.map((division, index) => {
                        return {
                          label: division?.divisionName,
                          value: division?.divisionId,
                        };
                      })}
                      onChange={handleDivisionChange}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="departmentId"
                  label="Department"
                  rules={[
                    {
                      required: true,
                      message: 'Please choose your Department!',
                    },
                  ]}
                >
                  <Select
                    placeholder="Please choose your Department"
                    allowClear
                    options={departments?.data?.data?.map(
                      (department, index) => {
                        return {
                          label: department?.departmentName,
                          value: department?.departmentId,
                        };
                      }
                    )}
                    onChange={handleDepartmentChange}
                  />
                </Form.Item>
                <Form.Item
                  name="userId"
                  label="User"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a User!',
                    },
                  ]}
                >
                  <Select
                    placeholder="Please select a User"
                    allowClear
                    options={users?.data
                      .filter((emp) => emp.userId !== user?.userId)
                      .map((user, index) => {
                        return {
                          label: user?.name,
                          value: user?.userId,
                        };
                      })}
                    onChange={handleUserChange}
                  />
                </Form.Item>

                <Form.Item label={'Comment'}>
                  <TextArea rows={4} placeholder="Enter Comment...." />
                </Form.Item>

                <Form.Item>
                  <Checkbox onChange={(e) => setIsPhysical(e.target.checked)}>
                    Physical Document?
                  </Checkbox>
                </Form.Item>
                {!isPhysical && (
                  <Form.Item name="file">
                    <Upload {...props}>
                      <Button
                        style={{ width: '26.5rem' }}
                        icon={<UploadOutlined />}
                        className="cursor-pointer"
                      >
                        Upload PDF
                      </Button>
                    </Upload>
                  </Form.Item>
                )}

                <Form.Item className="">
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
        </div>
        <div className="fixed top-[16rem] right-20">
          <Lottie options={defaultOptions} height={450} width={450} />
        </div>
      </div>
    </div>
  );
};

export default AddDocument;
