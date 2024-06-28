import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { Table, Tag } from "antd";

const RoleManagement = () => {
  const colors = [
    "#f50",
    "#2db7f5",
    "#87d068",
    "#108ee9",
    "#e84118",
    "#fbc531",
    "#9c88ff",
  ];

  // Function to get a color based on the index
  const getColor = (index) => colors[index % colors.length];

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
      title: " Role Title",
      dataIndex: "role",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Permissions",
      dataIndex: "rolePermissions",
      render: (rolePermissions) => {
        console.log(rolePermissions);
        return rolePermissions.map((permission, index) => (
          <Tag color={getColor(index)} key={permission} className="">
            {permission.permission.permission}
          </Tag>
          // <div key={index}>{permission.permission.permission}</div>
        ));
      },
    },
    {
      title: "Actions",
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

export default RoleManagement;
