import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Form, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";

const Edit = ({ popup, staffDetail, divisions, setPopup }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [selectedDivision, setSelectedDivision] = useState("");

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
    setSelectedDivision(value);
  };

  const dontShowPopup = () => {
    setPopup(false);
  };
  const handleChange = (value) => {
    console.log(`selected: ${value}`);
  };

  // axiosInstance.get("/department").then((res) => console.log(res));

  // useQuery to get departments
  const { data: departments, refetch } = useQuery({
    queryKey: ["options"],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
  });
  // console.log(departments);
  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (staffDetail) {
      // console.log(staffDetail);
      form.setFieldsValue({
        name: staffDetail.name,
        staffNumber: staffDetail.staff?.staffNumber,
        email: staffDetail.email,
        divisionId: staffDetail?.division?.divisionId,
        departmentId: staffDetail?.department?.departmentId,
      });
    }
  }, [staffDetail]);

  // useMutation to edit staff
  const { mutate, isPending } = useMutation({
    mutationKey: "staff",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.patch(
        `/staff/${staffDetail?.staff?.staffId}`,
        values
      ); //This way or
      // addUser(data);  //This way
    },
    onSuccess: () => {
      setPopup(false);
      form.resetFields();
      message.success("Staff updated successfully!");
      queryClient.invalidateQueries({ mutationKey: "staff" });
    },
    onError: (error) => {
      console.log(error);
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
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: "Please input your name!",
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
              message: "Please input your staff ID!",
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
              message: "Please input your email!",
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
              message: "Please choose your Division!",
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
              message: "Please choose your Department!",
            },
          ]}
        >
          <Select
            placeholder="Please choose your Department"
            allowClear
            options={departments?.data?.data?.map((department, index) => {
              return {
                label: department?.departmentName,
                value: department?.departmentId,
              };
            })}
            onChange={handleChange}
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
