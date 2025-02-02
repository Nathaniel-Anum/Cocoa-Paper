import React, { useState } from 'react';
import { Table, Popover, Steps, Modal } from 'antd';
import { useTrail } from './CustomHook/useTrail';
import { FaRegEye } from 'react-icons/fa';
import axiosInstance from '../Components/axiosInstance';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Trail from '../Components/Trail/Trail';

const Outgoing = () => {
  const { trails, isLoading } = useTrail('outgoing');
  const [trailId, setTrailId] = useState('');
  const [open, SetOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleView = (selectedRecord) => {
    console.log(selectedRecord);
    console.log(`Vieweing trail with ${selectedRecord?.docID}`);
    setTrailId(selectedRecord?.docID);
    SetOpen(true);
  };

  const handleClose = () => {
    SetOpen(false);
  };

  //useQUery to fetch trail associated to doc ID

  const { data: trailData } = useQuery({
    queryKey: ['trailData', trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'document',
      key: 'subject',
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
      title: 'Receiver',
      dataIndex: ['receiver', 'name'],
      key: 'receiver',
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
      title: 'Action',
      key: 'action',
      render: (selectedRecord) => (
        <div className="flex gap-2">
          <Popover
            content={
              <div>
                <p>View Trail</p>
              </div>
            }
          >
            <button onClick={() => handleView(selectedRecord)}>
              <FaRegEye className="text-[20px] text-blue-500" />
            </button>
          </Popover>
        </div>
      ),
    },
  ];
  const _data = trails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);

  return (
    <div className="">
      <Trail
        open={open}
        handleCancel={handleClose}
        trails={trailData?.data?.trails}
      />
      <Table columns={columns} dataSource={_data} loading={isLoading} />
    </div>
  );
};

export default Outgoing;
