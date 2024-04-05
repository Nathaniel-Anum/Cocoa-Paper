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
import axiosInstance from "../axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EditTwoTone, DeleteTwoTone, LoadingOutlined } from "@ant-design/icons";
import AddDepartment from "../modals/Department/AddDepartment";
import EditDepartment from "../modals/Department/EditDepartment";

const Department = () => {
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(false);
  const [departmentDetail, setDepartmentDetail] = useState({});

  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  const handleCancel = () => {
    setOpen(false);
  };
  const showModal = () => {
    setOpen(true);
  };
  const showPopup = (individualDepartment) => {
    setPopup(true);
    setDepartmentDetail(individualDepartment);
  };

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
  };

  // Usequery for department
  const { data: department } = useQuery({
    queryKey: ["departments"],
    queryFn: () => {
      return axiosInstance.get("/department");
    },
  });
  console.log(department && department?.data);

  // Department data passed to table
  const _data = department?.data?.map((s) => ({
    ...s,
    key: s?.email,
  }));
  // console.log(_data);

  // useQuery to fetch divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  // console.log(divisions && divisions?.data);

  const columns = [
    {
      title: " Department Name",
      dataIndex: "departmentName",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Division",
      dataIndex: ["division", ["divisionName"]],
    },

    {
      title: "Actions",
      dataIndex: "departmentId",
      render: (x, individualDepartment) => (
        <>
          <button onClick={() => showPopup(individualDepartment)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => console.log(confirmed)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <button>
              <DeleteTwoTone />
            </button>
          </Popconfirm>
        </>
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
            Add Department
          </Button>
        </div>
        <Table columns={columns} dataSource={_data} />
      </div>
      <AddDepartment setOpen={setOpen} open={open} />

      <EditDepartment
        setPopup={setPopup}
        popup={popup}
        departmentDetail={departmentDetail}
      />
    </div>
  );
};

export default Department;
