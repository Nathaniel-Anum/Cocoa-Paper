import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Input,
  Form,
  Select,
  message,
  Popconfirm,
} from "antd";
// import axiosInstance from "../axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";

const AddDepartment = ({ setOpen, open }) => {
  const handleCancel = () => {
    setOpen(false);
  };
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
  };

  const showModal = () => {
    setOpen(true);
  };
  const handleSubmit = (values) => {
    // console.log(values);
    mutate(values);
  };
  // useMutation to add department
  const { mutate } = useMutation({
    mutationKey: "departments",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/department", values);
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      message.success("Department Created successfully!");
      queryClient.invalidateQueries({ mutationKey: "departments" });
    },
    onError: (error) => {
      setOpen(false);
      form.resetFields();
      //   message.error(error?.response?.data?.result);
      console.log(error);
    },
  });

  // useQuery to fetch divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
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
                message: "Please input your Department Name!",
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
          <Form.Item>
            <Button
              className="w-full bg-[#9D4D01]"
              type="primary"
              htmlType="submit"
              onClick={showModal}
            >
              Add Department
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddDepartment;
