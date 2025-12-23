import React, { useState } from 'react';
import { Popover, Table, Tooltip, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
import Trail from '../Components/Trail/Trail';
import { FaRegEye } from 'react-icons/fa';
import { isArray } from 'lodash';
import { IoLocationOutline } from 'react-icons/io5';
import { render } from 'react-dom';
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
        return (
          <div className="flex items-center gap-5">
            <Popover
              content={
                <div>
                  <p>View Document</p>
                </div>
              }
            >
              <FaRegEye
                className=" text-xl  cursor-pointer"
                onClick={() => {
                  setShowToolbar(false);
                  navigate(`/view-document/${record?.docID}`);
                }}
              />
            </Popover>
            <Popover
              content={
                <div>
                  <p>View Trail</p>
                </div>
              }
            >
              <IoLocationOutline
                className=" text-xl  cursor-pointer"
                onClick={() => {
                  setShowModal(true);
                  setTrails(value);
                }}
              />
            </Popover>
          </div>
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
        {/* <div className="pt-[70px] h-screen w-full pl-[200px] pr-[72px]"> */}
        <Trail
          open={showModal}
          handleCancel={() => setShowModal(false)}
          trails={trails}
        />
        <div className="flex justify-end mb-4 mt-8">
          <Input.Search
            placeholder="Search by subject, file name, reference..."
            className="w-[30rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Table
          // loading={isLoading || isFetching}
          dataSource={isArray(workHistory?.data) ? _data : []}
          // dataSource={_data}
          columns={columns}
        />
        {/* </div> */}
      </>
    );
  }
};

export default WorkHistory;
