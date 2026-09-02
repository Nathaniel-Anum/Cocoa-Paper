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
import PageHeader from '../Components/PageHeader';
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
        <div className="page-shell">
          <PageHeader
            title="Work history"
            description="Your document activity"
            meta={`${isArray(workHistory?.data) ? _data.length : 0} record${(isArray(workHistory?.data) ? _data.length : 0) === 1 ? '' : 's'}`}
            extra={
              <Input.Search
                placeholder="Search subject, file name, reference..."
                className="w-full lg:w-[22rem]"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            }
          />

          <div className="overflow-hidden rounded-xl border border-[#f0e6da] bg-white">
              <Table
                loading={isLoading || isFetching}
                dataSource={isArray(workHistory?.data) ? _data : []}
                columns={columns}
                size="small"
                className="cp-table"
                rowClassName={(_, index) => (index % 2 !== 0 ? 'bg-[#fffaf6]' : '')}
              />
          </div>
        </div>
      </>
    );
  }
};

export default WorkHistory;
