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

// const showModal = () => {
//   setPopup(true);
// };

const EditDepartment = ({ setPopup, popup, departmentDetail }) => {
  const queryClient = useQueryClient();
  const handleCancel = () => {
    setPopup(false);
  };

  const [form] = Form.useForm();
  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
  };
  // useQuery to fetch divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  // console.log(divisions && divisions?.data);

  useEffect(() => {
    if (departmentDetail) {
      console.log(departmentDetail);
      form.setFieldsValue({
        departmentName: departmentDetail.departmentName,
        divisionId: departmentDetail.divisionId,
      });
    }
  }, [departmentDetail]);

  // useMutation to edit Department
  const { mutate } = useMutation({
    mutationKey: "department",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.patch(
        `/department/${departmentDetail?.departmentId}`,
        values
      );
    },
    onSuccess: () => {
      setPopup(false);
      form.resetFields();
      message.success("Department updated successfully!");
      queryClient.invalidateQueries({ mutationKey: "department" });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleUpdate = (values) => {
    mutate(values);
  };

  return (
    <div>
      <Modal
        open={popup}
        title="Update Department"
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="addStaff"
          onFinish={(values) => handleUpdate(values)}
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
            >
              Update Department
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditDepartment;
