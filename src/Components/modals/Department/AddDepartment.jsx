import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Input,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
// import axiosInstance from "../axiosInstance";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../axiosInstance';

const AddDepartment = ({ setOpen, open }) => {
  const handleCancel = () => {
    setOpen(false);
  };
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const queryClient = useQueryClient();

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
  };

  const showModal = () => {
    setOpen(true);
  };

  // Function to enforce a delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = (values) => {
    // console.log(values);
    mutate(values);
  };
  // useMutation to add department
  const { mutate } = useMutation({
    mutationKey: 'departments',
    mutationFn: async (values) => {
      // console.log(values);
      setIsLoading(true); // Start loading
      // Wait for both API request and delay to complete
      await Promise.all([
        axiosInstance.post('/department', values), // API call
        delay(2500), // Minimum 30-second delay
      ]);
    },
    onSuccess: () => {
      setIsLoading(false); // Stop loading
      setOpen(false);
      form.resetFields();
      message.success('Department Created Successfully!');
      queryClient.invalidateQueries({ mutationKey: 'departments' });
    },
    onError: (error) => {
      setIsLoading(false); // Stop loading
      setOpen(false);
      form.resetFields();
      //   message.error(error?.response?.data?.result);
      console.log(error);
    },
  });

  // useQuery to fetch divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });
  // console.log(divisions && divisions?.data);
  return (
    <div>
      <Modal
        open={open}
        title="Add Department"
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="addStaff"
          onFinish={(values) => handleSubmit(values)}
          form={form}
        >
          <Form.Item
            name="departmentName"
            label="DepartmentName"
            rules={[
              {
                required: true,
                message: 'Please input your Department Name!',
              },
            ]}
          >
            <Input placeholder="Department Name" allowClear />
          </Form.Item>

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
          <Form.Item>
            <Button
              className="w-full bg-[#9D4D01]"
              type="primary"
              htmlType="submit"
              onClick={showModal}
              loading={isLoading} // Show spinner when loading
            >
              Add Department
              {/* Optional: Label change */}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddDepartment;
