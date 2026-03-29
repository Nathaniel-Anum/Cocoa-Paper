import React, { useState, useEffect } from 'react';
import { Table, message, Popover, Form, Input, Select, Tooltip } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTrail } from './CustomHook/useTrail';
import axiosInstance from '../Components/axiosInstance';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { useUser } from './CustomHook/useUser';

const PhysicalDocs = () => {
  const { trails, isLoading } = useTrail('physical');
  const navigate = useNavigate();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);
  const [searchText, setSearchText] = useState('');

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  // useMutation to update Document Trial Status
  const { mutate: updateTrial } = useMutation({
    mutationKey: 'updateTrial',
    mutationFn: (selectedRecord) => {
      return axiosInstance.patch(`/trail/${selectedRecord?.docID}`, {
        userId: selectedRecord?.sender?.userId,
        status: 'Received',
      });
    },
    onSuccess: () => {
      message.success('Document Received Successfully!');
      queryClient.invalidateQueries({ queryKey: ['trail'] });
      if (_data.length < 1) {
        navigate('/dashboard/incoming');
      }
    },
    onError: (error) => {
      message.error(error?.response?.data?.trail?.error);
    },
  });

  const handleButtonClick = (selectedRecord) => {
    console.log(selectedRecord);
    updateTrial(selectedRecord);
  };

  // if (isPending)
  //   return (
  //     <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]  ">
  //       Loading...
  //     </div>
  //   );
  const columns = [
    {
      title: 'Subject',
      dataIndex: 'document',
      key: 'subject',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.document?.subject?.toLowerCase().includes(search) ||
          record.document?.ref?.toLowerCase().includes(search) ||
          record.sender?.name?.toLowerCase().includes(search) ||
          record.document?.division?.divisionName?.toLowerCase().includes(search) ||
          record.document?.department?.departmentName?.toLowerCase().includes(search)
        );
      },
      render: (document) => {
        //   console.log(document);
        return <div>{document.subject}</div>;
      },
    },
    {
      title: 'Reference',
      dataIndex: 'document',
      key: 'ref',
      render: (document) => {
        return <div>{document.ref}</div>;
      },
    },
    {
      title: 'Sender',
      dataIndex: ['sender', 'name'],
      key: 'sender',
    },

    {
      title: 'Division',
      key: 'division',
      render: (document) => {
        return <div>{document.document.division.divisionName}</div>;
      },
    },
    {
      title: 'Department',
      key: 'department',
      render: (document) => {
        return <div>{document.document.department.departmentName}</div>;
      },
    },
    {
      title: 'Date',
      key: 'action',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        //   console.log(dateTime.toDateString());
        //   const year = dateTime.getFullYear();
        //   const month = (dateTime.getMonth() + 1).toString();
        //   const day = dateTime.getDate().toString().padStart(2, "0");
        //   const readableTime = `${day}-${month}-${year}`;
        //   console.log(readableTime);
        return <div>{dateTime.toDateString()}</div>;
      },
    },
    {
      title: 'Time',
      key: 'action',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toLocaleTimeString()}</div>;
      },
    },
    {
      title: 'Actions',
      key: 'action',

      render: (selectedRecord) => (
        <div>
          <div className="flex gap-2">
            <Tooltip title={'Receive Document'}>
              <button
                // className="bg-[#582f08] text-white px-2 rounded-lg font-semibold text-[0.9rem]"

                onClick={() => handleButtonClick(selectedRecord)}
              >
                <CheckOutlined />
              </button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  // mapping through the data, assigning it to a variable to pass to table.
  const _data = trails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);
  return (
    <div className="">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#582F08]">Physical Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Track physical document locations</p>
      </div>

      <div className="flex justify-end mb-4">
        <Input.Search
          placeholder="Search by subject, reference, sender, department..."
          className="w-[30rem]"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table columns={columns} dataSource={_data} loading={isLoading} />
    </div>
  );
};

export default PhysicalDocs;
