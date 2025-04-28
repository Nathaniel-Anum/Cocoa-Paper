import React from 'react';
import { Popover, Table, Tooltip } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
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
      title: 'File Name',
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
          <Popover
            content={
              <div>
                <p>View Trail</p>
              </div>
            }
          >
            <FaRegEye
              className=" text-xl cursor-pointer"
              onClick={() => {
                setShowModal(true);
                setTrails(value);
              }}
            />
          </Popover>
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
        <Table
          className="mt-8"
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
