import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Form, Select, message, Checkbox } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../axiosInstance';

const Edit = ({ popup, staffDetail, divisions, setPopup, roles }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [selectedDivision, setSelectedDivision] = useState(
    staffDetail?.division?.divisionId
  );
  const [isDepartment, setIsDepartment] = useState(false);
  const [isSecretariat, setIssecretariat] = useState(false);

  const divisionId = selectedDivision;

  const handleDivisionChange = (value) => {
    setSelectedDivision(value);
    form.setFieldsValue({ departmentId: undefined }); // Clear department when division changes
  };

  // useQuery to get departments, only enabled if selectedDivision is defined
  const { data: departments } = useQuery({
    queryKey: ['options', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: !!selectedDivision, // Only fetch when division is selected
  });

  const dontShowPopup = () => {
    setPopup(false);
  };
  const handleChange = (value) => {
    // console.log(`selected: ${value}`);
  };

  useEffect(() => {
    if (staffDetail) {
      form.setFieldsValue({
        name: staffDetail.name,
        staffNumber: staffDetail.staff?.staffNumber,
        email: staffDetail.email,
        divisionId: staffDetail?.division?.divisionId,
        departmentId: staffDetail?.department?.departmentId,
        roleId: staffDetail?.role?.map((role) => role.roleId),
      });
      setIsDepartment(staffDetail?.staff?.isDepartment);
      setIssecretariat(staffDetail?.staff?.isSecretariat);
    }
  }, [staffDetail]);

  // useMutation to edit staff
  const { mutate, isPending } = useMutation({
    mutationKey: 'staff',
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.patch(`/staff/${staffDetail?.staff?.staffId}`, {
        ...values,
        isDepartment,
        isSecretariat,
      });
    },
    onSuccess: () => {
      setPopup(false);
      form.resetFields();
      message.success('Staff updated successfully!');
      queryClient.invalidateQueries({ mutationKey: 'staff' });
    },
    onError: (error) => {
      message.error(error?.response?.data?.error);
    },
  });
  const handleUpdate = (values) => {
    mutate(values);
  };
  return (
    <Modal
      open={popup}
      onCancel={dontShowPopup}
      footer={null}
      title="Edit Staff"
    >
      <Form
        name="EditStaff"
        form={form}
        onFinish={(values) => handleUpdate(values)}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please input your name!',
            },
          ]}
        >
          <Input placeholder="Name" allowClear />
        </Form.Item>
        <Form.Item
          name="staffNumber"
          label="Staff ID"
          rules={[
            {
              required: true,
              message: 'Please input your staff ID!',
            },
          ]}
        >
          <Input placeholder="Staff Number" allowClear />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: 'Please input your email!',
            },
          ]}
        >
          <Input placeholder="Email" allowClear />
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
            options={
              departments?.data?.data?.map((department, index) => {
                return {
                  label: department?.departmentName,
                  value: department?.departmentId,
                };
              }) || []
            }
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="">
          <Checkbox
            onChange={(e) => setIsDepartment(e.target.checked)}
            checked={isDepartment}
          >
            Setup as Main Secretariat
          </Checkbox>
        </Form.Item>
        <Form.Item label="">
          <Checkbox
            onChange={(e) => setIssecretariat(e.target.checked)}
            checked={isSecretariat}
          >
            Setup as Secretariat
          </Checkbox>
        </Form.Item>

        <Form.Item name={'roleId'}>
          <Select
            mode="multiple"
            placeholder="Select Role"
            options={
              (roles &&
                roles?.data?.data.map((role) => ({
                  label: role.role,
                  value: role.roleId,
                }))) ||
              []
            }
          />
        </Form.Item>

        <Form.Item>
          <Button
            className="w-full bg-[#9D4D01]"
            type="primary"
            htmlType="submit"
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Edit;
