import React, { useState } from "react";
import { Table, Input } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
const Division = () => {
  const [searchText, setSearchText] = useState('');
  
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
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return record.divisionName?.toLowerCase().includes(value.toLowerCase());
      },
      render: (text) => <a>{text}</a>,
    },
  ];

  return (
    <div>
      <div className=" px-[240px] pt-[50px] ">
        <div className="flex justify-end mb-4">
          <Input.Search
            placeholder="Search divisions..."
            className="w-[30rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Table columns={columns} dataSource={_data} />
      </div>
    </div>
  );
};

export default Division;
