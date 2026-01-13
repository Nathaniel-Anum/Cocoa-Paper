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
  Input,
  Select,
  Button,
  Card,
  Spin,
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
import { FiFilter } from 'react-icons/fi';

const Outgoing = () => {
  const { trails, isLoading } = useTrail('outgoing');
  const [trailId, setTrailId] = useState('');
  const [open, SetOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDivision, setFilterDivision] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [tempFilterDivision, setTempFilterDivision] = useState(null);
  const [tempFilterDepartment, setTempFilterDepartment] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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

  // useQuery for getting all divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });

  // useQuery for getting all departments (for filter)
  const { data: allDepartments } = useQuery({
    queryKey: ['allDepartments'],
    queryFn: () => {
      return axiosInstance.get('/department');
    },
  });

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
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.document?.subject?.toLowerCase().includes(search) ||
          record.document?.ref?.toLowerCase().includes(search) ||
          record.receiver?.name?.toLowerCase().includes(search) ||
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
      responsive: ['md'],
      render: (document) => {
        return <div>{document.ref}</div>;
      },
    },
    {
      title: 'Receiver',
      dataIndex: ['receiver', 'name'],
      key: 'receiver',
      responsive: ['lg'],
    },

    {
      title: 'Division',
      key: 'division',
      responsive: ['lg'],
      filters: divisions?.data?.map((div) => ({
        text: div.divisionName,
        value: div.divisionName,
      })) || [],
      filteredValue: filterDivision ? [filterDivision] : null,
      onFilter: (value, record) => {
        return record.document?.division?.divisionName === value;
      },
      render: (document) => {
        return <div>{document.document.division.divisionName}</div>;
      },
    },
    {
      title: 'Department',
      key: 'department',
      responsive: ['lg'],
      filters: allDepartments?.data?.map((dept) => ({
        text: dept.departmentName,
        value: dept.departmentName,
      })) || [],
      filteredValue: filterDepartment ? [filterDepartment] : null,
      onFilter: (value, record) => {
        return record.document?.department?.departmentName === value;
      },
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
      responsive: ['md'],
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toDateString()}</div>;
      },
    },
    {
      title: 'Time',
      key: 'action',
      dataIndex: 'createdAt',
      responsive: ['md'],
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

  // Filter data for mobile cards
  const mobileFilteredData = _data.filter((record) => {
    const search = searchText.toLowerCase();
    const matchesSearch = !searchText || 
      record.document?.subject?.toLowerCase().includes(search) ||
      record.document?.ref?.toLowerCase().includes(search) ||
      record.receiver?.name?.toLowerCase().includes(search) ||
      record.document?.division?.divisionName?.toLowerCase().includes(search) ||
      record.document?.department?.departmentName?.toLowerCase().includes(search);
    
    const matchesDivision = !filterDivision || record.document?.division?.divisionName === filterDivision;
    const matchesDepartment = !filterDepartment || record.document?.department?.departmentName === filterDepartment;
    
    return matchesSearch && matchesDivision && matchesDepartment;
  });
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
      <div className="flex flex-col md:flex-row md:justify-end gap-2 mb-4">
        <Input.Search
          placeholder="Search by subject, reference, receiver..."
          className="w-full md:w-[25rem]"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          onClick={() => {
            setTempFilterDivision(filterDivision);
            setTempFilterDepartment(filterDepartment);
            setIsFilterModalOpen(true);
          }}
          className="relative flex items-center justify-center w-[32px] h-[32px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <FiFilter className="text-[#582F08] text-lg" />
          {(filterDivision || filterDepartment) && (
            <span className="absolute -top-1 -right-1 bg-[#582F08] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {(filterDivision ? 1 : 0) + (filterDepartment ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Modal */}
      <Modal
        title="Filter Documents"
        open={isFilterModalOpen}
        onCancel={() => {
          setTempFilterDivision(filterDivision);
          setTempFilterDepartment(filterDepartment);
          setIsFilterModalOpen(false);
        }}
        footer={[
          <Button
            key="clear"
            onClick={() => {
              setTempFilterDivision(null);
              setTempFilterDepartment(null);
              setFilterDivision(null);
              setFilterDepartment(null);
            }}
          >
            Clear Filters
          </Button>,
          <Button
            key="apply"
            type="primary"
            style={{ backgroundColor: '#582F08' }}
            onClick={() => {
              setFilterDivision(tempFilterDivision);
              setFilterDepartment(tempFilterDepartment);
              setIsFilterModalOpen(false);
            }}
          >
            Apply Filters
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division
            </label>
            <Select
              placeholder="Select Division"
              allowClear
              style={{ width: '100%' }}
              value={tempFilterDivision}
              onChange={(value) => setTempFilterDivision(value)}
              options={divisions?.data?.map((div) => ({
                label: div.divisionName,
                value: div.divisionName,
              })) || []}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <Select
              placeholder="Select Department"
              allowClear
              style={{ width: '100%' }}
              value={tempFilterDepartment}
              onChange={(value) => setTempFilterDepartment(value)}
              options={allDepartments?.data?.map((dept) => ({
                label: dept.departmentName,
                value: dept.departmentName,
              })) || []}
            />
          </div>
        </div>
      </Modal>

      <Trail
        open={open}
        handleCancel={handleClose}
        trails={trailData?.data?.trails}
      />

      {/* Mobile Card View */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : mobileFilteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No documents found</div>
        ) : (
          <div className="space-y-3">
            {mobileFilteredData.map((record) => (
              <Card
                key={record.key}
                className="shadow-sm border border-gray-200"
                bodyStyle={{ padding: '12px' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#582F08] text-sm truncate">
                      {record.document?.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Ref: {record.document?.ref}</p>
                    <p className="text-xs text-gray-600 mt-1">To: {record.receiver?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {record?.document?.isApproved === true ? (
                        <Tag color="green" className="text-xs">Approved</Tag>
                      ) : record?.document?.isApproved === false && record?.document?.documentType === 'BudgetRelease' ? (
                        <Tag color="orange" className="text-xs">Pending</Tag>
                      ) : record?.document?.documentType !== 'BudgetRelease' ? (
                        <Tag color="blue" className="text-xs">N/A</Tag>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(record.createdAt).toLocaleDateString()} • {new Date(record.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowToolbar(false);
                        navigate(`/view-document/${record?.docID}`);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FaRegEye className="text-[#582F08]" />
                    </button>
                    <button
                      onClick={() => handleView(record)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <IoLocationOutline className="text-[#582F08]" />
                    </button>
                    {hasPermission(allRolePermissions, [requiredPermissions.RECALL_TRAIL]) && (
                      <Popconfirm
                        title="Are you sure you want to recall this item?"
                        onConfirm={() => callBackDoc(record.docID)}
                      >
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <GiRecycle className="text-[#582F08]" />
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table columns={columns} dataSource={_data} loading={isLoading} />
      </div>
    </div>
  );
};

export default Outgoing;
