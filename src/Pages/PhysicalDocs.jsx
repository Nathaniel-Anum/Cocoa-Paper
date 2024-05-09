import React, { useState, useEffect } from "react";
import { Table, message, Modal, Form, Input, Select } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTrail } from "./CustomHook/useTrail";
import axiosInstance from "../Components/axiosInstance";

const PhysicalDocs = () => {
  const { trails, isLoading } = useTrail();

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

 
  

  // useMutation to update Document Trial Status
  const { mutate: updateTrial } = useMutation({
    mutationKey: "updateTrial",
    mutationFn: (selectedRecord) => {
      return axiosInstance.patch(`/trail/${selectedRecord?.docID}`, {
        userId: selectedRecord?.sender?.userId,
        status: "Received",
      });
    },
    onSuccess: () => {
      message.success("Document Received successfully!");
      queryClient.invalidateQueries({ queryKey: ["trail"] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.Trail?.error);
    },
  });

 

  const handleButtonClick = (selectedRecord) => {
    // console.log(selectedRecord);
    updateTrial(selectedRecord);
  };


  // if (isPending)
  //   return (
  //     <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]  ">
  //       Loading...
  //     </div>
  //   );
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
      key: "sender",
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
      key: "action",
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
        <div>
          <div className="flex gap-2">
            <button
              className="bg-[#582f08] text-white px-2 rounded-lg font-semibold text-[0.9rem]"
              onClick={() => handleButtonClick(selectedRecord)}
            >
              Receive
              {/* <RightSquareTwoTone /> */}
            </button>
            <button
              className=" bg-[#582f08] text-white px-2 py-1 rounded-lg font-semibold text-[0.9rem]"
              onClick={() => console.log(selectedRecord)}
            >
              Archive
              {/* <RightSquareTwoTone /> */}
            </button>
          </div>
        </div>
      ),
    },
  ];

  // mapping through the data, assigning it to a variable to pass to table.
  const _data = trails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);
  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]  ">
      <Table columns={columns} dataSource={_data} loading={isLoading} />
      
    </div>
  );
};

export default PhysicalDocs;
