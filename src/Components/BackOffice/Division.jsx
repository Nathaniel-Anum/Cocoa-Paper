import React from "react";
import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
const Division = () => {
  //   useQuery to fetch division
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });
  //   console.log(divisions && divisions?.data);

  // Division data passed to table
  const _data = divisions?.data?.map((s) => ({
    ...s,
    key: s?.email,
  }));
  console.log(_data);

  const columns = [
    {
      title: " Division Name",
      dataIndex: "divisionName",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
  ];

  return (
    <div>
      <div className=" px-[240px] pt-[50px] ">
        <Table columns={columns} dataSource={_data} />
      </div>
    </div>
  );
};

export default Division;
