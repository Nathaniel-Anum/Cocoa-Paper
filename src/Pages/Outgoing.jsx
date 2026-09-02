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
  Dropdown,
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
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
import PageHeader from '../Components/PageHeader';

// Helper function to capitalize each word
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
      title: 'Document',
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
      render: (document) => (
        <div className="min-w-0 max-w-[28rem]">
          <p className="m-0 font-medium text-[#582F08] line-clamp-1">
            {capitalizeWords(document.subject)}
          </p>
          <p className="m-0 mt-0.5 font-mono text-xs text-[#7a6859]">{document.ref}</p>
        </div>
      ),
    },
    {
      title: 'To',
      dataIndex: ['receiver', 'name'],
      key: 'receiver',
      width: 180,
      responsive: ['md'],
      render: (name) => <span className="line-clamp-1">{capitalizeWords(name)}</span>,
    },
    {
      title: 'Division',
      key: 'division',
      width: 160,
      ellipsis: true,
      responsive: ['lg'],
      filters: divisions?.data?.map((div) => ({
        text: div.divisionName,
        value: div.divisionName,
      })) || [],
      filteredValue: filterDivision ? [filterDivision] : null,
      onFilter: (value, record) => {
        return record.document?.division?.divisionName === value;
      },
      render: (document) => (
        <span className="line-clamp-1">
          {capitalizeWords(document.document.division.divisionName)}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'isApproved',
      dataIndex: 'isApproved',
      width: 180,
      render: (value, record) => {
        if (record?.document?.isApproved === true) {
          return <Tag color="green" className="m-0">Approved</Tag>;
        } else if (
          record?.document?.isApproved === false &&
          record?.document?.documentType === 'BudgetRelease'
        ) {
          return <Tag color="orange" className="m-0">Pending approval</Tag>;
        } else if (record?.document?.documentType !== 'BudgetRelease') {
          return <Tag className="m-0">Not required</Tag>;
        }
      },
    },
    {
      title: 'Sent',
      key: 'sent',
      dataIndex: 'createdAt',
      width: 130,
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return (
          <div>
            <p className="m-0">
              {dateTime.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="m-0 text-xs text-[#7a6859]">
              {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 48,
      render: (selectedRecord) => {
        const items = [
          {
            key: 'view',
            label: 'View Document',
            onClick: () => {
              setShowToolbar(false);
              navigate(`/view-document/${selectedRecord?.docID}`);
            },
          },
          {
            key: 'trail',
            label: 'View Trail',
            onClick: () => handleView(selectedRecord),
          },
          ...(hasPermission(allRolePermissions, [requiredPermissions.RECALL_TRAIL])
            ? [{
                key: 'recall',
                label: (
                  <Popconfirm
                    title="Are you sure you want to recall this item?"
                    onConfirm={() => callBackDoc(selectedRecord.docID)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Recall Document</span>
                  </Popconfirm>
                ),
              }]
            : []),
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
      queryClient.invalidateQueries({ queryKey: ['trail'] });
      message.success('Document has been successfully recalled!');
    },
    onError: (error) => {
      message.error(error.response.data.error || 'Failed to recall document');
    },
  });

  return (
    <div className="page-shell">
      <PageHeader
        title="Outgoing"
        description="Documents you have sent"
        meta={`${mobileFilteredData.length} document${mobileFilteredData.length === 1 ? '' : 's'}`}
        extra={
          <>
            <Input.Search
              placeholder="Search subject, reference, receiver..."
              className="w-full lg:w-[22rem]"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              onClick={() => {
                setTempFilterDivision(filterDivision);
                setTempFilterDepartment(filterDepartment);
                setIsFilterModalOpen(true);
              }}
              className="relative inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[#E3BC97] px-3 hover:bg-[#fdf4ed] transition-colors"
            >
              <FiFilter className="text-[#9D4D01] text-base" />
              <span className="text-sm text-[#582F08] hidden md:inline">Filter</span>
              {(filterDivision || filterDepartment) && (
                <span className="absolute -top-1 -right-1 bg-[#582F08] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {(filterDivision ? 1 : 0) + (filterDepartment ? 1 : 0)}
                </span>
              )}
            </button>
          </>
        }
      />

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
              <div
                key={record.key}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.99] transition-transform"
              >
                {/* Clickable Card Body */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    setShowToolbar(false);
                    navigate(`/view-document/${record?.docID}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-[#582F08] text-sm leading-tight line-clamp-2">
                          {capitalizeWords(record.document?.subject)}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{record.document?.ref}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">To:</span>
                        <div className="w-5 h-5 bg-[#E3BC97] rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-[#582F08] uppercase">
                            {record.receiver?.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">{capitalizeWords(record.receiver?.name)}</span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="flex-shrink-0 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Card Footer */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {record?.document?.isApproved === true ? (
                      <Tag color="green" className="text-[10px] m-0 leading-none" style={{ fontSize: '10px', padding: '2px 6px' }}>Approved</Tag>
                    ) : record?.document?.isApproved === false && record?.document?.documentType === 'BudgetRelease' ? (
                      <Tag color="orange" className="text-[10px] m-0 leading-none" style={{ fontSize: '10px', padding: '2px 6px' }}>Pending</Tag>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(record);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      title="Track"
                    >
                      <IoLocationOutline className="text-[#582F08] text-sm" />
                    </button>
                    {hasPermission(allRolePermissions, [requiredPermissions.RECALL_TRAIL]) && (
                      <Popconfirm
                        title="Are you sure you want to recall this item?"
                        onConfirm={() => callBackDoc(record.docID)}
                      >
                        <button
                          className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="Recall"
                        >
                          <GiRecycle className="text-[#582F08] text-sm" />
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#f0e6da] bg-white">
        <Table
          columns={columns}
          dataSource={mobileFilteredData}
          loading={isLoading}
          className="cp-table outgoing-table"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          rowClassName={(_, i) => (i % 2 !== 0 ? 'bg-[#fffaf6]' : '')}
        />
      </div>
    </div>
  );
};

export default Outgoing;
