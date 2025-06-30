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
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { useUser } from './CustomHook/useUser';
import { IoIosLocate } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

const Outgoing = () => {
  const { trails, isLoading } = useTrail('outgoing');
  const [trailId, setTrailId] = useState('');
  const [open, SetOpen] = useState(false);
  const queryClient = useQueryClient();

  const setShowToolbar = useStore((state) => state.setShowToolbar);

  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);

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

  const navigate = useNavigate();

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
          return <Tag color="orange">Pending Financial Approval</Tag>;
        } else if (record?.document?.documentType !== 'BudgetRelease') {
          return <Tag color="blue">Approval Not Required</Tag>;
        }
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
        <div className="flex gap-x-3">
          <Popover
            content={
              <div>
                <p>View Document</p>
              </div>
            }
          >
            <button
              onClick={() => {
                setShowToolbar(false);
                navigate(`/view-document/${selectedRecord?.docID}`);
              }}
            >
              <FaRegEye className="text-[20px] " />
            </button>
          </Popover>
          <Popover
            content={
              <div>
                <p>View Trail</p>
              </div>
            }
          >
            <button onClick={() => handleView(selectedRecord)}>
              <IoLocationOutline className="text-[20px] " />
            </button>
          </Popover>

          {hasPermission(allRolePermissions, [
            requiredPermissions.RECALL_TRAIL,
          ]) && (
            <Popconfirm
              title="Are you sure you want to recall this item?"
              onConfirm={() => callBackDoc(selectedRecord.docID)}
            >
              <Tooltip title="Recall">
                <GiRecycle className="text-[20px] cursor-pointer" />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];
  // Filter trails to keep only the most recent record for each unique reference
  const uniqueTrailsMap = new Map();
  trails.forEach((trail) => {
    const ref = trail.document.ref;
    if (
      !uniqueTrailsMap.has(ref) ||
      new Date(trail.createdAt) > new Date(uniqueTrailsMap.get(ref).createdAt)
    ) {
      uniqueTrailsMap.set(ref, trail);
    }
  });
  const filteredTrails = Array.from(uniqueTrailsMap.values());

  const _data = filteredTrails.map((s, index) => ({
    ...s,
    key: index,
  }));
  // console.log(_data);

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
