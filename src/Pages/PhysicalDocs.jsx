import React, { useState } from 'react';
import { Dropdown, Input, message, Table } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTrail } from './CustomHook/useTrail';
import axiosInstance from '../Components/axiosInstance';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../Components/PageHeader';

const PhysicalDocs = () => {
  const { trails, isLoading } = useTrail('physical');
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

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

      render: (selectedRecord) => {
        const items = [
          {
            key: 'receive-document',
            label: (
              <span className="inline-flex items-center gap-2">
                <CheckOutlined />
                Receive Document
              </span>
            ),
            onClick: () => handleButtonClick(selectedRecord),
          },
          {
            key: 'view-document',
            label: 'View Document',
            onClick: () => navigate(`/view-document/${selectedRecord?.docID}`),
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors">
              <MoreOutlined className="text-lg text-[#9D4D01]" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  // mapping through the data, assigning it to a variable to pass to table.
  const _data = trails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);
  return (
    <div className="page-shell">
      <PageHeader
        title="Physical documents"
        description="Track physical document locations"
        meta={`${_data.length} document${_data.length === 1 ? '' : 's'}`}
        extra={
          <Input.Search
            placeholder="Search subject, reference, sender..."
            className="w-full lg:w-[22rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da] overflow-x-auto">
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={_data}
            loading={isLoading}
            rowClassName={(_, index) => (index % 2 !== 0 ? 'bg-[#fffaf6]' : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default PhysicalDocs;
