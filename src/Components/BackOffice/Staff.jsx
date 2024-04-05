import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Input,
  Form,
  message,
  Select,
  Popconfirm,
  Spin,
} from "antd";
import axiosInstance from "../axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { addUser } from "../../http/users";
import { getStaff } from "../../http/staff";
import { getDepartments } from "../../http/department";
import { EditTwoTone, DeleteTwoTone, LoadingOutlined } from "@ant-design/icons";
import Edit from "../modals/Staff/Edit";

const Staff = () => {
  const queryClient = useQueryClient();
  const showModal = () => {
    setOpen(true);
  };

  const showPopup = (staff) => {
    setPopup(true);
    setStaffDetail(staff);
  };

  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("");

  const [staffDetail, setStaffDetail] = useState({});

  const handleCancel = () => {
    setOpen(false);
  };

  const [form] = Form.useForm();

  // axiosInstance.get("/staff").then((res) => console.log(res));

  // useQuery for divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  // console.log(divisions.data);

  // useQuery for departments
  const { data: departments, refetch } = useQuery({
    queryKey: ["options"],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });
  // console.log(departments?.data?.data);

  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);
  // console.log(departments?.data);

  // useQuery to fetch staffs
  const { data, isLoading } = useQuery({
    queryKey: ["staffs"],
    queryFn: () => {
      return axiosInstance.get("/staff");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
  // console.log(data?.data?.staff);

  // useMutation to add staffs
  const { mutate, isPending } = useMutation({
    mutationKey: "staff",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/staff", values); //This way or
      // addUser(data);  //This way
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      message.success("Staff updated successfully!");
      queryClient.invalidateQueries({ mutationKey: "staff" });
    },
    onError: (error) => {
      setOpen(false);
      form.resetFields();
      console.log(error?.response?.data);
    },
  });

  // useMutation to delete staff
  const { mutate: deleteMutate } = useMutation({
    mutationKey: "staffDelete",
    mutationFn: (staffId) => {
      return axiosInstance.delete(`/staff/${staffId}`);
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ mutationKey: "staffDelete" });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const _data = data?.data?.staff?.map((s) => ({
    ...s,
    key: s?.email,
  }));
  // console.log(_data);

  const handleSubmit = (values) => {
    console.log("object");
    mutate(values);
  };

  if (isLoading || isPending)
    return <Spin className=" flex justify-center pt-[100px]" />;
  // return <div className="  flex justify-center pt-[100px] ">LOADING....</div>;

  const handleDepartmentChange = (value) => {
    console.log(`selected: ${value}`);
  };
  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
    setSelectedDivision(value);
  };

  const confirm = (staffId) => {
    deleteMutate(staffId);
  };
  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Staff Number",
      dataIndex: ["staff", "staffNumber"],
      key: "age",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Division",
      key: "action",
      dataIndex: ["division", "divisionName"],
    },
    {
      title: "Department",
      key: "action",
      dataIndex: ["department", "departmentName"],
    },
    {
      title: "Actions",
      dataIndex: ["staff", "StaffId"],
      render: (x, y) => (
        <div className="flex gap-2 text-[17px]">
          <button onClick={() => showPopup(y)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => confirm(y?.staff?.staffId)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <button>
              <DeleteTwoTone twoToneColor="#FF0000" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className=" px-[240px] pt-[100px] ">
        <div className=" flex justify-end py-[10px]">
          <Button
            type="primary"
            onClick={showModal}
            className="bg-[#582F08] text-[#edd3bb] font-semibold "
          >
            Add Staff
          </Button>
        </div>

        <Modal
          open={open}
          title="Add Staff"
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            name="addStaff"
            onFinish={(values) => handleSubmit(values)}
            form={form}
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
                onChange={handleDepartmentChange}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Table columns={columns} dataSource={_data} />
        {/* <Spin /> */}
      </div>
      <Edit
        popup={popup}
        staffDetail={staffDetail}
        divisions={divisions}
        setPopup={setPopup}
      />
    </div>
  );
};
export default Staff;
