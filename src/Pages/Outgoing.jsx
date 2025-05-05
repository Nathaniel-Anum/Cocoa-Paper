import React, { useState } from 'react';
import {
  Table,
  Popover,
  Steps,
  Modal,
  Popconfirm,
  message,
  Tooltip,
  Tag,
} from 'antd';
import { useTrail } from './CustomHook/useTrail';
import { FaRegEye } from 'react-icons/fa';
import axiosInstance from '../Components/axiosInstance';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import Trail from '../Components/Trail/Trail';
import { GiRecycle } from 'react-icons/gi';
import { recallDocument } from '../http/addDocument';
import { hasPermission, requiredPermissions } from '../../utils/Roles';
import { useUser } from './CustomHook/useUser';

const Outgoing = () => {
  const { trails, isLoading } = useTrail('outgoing');
  const [trailId, setTrailId] = useState('');
  const [open, SetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useUser();

  const handleView = (selectedRecord) => {
    // console.log(selectedRecord);
    // console.log(`Vieweing trail with ${selectedRecord?.docID}`);
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
      title: 'Status',
      key: 'isApproved',
      dataIndex: 'isApproved',
      render: (value, record) => {
        if (record?.document?.isApproved === true) {
          return <Tag color="green">Approved</Tag>;
        } else if (
          record?.document?.isApproved === false &&
          record?.document?.documentType === 'BudgetRelease'
        ) {
          return <Tag color="orange">Pending Approval</Tag>;
        } else if (record?.document?.documentType !== 'BudgetRelease') {
          return <Tag color="blue">Approval Not Required</Tag>;
        }

        // return record?.document?.isApproved ? (
        //   <Tag color="green">Approved</Tag>
        // ) : (
        //   <Tag color="orange">Pending Approval</Tag>
        // );
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
        <div className="flex gap-x-5">
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

          {hasPermission(user?.role[0].rolePermissions, [
            requiredPermissions.RECALL_TRAIL,
          ]) && (
            <Popconfirm
              title="Are you sure you want to recall this item?"
              onConfirm={() => callBackDoc(selectedRecord.docID)}
            >
              <Tooltip title="Recall">
                <GiRecycle className="text-[20px] text-green-500 cursor-pointer" />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];
  const _data = trails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);

  console.log({ _data });

  const { mutate: callBackDoc } = useMutation({
    mutationKey: 'recallDocument',
    mutationFn: (docId) => {
      return recallDocument(docId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['trails']);
      message.success('Document has been successfully recalled!');
    },
    onError: (error) => {
      message.error(error.response.data.error || 'Failed to recall document');
    },
  });

  return (
    <div className="mt-8">
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
