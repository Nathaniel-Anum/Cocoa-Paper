import React from 'react';
import { Table, Tooltip } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
import { EyeOutlined } from '@ant-design/icons';
import Trail from '../Components/Trail/Trail';
import { FaRegEye } from 'react-icons/fa';
import { isArray } from 'lodash';
const WorkHistory = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [trails, setTrails] = React.useState([]);

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
    },
    {
      title: 'FileName',
      dataIndex: ['file', 'fileName'],
      key: 'FileName',
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
      render: (value) => {
        return (
          <Tooltip title="View Trail">
            <FaRegEye
              className="text-blue-500 text-xl cursor-pointer"
              onClick={() => {
                setShowModal(true);
                setTrails(value);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

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
        <Table
          loading={isLoading || isFetching}
          dataSource={isArray(workHistory?.data) ? _data : []}
          columns={columns}
        />
        {/* </div> */}
      </>
    );
  }
};

export default WorkHistory;
