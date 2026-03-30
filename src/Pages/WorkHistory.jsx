import React, { useState } from 'react';
import { Dropdown, Input, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
import Trail from '../Components/Trail/Trail';
import { MoreOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { capitalize } from '../../utils/typography';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
const WorkHistory = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [trails, setTrails] = React.useState([]);
  const [searchText, setSearchText] = useState('');

  const setShowToolbar = useStore((state) => state.setShowToolbar);

  const navigate = useNavigate();

  const {
    data: workHistory,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['workHistory'],
    queryFn: () => {
      return axiosInstance.get('/archived-trails');
    },
  }); // Fetch work history data

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.subject?.toLowerCase().includes(search) ||
          record.file?.fileName?.toLowerCase().includes(search) ||
          record.ref?.toLowerCase().includes(search)
        );
      },
    },
    {
      title: 'File Name',
      dataIndex: ['file', 'fileName'],
      key: 'FileName',
      render: (value) => <span>{value && capitalize(value)}</span>,
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      key: 'ref',
    },
    {
      title: 'Action',
      dataIndex: 'trail',
      key: 'trail',
      render: (value, record) => {
        const items = [
          {
            key: 'view-document',
            label: 'View Document',
            onClick: () => {
              setShowToolbar(false);
              navigate(`/view-document/${record?.docID}`);
            },
          },
          {
            key: 'view-trail',
            label: 'View Trail',
            onClick: () => {
              setShowModal(true);
              setTrails(value);
            },
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

  //useQuery to fetch recovery

  const _data =
    workHistory &&
    workHistory.data.map((item) => ({
      ...item,
      key: item.id,
    }));

  if (error) {
    return (
      <div className="pt-[70px] h-screen w-full pl-[200px] pr-[72px]">
        <span>{error.response?.data?.message}</span>
      </div>
    );
  } else {
    return (
      <>
        <Trail
          open={showModal}
          handleCancel={() => setShowModal(false)}
          trails={trails}
        />
        <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen">
          <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0">
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="28" cy="28" r="28" fill="#FDF4ED"/>
                    <circle cx="28" cy="28" r="10" fill="#FFF7F0" stroke="#9D4D01" strokeWidth="1.5"/>
                    <path d="M28 22v6l4 2" stroke="#582F08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 18l-4 4M36 18l4 4" stroke="#E3BC97" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#582F08]">Work History</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Your document activity and history</p>
                </div>
              </div>
              <Input.Search
                placeholder="Search by subject, file name, reference..."
                className="w-full md:w-[22rem]"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="border-t border-[#f0e6da] px-6 py-3 flex gap-6 bg-[#fffaf6]">
              <span className="text-sm text-gray-500"><span className="font-semibold text-[#582F08]">{isArray(workHistory?.data) ? _data.length : 0}</span> records</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da] overflow-x-auto">
            <div className="p-4">
              <Table
                loading={isLoading || isFetching}
                dataSource={isArray(workHistory?.data) ? _data : []}
                columns={columns}
                scroll={{ x: 600 }}
                size="small"
                rowClassName={(_, index) => (index % 2 !== 0 ? 'bg-[#fffaf6]' : '')}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default WorkHistory;
