import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Input,
  Form,
  message,
  Select,
  Popconfirm,
  Spin,
  Tag,
  Checkbox,
} from 'antd';
import axiosInstance from '../axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { addUser } from '../../http/users';
import { getStaff } from '../../http/staff';
import { getDepartments } from '../../http/department';
import { EditTwoTone, DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';
import Edit from '../modals/Staff/Edit';
import { capitalize } from '../../../utils/typography';
import { useGetRoles } from '../../queryHooks/user';
import OTPToggleButton from '../OTPToggleButton';

const Staff = () => {
  const queryClient = useQueryClient();
  const showModal = () => {
    setOpen(true);
  };

  const showPopup = (staff) => {
    setPopup(true);
    setStaffDetail(staff);
  };

  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for button
  const [searchText, setSearchText] = useState('');
  const [isDepartment, setIsDepartment] = useState(false);
  const [isSecretariat, setIsSecretariat] = useState(false);

  const [staffDetail, setStaffDetail] = useState({});

  const handleCancel = () => {
    setOpen(false);
  };

  const [form] = Form.useForm();

  // axiosInstance.get("/staff").then((res) => console.log(res));

  // useQuery for divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });

  const { data: roles } = useGetRoles();

  // useQuery for departments
  const { data: departments, refetch } = useQuery({
    queryKey: ['options'],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });
  // console.log(departments?.data?.data);

  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);
  // console.log(departments?.data);

  // useQuery to fetch staffs
  const { data, isLoading } = useQuery({
    queryKey: ['staffs'],
    queryFn: () => {
      return axiosInstance.get('/staff');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
    },
  });
  // console.log(data?.data?.staff);

  // useMutation to add staffs
  const { mutate, isPending: addUserLoading } = useMutation({
    mutationKey: 'staff',
    mutationFn: (values) => {
      // console.log(values);
      setLoading(true);
      return axiosInstance.post('/staff', values); //This way or
      // addUser(data);  //This way
    },
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
      form.resetFields();
      message.success('Staff added successfully!');
      queryClient.invalidateQueries({ mutationKey: 'staff' });
    },
    onError: (error) => {
      setLoading(false);
      setOpen(false);
      form.resetFields();
      const resp = error?.response;
      const serverMessage = resp?.data?.error || resp?.data?.message;
      if (Array.isArray(serverMessage)) {
        const first = serverMessage[0]?.msg || serverMessage[0];
        message.error(first || 'Failed to add staff');
      } else {
        message.error(serverMessage || error.message || 'Failed to add staff');
      }
      console.log(resp?.data);
    },
  });

  // useMutation to delete staff
  const { mutate: deleteMutate } = useMutation({
    mutationKey: 'staffDelete',
    mutationFn: (staffId) => {
      return axiosInstance.delete(`/staff/${staffId}`);
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ mutationKey: 'staffDelete' });
      message.success('Staff deleted successfully!');
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const _data = data?.data?.staff?.map((s) => ({
    ...s,
    key: s?.email,
  }));
  // console.log(_data);

  const handleSubmit = (values) => {
    mutate({ ...values, isDepartment });
  };

  const handleDepartmentChange = (value) => {
    // console.log(`selected: ${value}`);
  };
  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
    setSelectedDivision(value);
  };

  const confirm = (staffId) => {
    deleteMutate(staffId);
  };
  const cancel = (e) => {
    // console.log(e);
    // message.error("Click on No");
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const roles = record.role?.map(r => r.role?.toLowerCase()).join(' ') || '';
        return (
          record.name?.toLowerCase().includes(search) ||
          record.email?.toLowerCase().includes(search) ||
          record.department?.departmentName?.toLowerCase().includes(search) ||
          record.division?.divisionName?.toLowerCase().includes(search) ||
          record.staff?.staffNumber?.toLowerCase().includes(search) ||
          roles.includes(search)
        );
      },
    },
    {
      title: 'Staff Number',
      dataIndex: ['staff', 'staffNumber'],
      key: 'age',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },

    {
      title: 'Division',
      key: 'action',
      dataIndex: ['division', 'divisionName'],
      render: (value) => <span>{capitalize(value)}</span>,
    },
    {
      title: 'Department',
      key: 'action',
      dataIndex: ['department', 'departmentName'],
      render: (value) => <span>{capitalize(value)}</span>,
    },
    {
      title: 'Is Main Secretariat',
      key: 'isDepartment',
      dataIndex: ['staff', 'isDepartment'],
      render: (value) => <span>{value ? 'Yes' : 'No'}</span>,
    },
    {
      title: 'Is  Secretariat',
      key: 'isSecretariat',
      dataIndex: ['staff', 'isSecretariat'],
      render: (value) => <span>{value ? 'Yes' : 'No'}</span>,
    },

    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (value) => {
        return value?.map((role, idx) => {
          return <Tag key={idx}>{capitalize(role.role)}</Tag>;
        });
      },
    },
    // {
    //   title: '2FA Status',
    //   key: 'otpStatus',
    //   dataIndex: 'userId',
    //   render: (userId, record) => (
    //     <OTPToggleButton staffUserId={userId} staffName={record.name} />
    //   ),
    // },
    // {
    //   title: '2FA Scan Status',
    //   key: 'otpScanStatus',
    //   dataIndex: 'scanComplete',
    //   render: (scanComplete) =>
    //     scanComplete ? (
    //       <Tag color="green">Scanned</Tag>
    //     ) : (
    //       <Tag color="red">Not Scanned</Tag>
    //     ),
    // },

    {
      title: 'Actions',
      dataIndex: ['staff', 'StaffId'],
      render: (x, y) => (
        <div className="flex gap-3 text-[17px]">
          <button onClick={() => showPopup(y)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete Staff"
            description="Are you sure to delete this staff?"
            onConfirm={() => confirm(y?.staff?.staffId)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
            overlayClassName="popconfirm-custom"
          >
            <button>
              <DeleteTwoTone twoToneColor="#FF0000" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="pl-[236px] pr-8 pt-6 pb-8 min-h-screen">
        <Modal
          open={open}
          title="Add Staff"
          onCancel={handleCancel}
          footer={null}
          maskClosable={false}
        >
          <Form
            name="addStaff"
            onFinish={(values) => handleSubmit(values)}
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your name!',
                },
              ]}
            >
              <Input placeholder="Name" allowClear />
            </Form.Item>
            <Form.Item
              name="staffNumber"
              label="Staff ID"
              rules={[
                {
                  required: true,
                  message: 'Please input your staff ID!',
                },
              ]}
            >
              <Input placeholder="Staff Number" allowClear />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
              ]}
            >
              <Input placeholder="Email" allowClear />
            </Form.Item>
            <Form.Item
              name="divisionId"
              label="Division"
              rules={[
                {
                  required: true,
                  message: 'Please choose your Division!',
                },
              ]}
            >
              <Select
                placeholder="Please choose your Division"
                showSearch
                optionFilterProp="label"
                allowClear
                options={divisions?.data.map((division, index) => {
                  return {
                    label: division?.divisionName,
                    value: division?.divisionId,
                  };
                })}
                onChange={handleDivisionChange}
              />
            </Form.Item>
            <Form.Item
              name="departmentId"
              label="Department"
              rules={[
                {
                  required: true,
                  message: 'Please choose your Department!',
                },
              ]}
            >
              <Select
                placeholder="Please choose your Department"
                showSearch
                optionFilterProp="label"
                allowClear
                options={departments?.data?.data?.map((department, index) => {
                  return {
                    label: department?.departmentName,
                    value: department?.departmentId,
                  };
                })}
                onChange={handleDepartmentChange}
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                onChange={(e) => setIsDepartment(e.target.checked)}
                checked={isDepartment}
              >
                Setup as Main Secretariat
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox
                onChange={(e) => setIsSecretariat(e.target.checked)}
                checked={isSecretariat}
              >
                Setup as Secretariat
              </Checkbox>
            </Form.Item>
            <Form.Item name="roleId" label="Role" required>
              <Select
                placeholder="Choose Role"
                showSearch
                optionFilterProp="label"
                options={
                  roles?.data?.data.map((role) => ({
                    label: role.role,
                    value: role.roleId,
                  })) || []
                }
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
                loading={addUserLoading}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
            <h2 className="text-lg font-bold text-[#582F08]">Staff Members</h2>
            <div className="flex gap-3 items-center">
              <Input.Search
                className="w-72"
                placeholder="Search staff..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                onClick={showModal}
                style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
                loading={loading}
              >
                Add Staff
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
      <Edit
        popup={popup}
        staffDetail={staffDetail}
        divisions={divisions}
        roles={roles}
        setPopup={setPopup}
      />
    </div>
  );
};
export default Staff;
