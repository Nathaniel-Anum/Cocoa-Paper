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
    <div>
      <div className=" px-[240px] pt-[50px] ">
        <div className="flex justify-end mb-4">
          <Input.Search
            placeholder="Search roles..."
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

export default Role;
