import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Form, Input, Select, message, Button } from "antd";
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
  const [loading, setLoading] = useState(false);

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
  const { mutate, isLoading } = useMutation({
    mutationKey: "document",
    mutationFn: (values) => {
      // console.log(values);
      return axiosInstance.post("/document", values);
    },
    onSuccess: () => {
      setLoading(false);
      message.success("Document Created Successfully!");
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["trail"] });
    },
    onError: (error) => {
      setLoading(false);
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
    setLoading(true);
    mutate(values);
    // form.resetFields();
    // console.log(values);
    // console.log("object");
  };

  return (
    <div>
      <div className=" px-[150px] pt-[60px] grid gap-8 place-items-center grid-cols-2">
        <div className="  bg-white rounded-md px-[3rem] ">
          <div className=" bg-white ">
            <p className="font-bold text-[29px] text-[#694421] py-2 ">
              Add Document
              <div className="w-[11rem] h-1 bg-[#694421]"></div>
            </p>

            <div className=" py-6 ">
              <Form
                form={form}
                layout="vertical"
                className=""
                name="Add Document"
                onFinish={(values) => handleSubmit(values)}
              >
                <Form.Item
                  label="Reference"
                  name="ref"
                  rules={[
                    {
                      required: true,
                      message: "Please input a Reference!",
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
                      message: "Please input a Subject",
                    },
                  ]}
                >
                  <Input placeholder="Input a Subject" />
                </Form.Item>
                <Form.Item
                  label=" Document Category"
                  name="documentType"
                  rules={[
                    {
                      required: true,
                      message: "Please select a Document Category!",
                    },
                  ]}
                >
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

                <Form.Item className="">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-[#582F08] text-white px-5 w-[18.7rem] py-1"
                    loading={loading}
                  >
                    Send
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
        <Lottie options={defaultOptions} height={450} width={450} />
      </div>
    </div>
  );
};

export default AddDocument;
