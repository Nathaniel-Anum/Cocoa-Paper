import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { Table } from "antd";

const Role = () => {
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
  console.log(_data);

  const columns = [
    {
      title: " Roles",
      dataIndex: "role",
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

export default Role;
