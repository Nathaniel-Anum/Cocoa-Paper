import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { Table, Input } from "antd";
import { useState } from "react";

const Role = () => {
  const [searchText, setSearchText] = useState('');
  
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => {
      return axiosInstance.get("/role");
    },
  });
  //   console.log(roles?.data);

  // Roles data passed to table
  const _data = roles?.data?.data?.map((s) => ({
    ...s,
    key: s?.roleId,
  }));
  // console.log(_data);

  const columns = [
    {
      title: " Roles",
      dataIndex: "role",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return record.role?.toLowerCase().includes(value.toLowerCase());
      },
      render: (text) => <a>{text}</a>,
    },
  ];

  return (
    <div className="page-shell">
      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
          <h2 className="text-lg font-bold text-[#582F08]">Roles</h2>
          <Input.Search
            placeholder="Search roles..."
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

export default Role;
