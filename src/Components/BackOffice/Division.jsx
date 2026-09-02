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
    <div className="page-shell">
      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
          <h2 className="text-lg font-bold text-[#582F08]">Divisions</h2>
          <Input.Search
            placeholder="Search divisions..."
            className="w-72"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={_data}
            className="backoffice-table"
            rowClassName={(_, i) => (i % 2 !== 0 ? 'backoffice-row-alt' : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default Division;
