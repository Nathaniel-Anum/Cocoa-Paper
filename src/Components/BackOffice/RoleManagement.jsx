import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import {
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Popconfirm,
} from 'antd';
import { EditTwoTone, DeleteTwoTone, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const RoleManagement = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [wholeRecord, setWholeRecord] = useState({});
  const [searchText, setSearchText] = useState('');

  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  const handleChange = (value) => {
    // console.log(`selected: ${value}`);
  };

  const showPopup = (role) => {
    setOpen(true);
    setWholeRecord(role);
  };
  // console.log(wholeRecord);

  const colors = [
    '#f50',
    '#2db7f5',
    '#87d068',
    '#108ee9',
    '#e84118',
    '#fbc531',
    '#9c88ff',
  ];

  // Function to get a color based on the index
  const getColor = (index) => colors[index % colors.length];

  //useQuery to get permissions
  const { data: permission } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => {
      return axiosInstance.get('/permission');
    },
  });

  //useQuery to get role
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => {
      return axiosInstance.get('/role');
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
      // console.log(wholeRecord.role);
      form.setFieldsValue({
        role: wholeRecord?.role,
        permissions: wholeRecord?.rolePermissions?.map((permission, index) => {
          return permission?.permission?.permissionsId;
        }),
      });
    }
  }, [wholeRecord]);

  //UsMutation to edit permissions assigned to roles
  const { mutate, isPending: updateLoading } = useMutation({
    mutationKey: 'permission',
    mutationFn: (values) => {
      // console.log(values);
      return axiosInstance.patch(`/role/${wholeRecord?.roleId}`, values);
    },
    onSuccess: () => {
      setOpen(false);
      message.success('Successfully Updated');
      queryClient.invalidateQueries({ mutationKey: 'permission' });
    },
    onError: (error) => {
      message.error(error);
    },
  });

  //UseMutation to delete Role
  const { mutate: deleteMutate } = useMutation({
    mutationKey: 'deleteRole',
    mutationFn: (roleId) => {
      return axiosInstance.delete(`/role/${roleId}`);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ mutationKey: 'deleteRole' });
      message.success('Role Successfully Deleted!');
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleCancel = () => {
    setOpen(false);
  };

  //UseMutation to create Role
  const { mutate: createMutate, isPending: createLoading } = useMutation({
    mutationKey: 'createRole',
    mutationFn: (values) => {
      return axiosInstance.post('/role', values);
    },
    onSuccess: () => {
      setCreateOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Role Created Successfully!');
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to create role');
    },
  });

  const handleCreate = (values) => {
    createMutate(values);
  };
  const cancel = (e) => {
    // console.log(e);
  };

  const confirm = (roleId) => {
    deleteMutate(roleId);
  };

  const handleUpdate = (values) => {
    mutate(values);
  };
  const columns = [
    {
      title: ' Role Title',
      dataIndex: 'role',
      key: 'name',
      width: '25%',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const permissions = record.rolePermissions?.map(p => p.permission?.permission?.toLowerCase()).join(' ') || '';
        return (
          record.role?.toLowerCase().includes(search) ||
          permissions.includes(search)
        );
      },
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Permissions',
      dataIndex: 'rolePermissions',
      render: (rolePermissions) => {
        // console.log(rolePermissions);
        return rolePermissions.map((permission, index) => (
          <Tag color={getColor(index)} key={index} className="">
            {permission.permission.permission.toLowerCase()}
          </Tag>
          // <div key={index}>{permission.permission.permission}</div>
        ));
      },
    },
    {
      title: 'Actions',
      width: '25%',
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
            <button>{/* <DeleteTwoTone twoToneColor="#FF0000" /> */}</button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {/* Edit Role Modal */}
      <Modal
          open={open}
          title="Edit Role Management"
          onCancel={handleCancel}
          footer={null}
          maskClosable={false}
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
                  message: 'Please input your name!',
                },
              ]}
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item name="permissions" label="Permission">
              {/* <Select
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
              /> */}
              <Select
                placeholder="Please choose your permission"
                mode="multiple"
                showSearch
                optionFilterProp="label"
                options={permission?.data?.map((permission, index) => {
                  return {
                    label: permission?.permission,
                    value: permission?.permissionsId,
                  };
                })}
                onChange={handleChange}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
                loading={updateLoading}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      {/* Create Role Modal */}
      <Modal
        open={createOpen}
        title="Create New Role"
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        footer={null}
        maskClosable={false}
      >
        <Form
          name="Create"
          form={createForm}
          layout="vertical"
          onFinish={(values) => handleCreate(values)}
        >
          <Form.Item
            name="role"
            label="Role Title"
            rules={[{ required: true, message: 'Please enter a role name!' }]}
          >
            <Input placeholder="e.g. MANAGER" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select at least one permission!' }]}
          >
            <Select
              placeholder="Select permissions"
              mode="multiple"
              showSearch
              optionFilterProp="label"
              options={permission?.data?.map((p) => ({
                label: p?.permission,
                value: p?.permissionsId,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button
              className="w-full"
              type="primary"
              htmlType="submit"
              loading={createLoading}
              style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
            >
              Create Role
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
          <h2 className="text-lg font-bold text-[#582F08]">Role Management</h2>
          <div className="flex gap-3 items-center">
            <Input.Search
              placeholder="Search by role or permission..."
              className="w-72"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
            >
              Create Role
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={_data}
            loading={isLoading}
            className="backoffice-table"
            rowClassName={(_, i) => (i % 2 !== 0 ? 'backoffice-row-alt' : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
