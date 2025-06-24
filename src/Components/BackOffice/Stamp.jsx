import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { uploadFile } from '../../http/addDocument';
import { addStamp } from '../../http/stamp';
import { useGetStamps } from '../../queryHooks/stamp';

const Stamp = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingStamp, setEditingStamp] = useState(null);

  const [form] = Form.useForm();

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: stamps } = useGetStamps();

  const columns = [
    {
      title: 'Signature',
      dataIndex: 'stamp',
      key: 'stamp',
      render: (value) => {
        return (
          <img
            src={`${import.meta.env.VITE_BASE_URL}/uploads/${value.uniqueName}`}
            width={'150'}
            height={'150'}
            alt=""
          />
        );
      },
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (_, record) => (
        <Space>
          <EditOutlined
            className="text-blue-500 text-lg cursor-pointer"
            onClick={() => handleEdit(record)}
          />

          <Popconfirm
            title="Are you sure you want to delete this group?"
            // onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="text-red-500 text-lg cursor-pointer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });

  const qClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: 'addStamp',
    mutationFn: (values) => {
      return uploadFile(values);
    },
    onSuccess: (res) => {
      // console.log(res);
      const values = form.getFieldsValue();
      addStamp({
        stampId: res.data.newFile.fileId,
        name: values.name,
        userId: values.userId,
      })
        .then(() => {
          qClient.invalidateQueries({ queryKey: ['stamps'] });
          setOpenModal(false);
          form.resetFields();
          message.success('Stamp added successfully!');
        })
        .catch((err) => {
          message.error(err?.response?.data?.error);
        });
    },
    onError: (error) => {
      console.log(error);
      message.error(error?.response?.data?.error);
    },
  });

  const updateStampMutation = useMutation({
    mutationKey: 'updateStamp',
    mutationFn: (values) => {
      // You may need to adjust the API endpoint and payload
      return axiosInstance.patch(`/stamp/${editingStamp?.id}`, values);
    },
    onSuccess: () => {
      setOpenModal(false);
      setEditMode(false);
      setEditingStamp(null);
      form.resetFields();
      // TODO: Refetch or update your table data here
    },
    onError: () => {},
  });

  const handleSubmit = (values) => {
    if (editMode && editingStamp) {
      updateStampMutation.mutate(values);
    } else {
      const formData = new FormData();
      formData.append('file', values.file.file);
      formData.append('ref', '');
      formData.append('subject', '');
      mutate(formData);
    }
  };

  const { data: departments, refetch } = useQuery({
    queryKey: ['options'],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });
  // console.log(departments?.data?.data);

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: false,
  });

  const handleDivisionChange = (option) => {
    setSelectedDivision(option.value);
  };

  const handleDepartmentChange = (option) => {
    setSelectedDepartment(option.value);
  };

  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchUsers();
    }
  }, [selectedDepartment]);

  const handleEdit = (record) => {
    setEditMode(true);
    setEditingStamp(record);
    setOpenModal(true);
    form.setFieldsValue({
      signature: record.signature,
      division: { label: record.divisionName, value: record.divisionId },
      department: { label: record.departmentName, value: record.departmentId },
      userId: record.userId,
      // Add other fields as needed
    });
  };

  const uploadProps = {
    name: 'file',
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log('Main file selected:', info.file.name);
    },
    accept: '.jpg, .jpeg, .png',
  };

  return (
    <div className="px-[240px] pt-[50px]">
      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setEditMode(false);
          setEditingStamp(null);
          form.resetFields();
        }}
        footer={null}
        title={editMode ? 'EDIT STAMP' : 'ADD STAMP'}
      >
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <Form.Item label="Stamp" name="name" required>
            <Input placeholder="Enter Stamp name" />
          </Form.Item>
          <Form.Item
            label="Division"
            name="division"
            rules={[
              {
                required: true,
                message: 'Please choose your Division!',
              },
            ]}
          >
            <Select
              placeholder="Please choose your Division"
              optionFilterProp="label"
              showSearch
              allowClear
              labelInValue
              options={divisions?.data.map((division, index) => {
                return {
                  label: division?.divisionName,
                  value: division?.divisionId,
                };
              })}
              onChange={handleDivisionChange}
            />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[
              {
                required: true,
                message: 'Please choose your Department!',
              },
            ]}
          >
            <Select
              placeholder="Please choose your Department"
              optionFilterProp="label"
              showSearch
              allowClear
              labelInValue
              options={departments?.data?.data?.map((department, index) => {
                return {
                  label: department?.departmentName,
                  value: department?.departmentId,
                };
              })}
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
              optionFilterProp="label"
              showSearch
              allowClear
              options={
                (users &&
                  users?.data.map((user) => ({
                    label: user?.name,
                    value: user?.userId,
                  }))) ||
                []
              }
              // onChange={handleUserChange}
            />
          </Form.Item>
          <Form.Item name="file" label="Stamp File">
            <Upload
              {...uploadProps}
              listType="text"
              className="w-full"
              style={{ width: '100%' }}
              maxCount={1}
            >
              <Button
                icon={<UploadOutlined />}
                className="w-full cursor-pointer"
              >
                Upload Stamp
              </Button>
            </Upload>
            {/* <div className="text-gray-500 text-sm mt-1">
              You can upload multiple attachment files
            </div> */}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#582F08] text-white w-full"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className="flex justify-end mb-[20px] ">
        <Button
          className="bg-[#582F08] text-[#edd3bb]"
          onClick={() => setOpenModal(true)}
        >
          Add Stamp
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={
          stamps &&
          stamps?.data.map((stamp) => ({ ...stamp, key: stamp?.stampId }))
        }
      />
    </div>
  );
};

export default Stamp;
