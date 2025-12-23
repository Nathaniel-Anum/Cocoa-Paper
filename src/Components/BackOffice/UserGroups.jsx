import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axiosInstance from '../axiosInstance';
import { useGetAllUsers } from '../../queryHooks/user';

const { Title } = Typography;

const UserGroups = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers } = useGetAllUsers();

  // Fetch user groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['userGroups'],
    queryFn: async () => {
      const response = await axiosInstance.get('/user-group');
      return response.data;
    },
  });

  const _data =
    groups &&
    groups.data?.map((s) => ({
      ...s,
      key: s?.id,
    }));
  // Fetch users

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axiosInstance.post('/user-group', values);
      return response.data;
    },
    onSuccess: () => {
      message.success('Group created successfully');
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      handleCancel();
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      message.error(error.response?.data?.error || 'Failed to create group');
    },
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await axiosInstance.patch(`/user-group/${id}`, values);
      return response.data;
    },
    onSuccess: () => {
      message.success('Group updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      handleCancel();
    },
    onError: (error) => {
      console.error('Error updating group:', error);
      message.error(error.response?.data?.error || 'Failed to update group');
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/user-group/${id}`);
      return response.data;
    },
    onSuccess: () => {
      message.success('Group deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
    },
    onError: (error) => {
      console.error('Error deleting group:', error);
      message.error(error.response?.data?.error || 'Failed to delete group');
    },
  });

  const showModal = (group = null) => {
    console.log({ group });

    if (group) {
      setEditingGroup(group);
      form.setFieldsValue({
        name: group.name,

        userIds: group.users.map((user) => user.userId) || [],
      });
    } else {
      setEditingGroup(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingGroup(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingGroup) {
        updateGroupMutation.mutate({ id: editingGroup.id, values });
      } else {
        createGroupMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id) => {
    deleteGroupMutation.mutate(id);
  };

  const getUserNames = (userIds) => {
    return userIds
      .map((user) => {
        return user ? user.name : '';
      })
      .filter((name) => name)
      .join(', ');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const userNames = record.users?.map(u => u.name?.toLowerCase()).join(' ') || '';
        return (
          record.name?.toLowerCase().includes(search) ||
          userNames.includes(search)
        );
      },
    },

    {
      title: 'Users',
      key: 'users',
      render: (_, record) => getUserNames(record.users),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <EditOutlined
            className="text-blue-500 text-lg cursor-pointer"
            onClick={() => showModal(record)}
          />

          <Popconfirm
            title="Are you sure you want to delete this group?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="text-red-500 text-lg cursor-pointer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //   if (isLoadingGroups || isLoadingUsers) {
  //     return (
  //       <div
  //         style={{
  //           display: 'flex',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           height: '100vh',
  //         }}
  //       >
  //         <Spin size="large" />
  //       </div>
  //     );
  //   }

  return (
    <div className="px-[240px] pt-[50px] ">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <Title level={2}>User Groups</Title>
        <div className="flex gap-4">
          <Input.Search
            placeholder="Search by group name or users..."
            className="w-[20rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            type="primary "
            className="bg-[#582f08]"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add New Group
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={_data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={isLoadingGroups}
      />

      <Modal
        title={editingGroup ? 'Edit User Group' : 'Add New User Group'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        cancelText="Cancel"
        confirmLoading={
          createGroupMutation.isPending || updateGroupMutation.isPending
        }
        footer={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            description: '',
            userIds: [],
          }}
          onFinish={(values) => handleSubmit(values)}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="userIds" label="Users">
            <Select
              mode="multiple"
              placeholder="Select users"
              optionFilterProp="label"
              style={{ width: '100%' }}
              loading={isLoadingUsers}
              options={
                users &&
                users.data.users.map((user) => ({
                  label: user.name,
                  value: user.userId,
                }))
              }
            />
            {/* {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))} */}
            {/* </Select> */}
          </Form.Item>
          <Button
            htmlType="submit"
            className="bg-[#582F08] text-[#edd3bb] font-semibold  w-full"
            loading={
              createGroupMutation.isPending || updateGroupMutation.isPending
            }
          >
            Submit
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserGroups;
