import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Form, Input, Select, message } from "antd";
import axiosInstance from "../Components/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Lottie from "react-lottie";
import CreateDoc from "../../src/lotties/create-doc.json";

const AddDocument = () => {
  const queryClient = useQueryClient();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: CreateDoc,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const [form] = Form.useForm();
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // axiosInstance.get("/document").then((res) => {
  //   console.log(res);
  // }).catch(error => console.log(error));

  // useQuery for getting all  divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  // console.log(divisions.data);

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ["departments", selectedDivision],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: !!selectedDivision,
  });
  // console.log(departments?.data?.data);

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ["users", selectedDepartment],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: !!selectedDepartment,
  });
  console.log(users?.data);

  // useMutation to add Documents
  const { mutate } = useMutation({
    mutationKey: "document",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/document", values);
    },
    onSuccess: () => {
      message.success("document created successfully!");
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["trail"] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.error);
    },
  });

  console.log(selectedDepartment);

  useEffect(() => {
    if (selectedDivision) {
      // refetch();
      form.setFieldValue("departmentId", "");
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      // fetchUsers();
      form.setFieldValue("userId", "");
    }
  }, [selectedDepartment]);

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
    setSelectedDivision(value);
  };

  const handleDepartmentChange = (value) => {
    console.log(`selected Department: ${value}`);
    setSelectedDepartment(value);
  };

  const handleUserChange = (value) => {
    console.log(`selected User: ${value}`);
  };

  const handleSubmit = (values) => {
    mutate(values);
    // form.resetFields();
    // console.log(values);
    // console.log("object");
  };
  return (
    <div>
      <div className=" px-[240px] pt-[120px] grid grid-cols-2">
        <div>
          <p className="font-bold text-[29px] text-[#694421]">
            Add Document/Attachment
            <div className="w-72 h-1 bg-[#694421]"></div>
          </p>

          <div className="py-7">
            <Form
              form={form}
              // labelCol={{
              //   span: 4,
              // }}
              wrapperCol={{
                span: 13,
              }}
              layout="vertical"
              style={{
                maxWidth: 800,
              }}
              className=""
              name="Add Document"
              onFinish={(values) => handleSubmit(values)}
            >
              <Form.Item label="Ref" name="ref">
                <Input placeholder="Input a Reference Number" />
              </Form.Item>
              <Form.Item label="Subject" name="subject">
                <Input placeholder="Input a Subject" />
              </Form.Item>
              <Form.Item label=" Document Category" name="documentType">
                <Select placeholder="Select Document Type">
                  <Select.Option value="Custom">Custom</Select.Option>
                  <Select.Option value="Medicals">Medicals</Select.Option>
                  <Select.Option value="Transport_Requisition">
                    Transport Requisition
                  </Select.Option>
                </Select>
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
                  onChange={handleDepartmentChange}
                />
              </Form.Item>
              <Form.Item
                name="userId"
                label="User"
                rules={[
                  {
                    required: true,
                    message: "Please select a User!",
                  },
                ]}
              >
                <Select
                  placeholder="Please select a User"
                  allowClear
                  options={users?.data.map((user, index) => {
                    return {
                      label: user?.name,
                      value: user?.userId,
                    };
                  })}
                  onChange={handleUserChange}
                />
              </Form.Item>

              <Form.Item className="flex justify-end pr-[330px]">
                <button className="bg-[#582F08] px-5 py-1 text-white">
                  Submit
                </button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <Lottie options={defaultOptions} height={450} width={450} />
      </div>
    </div>
  );
};

export default AddDocument;
