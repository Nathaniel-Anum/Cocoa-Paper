import React from "react";
import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../Components/axiosInstance";
const WorkHistory = () => {
  const { data: workHistory } = useQuery({
    queryKey: ["workHistory"],
    queryFn: () => {
      return axiosInstance.get("/archived-trails");
    },
  }); // Fetch work history data
  console.log(workHistory?.data);
  const dataSource = [
    {
      key: "1",
      name: "Mike",
      age: 32,
      address: "10 Downing Street",
    },
    {
      key: "2",
      name: "John",
      age: 42,
      address: "10 Downing Street",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];
  return (
    <div className="pt-[70px] h-screen w-full pl-[200px] pr-[72px]">
      <p>This is the Work History Page...</p>
      <Table dataSource={dataSource} columns={columns} />;
    </div>
  );
};

export default WorkHistory;
