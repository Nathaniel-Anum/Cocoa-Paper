import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { Table, Tag, Modal, Form, Input, Select, Button, message, Popconfirm } from "antd";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { set } from "lodash";

const RoleManagement = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [wholeRecord, setWholeRecord] = useState({});
  const [form] = Form.useForm();

  const handleChange = (value) => {
    console.log(`selected: ${value}`);
  };

  const showPopup = (role) => {
    setOpen(true);
    setWholeRecord(role);
  };
  console.log(wholeRecord);

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
  // console.log(_data);

  useEffect(() => {
    if (wholeRecord) {
      console.log(wholeRecord.role);
      form.setFieldsValue({
        role: wholeRecord?.role,
        permissions: wholeRecord?.rolePermissions?.map((permission, index) => {
          return permission?.permission?.permissionsId;
        }),
      });
    }
  }, [wholeRecord]);

  //UsMutation to edit permissions assigned to roles
  const { mutate } = useMutation({
    mutationKey: "permission",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.patch(`/role/${wholeRecord?.roleId}`, values);
    },
    onSuccess: () => {
      setOpen(false);
      message.success("Updated Successfully");
      queryClient.invalidateQueries({ mutationKey: "permission" });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //UseMutation to delete Role
  const { mutate: deleteMutate } = useMutation({
    mutationKey: "deleteRole",
    mutationFn: (roleId) => {
      return axiosInstance.delete(`/role/${roleId}`)
    }, 
    onSuccess: () => {
      setOpen(false)
      queryClient.invalidateQueries({ mutationKey: "deleteRole" });
      message.success("Role Successfully Deleted!");
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const handleCancel = () => {
    setOpen(false);
  };
  const cancel = (e) => {
    console.log(e);
  };

  const confirm = (roleId) => {
    deleteMutate(roleId);
  };

  const handleUpdate = (values) => {
    mutate(values);
  };
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
        // console.log(rolePermissions);
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
      render: (x) => (
        <div className="flex gap-3 text-[17px]">
          <button onClick={() => showPopup(x)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete Staff"
            description="Are you sure to delete this staff?"
            onConfirm={() => confirm(x?.roleId)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <button>
              {/* <DeleteTwoTone twoToneColor="#FF0000" /> */}
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className=" px-[240px] pt-[50px] ">
        <Modal
          open={open}
          title="Edit Role Management"
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            name="Edit"
            form={form}
            onFinish={(values) => handleUpdate(values)}
          >
            <Form.Item
              name="role"
              // initialValue={wholeRecord?.role}
              disabled
              label="Role Title"
              rules={[
                {
                  required: true,
                  message: "Please input your name!",
                },
              ]}
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item name="permissions" label="Permission">
              <Select
                placeholder="Please choose your permission"
                mode="multiple"
                options={wholeRecord?.rolePermissions?.map(
                  (permission, index) => {
                    return {
                      label: permission?.permission?.permission,
                      value: permission?.permission?.permissionsId,
                    };
                  }
                )}
                onChange={handleChange}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Table columns={columns} dataSource={_data} />
      </div>
    </div>
  );
};

export default RoleManagement;
