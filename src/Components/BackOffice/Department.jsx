import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Input,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
import axiosInstance from '../axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EditTwoTone, DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';
import AddDepartment from '../modals/Department/AddDepartment';
import EditDepartment from '../modals/Department/EditDepartment';

const Department = () => {
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(false);
  const [departmentDetail, setDepartmentDetail] = useState({});
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  const confirm = (departmentId) => {
    deleteMutate(departmentId);
  };

  const showModal = () => {
    setOpen(true);
  };
  const showPopup = (individualDepartment) => {
    setPopup(true);
    setDepartmentDetail(individualDepartment);
  };

  const handleDivisionChange = (value) => {
    console.log(`selected Division: ${value}`);
  };

  // Usequery for getting department
  const { data: department, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => {
      return axiosInstance.get('/department');
    },
  });
  // console.log(department && department?.data);

  // Department data passed to table
  const _data = department?.data?.map((s) => ({
    ...s,
    key: s?.email,
  }));
  // console.log(_data);

  // useQuery to fetch divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });
  // console.log(divisions && divisions?.data);

  // useMutation to delete department
  const { mutate: deleteMutate } = useMutation({
    mutationKey: 'deleteDepartment',
    mutationFn: (departmentId) => {
      return axiosInstance.delete(`/department/${departmentId}`);
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      message.success('Department deleted successfully!');
      queryClient.invalidateQueries({ mutationKey: 'staffDelete' });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const columns = [
    {
      title: ' Department Name',
      dataIndex: 'departmentName',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.departmentName?.toLowerCase().includes(search) ||
          record.division?.divisionName?.toLowerCase().includes(search)
        );
      },
    },
    {
      title: 'Division',
      dataIndex: ['division', ['divisionName']],
    },

    {
      title: 'Actions',
      dataIndex: 'departmentId',
      render: (x, individualDepartment) => (
        <div className="flex gap-3 text-[17px]">
          <button onClick={() => showPopup(individualDepartment)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete Department"
            description="Are you sure to delete this department?"
            onConfirm={() => confirm(individualDepartment?.departmentId)}
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
      <div className="page-shell">
        <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
            <h2 className="text-lg font-bold text-[#582F08]">Departments</h2>
            <div className="flex gap-3 items-center">
              <Input.Search
                className="w-72"
                placeholder="Search departments..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                onClick={showModal}
                style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
              >
                Add Department
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
      <AddDepartment setOpen={setOpen} open={open} />

      <EditDepartment
        setPopup={setPopup}
        popup={popup}
        departmentDetail={departmentDetail}
      />
    </div>
  );
};

export default Department;
