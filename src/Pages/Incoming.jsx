import React, { useState, useEffect } from "react";
import { Table, Modal, Form, Select, message, Popover } from "antd";
import { useTrail } from "./CustomHook/useTrail";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "../Components/axiosInstance";
import { ForwardOutlined } from "@ant-design/icons";
import { LuForward } from "react-icons/lu";
import { RiInboxArchiveFill } from "react-icons/ri";
import ArchiveFiles from "../Components/modals/Archive/ArchiveFiles";

import { useParams } from "react-router-dom";

const Incoming = () => {
  const { id } = useParams();
  const { trails } = useTrail("incoming");
  const [show, setShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [record, setRecord] = useState({});

  const [senderId, setSenderId] = useState("")

  const queryClient = useQueryClient();

  function handleFile(selectedRecord) {
    setShow(true);
    setSenderId(selectedRecord);
    setRecord(selectedRecord?.document);
  }

  // console.log(trails);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selected, setSelected] = useState("");

  // useQuery for getting all  divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  // console.log(divisions?.data);

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ["options"],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });
  // console.log(departments?.data?.data);

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: false,
  });
  // console.log(users?.data);

  // useMutation to forward Document

  const { mutate: forwardDocument } = useMutation({
    mutationKey: "forwardDocument",
    mutationFn: (values) => {
      console.log(values);
      console.log(`Document Id: ${selected}`);
      return axiosInstance.patch(`/trail/${selected}`, {
        userId: values?.userId,
        status: "Forwarded",
      });
    },
    onSuccess: () => {
      message.success("Document has been successfully forwarded!");
      queryClient.invalidateQueries({ queryKey: ["trail"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
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

  const handleClick = (selectedRecord) => {
    setIsModalOpen(true);
    // console.log(`selected id: ${selectedRecord?.docID}`);
    setSelected(selectedRecord?.docID);
  };

  const handleFormSubmit = (selectedRecord) => {
    console.log(selectedRecord);
    forwardDocument(selectedRecord);
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "document",
      key: "subject",
      render: (document) => {
        //   console.log(document);
        return <div>{document.subject}</div>;
      },
    },
    {
      title: "Reference",
      dataIndex: "document",
      key: "ref",
      render: (document) => {
        return <div>{document.ref}</div>;
      },
    },

    {
      title: "Sender",
      dataIndex: ["sender", "name"],
      key: "receiver",
    },

    {
      title: "Division",
      key: "division",
      render: (document) => {
        return <div>{document.document.division.divisionName}</div>;
      },
    },

    {
      title: "Department",
      key: "department",
      render: (document) => {
        return <div>{document.document.department.departmentName}</div>;
      },
    },
    {
      title: "Date",
      key: "action",
      dataIndex: "createdAt",
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        //   console.log(dateTime.toDateString());
        //   const year = dateTime.getFullYear();
        //   const month = (dateTime.getMonth() + 1).toString();
        //   const day = dateTime.getDate().toString().padStart(2, "0");
        //   const readableTime = `${day}-${month}-${year}`;
        //   console.log(readableTime);
        return <div>{dateTime.toDateString()}</div>;
      },
    },
    {
      title: "Time",
      key: "time",
      dataIndex: "createdAt",
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toLocaleTimeString()}</div>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (selectedRecord) => (
        <div className="flex gap-2">
          <Popover
            content={
              <div>
                <p>Forward</p>
              </div>
            }
          >
            <button
              className="text-[21px]"
              onClick={() => handleClick(selectedRecord)}
            >
              <LuForward className="text-[22px]" />
            </button>
          </Popover>

          <Popover
            content={
              <div>
                <p>Archive</p>
              </div>
            }
          >
            <button
              // className="bg-[#582f08] text-white px-2 rounded-lg font-semibold text-[0.9rem]"
              onClick={() => handleFile(selectedRecord)}
            >
              {/* <img
                className="w-[23px]"
                src="../../src/assets/archive.3b9ddd7f65d8f9353f8fd0efad0c45.svg "
                alt=""
              /> */}
              <RiInboxArchiveFill className="text-[22px]" />
            </button>
          </Popover>
        </div>
      ),
    },
  ];

  const _data = trails.map((s) => ({
    ...s,
    key: s.docId,
  }));
  // console.log(_data);

  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]  ">
      <Table columns={columns} dataSource={_data} />
      <Modal
        name="Forward Document"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          name="Forward Document"
          onFinish={(values) => handleFormSubmit(values)}
        >
          <Form.Item
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
          <Form.Item className=" flex justify-center">
            <button
              className="bg-[#582F08] px-5 py-1 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              Submit
            </button>
          </Form.Item>
        </Form>
      </Modal>
      {show ? (
        <ArchiveFiles show={show} setShow={setShow} id={id} record={record} sender={senderId?.sender?.userId} />
      ) : null}
    </div>
  );
};

export default Incoming;
