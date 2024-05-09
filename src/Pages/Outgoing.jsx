import React from "react";
import { Table } from "antd";
import { useTrail } from "./CustomHook/useTrail";

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
    title: "Receiver",
    dataIndex: ["receiver", "name"],
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
    key: "action",
    dataIndex: "createdAt",
    render: (createdAt) => {
      const dateTime = new Date(createdAt);
      return <div>{dateTime.toLocaleTimeString()}</div>;
    },
  },
];

const Outgoing = () => {
  const { trails, isLoading } = useTrail("outgoing");

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

export default Outgoing;
