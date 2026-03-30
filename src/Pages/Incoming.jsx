import {
  Table,
  Modal,
  Form,
  Select,
  Steps,
  Button,
  Upload,
  message,
  Dropdown,
  Mentions,
  Checkbox,
  Tag,
  Input,
  Card,
  Spin,
} from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { SlOptionsVertical } from 'react-icons/sl';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import { useTrail } from './CustomHook/useTrail';
import axiosInstance from '../Components/axiosInstance';
import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';

import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import useStore from '../store/store';
import { useUser } from './CustomHook/useUser';
import { uploadFile } from '../http/addDocument';
import { set } from 'lodash';
import Trail from '../Components/Trail/Trail';
import { useGetAllUserGroups, useGetAllUsers } from '../queryHooks/user';
import { FiFilter } from 'react-icons/fi';

// Helper function to capitalize each word
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Incoming = () => {
  const navigate = useNavigate();
  const { trails, isLoading } = useTrail('incoming');

  const [show, setShow] = useState(false);
  const [open, SetOpen] = useState(false);
  const [record, setRecord] = useState({});
  const [trailId, setTrailId] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterDivision, setFilterDivision] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [tempFilterDivision, setTempFilterDivision] = useState(null);
  const [tempFilterDepartment, setTempFilterDepartment] = useState(null);

  const setShowToolbar = useStore((state) => state.setShowToolbar);
  const setChosenRecord = useStore((state) => state.setChosenRecord);

  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);

  const { data: userGroups } = useGetAllUserGroups();
  const { data: ccUsers } = useGetAllUsers();

  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  function handleFile(selectedRecord) {
    setShow(true);
    setRecord(selectedRecord?.document);
  }

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleClose = () => {
    SetOpen(false);
  };

  // useQuery for getting all  divisions
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

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ['options'],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: false,
  });

  // useMutation to forward Document
  const { mutate: forwardDocument } = useMutation({
    mutationKey: 'forwardDocument',
    mutationFn: (values) => {
      return axiosInstance.patch(`/trail/${selected}`, values);
    },
    onSuccess: () => {
      setLoading(false);
      setIsModalOpen(false);
      message.success('Document has been successfully forwarded!');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['trail'] });
    },
    onError: (error) => {
      setLoading(false);
      setIsModalOpen(false);
      console.log(error?.response?.data?.trail?.error);
      form.resetFields();
      message.error(error?.response?.data?.trail?.error);
    },
  });
  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchUsers();
    }
  }, [selectedDepartment]);

  //useQUery to fetch trail associated to doc ID
  const { data: trailData } = useQuery({
    queryKey: ['trailData', trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  const { mutate: uploadMultipleFiles, isPending: isMultipleUploading } =
    useMutation({
      mutationKey: ['uploadMultiple'],
      mutationFn: async ({ files, subject, ref }) => {
        console.log('Uploading multiple files...');

        // Create an array of promises for each file upload
        const uploadPromises = files.map((file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('subject', subject);
          formData.append('ref', ref);

          return uploadFile(formData).then((response) => {
            if (!response?.data?.newFile?.fileId) {
              throw new Error(
                `File upload successful for ${file.name} but no file ID was returned`
              );
            }
            return response.data.newFile.fileId;
          });
        });

        // Wait for all uploads to complete
        return Promise.all(uploadPromises);
      },
      onSuccess: (fileIds) => {
        console.log('All files uploaded successfully with IDs:', fileIds);

        // Get form values and add file IDs
        const values = form.getFieldsValue();
        forwardDocument({
          ...values,
          status: 'Forwarded',
          isPrivate,
          attachmentIds: fileIds,
        });
      },
      onError: (error) => {
        message.error(error?.response?.data?.error);
      },
    });

  // console.log(trailData?.data);
  const handleDivisionChange = (option) => {
    setSelectedDivision(option.value);
  };

  const handleDepartmentChange = (option) => {
    setSelectedDepartment(option.value);
  };

  const handleClick = (selectedRecord) => {
    setIsModalOpen(true);
    setSelected(selectedRecord?.docID);
  };

  const handleFormSubmit = (values) => {
    setLoading(true);

    const attachmentFiles = values.attachments?.fileList;

    if (!attachmentFiles || attachmentFiles.length === 0) {
      forwardDocument({ ...values, status: 'Forwarded', isPrivate });
    } else {
      const attachmentFilesArray = attachmentFiles.map(
        (fileItem) => fileItem.originFileObj
      );

      // Upload all attachments with reference to main file
      uploadMultipleFiles({
        files: attachmentFilesArray,
        subject: '',
        ref: '',
      });
    }
  };

  const handleView = (selectedRecord) => {
    console.log(`Vieweing trail with ${selectedRecord?.docID}`);
    setTrailId(selectedRecord?.docID);
    SetOpen(true);
  };

  const handleViewDocument = (selectedRecord) => {
    setChosenRecord(selectedRecord);
    navigate(`/view-document/${selectedRecord?.docID}`);
  };

  const attachmentUploadProps = {
    name: 'file', // The name of the file input field, not the form field name
    multiple: true,
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log(
        'Attachment files selected:',
        info.fileList.map((f) => f.name)
      );
      // The fileList will be stored in the form
      form.setFieldsValue({ attachments: { fileList: info.fileList } });
    },
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
  };

  const getItems = (selectedRecord) => {
    // Check if CC recipient can forward (either not a CC or has enableForward permission)
    const canForward = !selectedRecord.isCarbonCopy || selectedRecord.ccEnableForward;
    
    return [
      {
        label: 'View',
        key: 0,
        onClick: () => {
          // Hide toolbar for all CC documents (copied documents should not have annotation toolbar)
          selectedRecord.isCarbonCopy
            ? setShowToolbar(false)
            : setShowToolbar(true);
          handleViewDocument(selectedRecord);
        },
      },
      canForward && {
        label: 'Forward',
        key: 1,
        onClick: () => handleClick(selectedRecord),
      },
      hasPermission(allRolePermissions, [
        requiredPermissions.ARCHIVE_DOCUMENT,
      ]) &&
        !selectedRecord.isCarbonCopy && {
          label: 'Archive',
          key: 2,
          onClick: () => handleFile(selectedRecord),
        },
      canForward && {
        label: 'Trail',
        key: 3,
        onClick: () => handleView(selectedRecord),
      },
    ].filter(Boolean);
  };

  const columns = [
    {
      title: 'Subject',
      key: 'subject',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.document?.subject?.toLowerCase().includes(search) ||
          record.document?.ref?.toLowerCase().includes(search) ||
          record.sender?.name?.toLowerCase().includes(search) ||
          record.userIntendedFor?.name?.toLowerCase().includes(search) ||
          record.document?.division?.divisionName?.toLowerCase().includes(search) ||
          record.sender?.department?.departmentName?.toLowerCase().includes(search)
        );
      },
      render: (data) => {
        return (
          <div className="flex items-start gap-1">
            <span className="font-medium text-[#582F08]">{capitalizeWords(data.document.subject)}</span>{' '}
            {data.isCarbonCopy ? (
              <span className="flex gap-1">
                <Tag color="warning">CC</Tag>
                {data.ccEnableForward && (
                  <Tag color="success">Can Forward</Tag>
                )}
              </span>
            ) : (
              ''
            )}
          </div>
        );
      },
    },
    {
      title: 'Reference',
      dataIndex: 'document',
      key: 'ref',
      responsive: ['md'],
      render: (document) => {
        return <div className="text-gray-600 font-mono text-sm">{document.ref}</div>;
      },
    },

    {
      title: 'Sender',
      dataIndex: ['sender', 'name'],
      key: 'receiver',
      responsive: ['lg'],
      render: (name) => <span>{capitalizeWords(name)}</span>,
    },
    {
      title: 'Intended Receipients',
      dataIndex: ['userIntendedFor', 'name'],
      key: 'userIntendedFor',
      responsive: ['lg'],
      render: (name) => <span>{capitalizeWords(name)}</span>,
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_AUDIT_STATUS,
    ]) && {
      title: 'Audited',
      dataIndex: 'audited',
      key: 'audited',
      render: (audited) =>
        audited ? (
          <Tag color="green">Audited</Tag>
        ) : (
          <Tag color="red">UnAudited</Tag>
        ),
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
        return <div>{capitalizeWords(document.document.division.divisionName)}</div>;
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
        return record.sender?.department?.departmentName === value;
      },
      render: (document) => {
        return <div>{capitalizeWords(document.sender.department.departmentName)}</div>;
      },
    },
    {
      title: 'Date',
      key: 'action',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div className="text-gray-600">{dateTime.toDateString()}</div>;
      },
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'createdAt',
      responsive: ['md'],
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div className="text-gray-600">{dateTime.toLocaleTimeString()}</div>;
      },
    },
    {
      title: 'Actions',
      key: 'action',

      render: (selectedRecord) => {
        return (
          <Dropdown
            menu={{ items: getItems(selectedRecord) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors">
              <MoreOutlined className="text-lg text-[#9D4D01]" />
            </button>
          </Dropdown>
        );
      },
    },
  ].filter(Boolean);

  const _data = trails.map((s) => ({
    ...s,
    key: s.docId,
  }));

  // Filter data for mobile cards
  const filteredData = _data.filter((record) => {
    const search = searchText.toLowerCase();
    const matchesSearch = !searchText || 
      record.document?.subject?.toLowerCase().includes(search) ||
      record.document?.ref?.toLowerCase().includes(search) ||
      record.sender?.name?.toLowerCase().includes(search) ||
      record.userIntendedFor?.name?.toLowerCase().includes(search) ||
      record.document?.division?.divisionName?.toLowerCase().includes(search) ||
      record.sender?.department?.departmentName?.toLowerCase().includes(search);
    
    const matchesDivision = !filterDivision || record.document?.division?.divisionName === filterDivision;
    const matchesDepartment = !filterDepartment || record.sender?.department?.departmentName === filterDepartment;
    
    return matchesSearch && matchesDivision && matchesDepartment;
  });

  console.log(_data);

  return (
    <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen">
      {/* Header Card */}
      <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#FDF4ED"/>
                <rect x="14" y="18" width="28" height="22" rx="3" fill="#E3BC97"/>
                <rect x="14" y="18" width="28" height="22" rx="3" stroke="#9D4D01" strokeWidth="1.5"/>
                <path d="M14 22l14 9 14-9" stroke="#582F08" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M22 32l-8 8" stroke="#9D4D01" strokeWidth="1" strokeLinecap="round"/>
                <path d="M34 32l8 8" stroke="#9D4D01" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#582F08]">Incoming Documents</h1>
              <p className="text-sm text-gray-500 mt-0.5">Documents received and pending action</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input.Search
              placeholder="Search by subject, reference, sender..."
              className="w-full md:w-[22rem]"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              onClick={() => {
                setTempFilterDivision(filterDivision);
                setTempFilterDepartment(filterDepartment);
                setIsFilterModalOpen(true);
              }}
              className="relative flex items-center justify-center gap-2 px-4 h-[32px] border border-[#E3BC97] rounded-lg hover:bg-[#fdf4ed] transition-colors"
            >
              <FiFilter className="text-[#9D4D01] text-base" />
              <span className="text-sm text-[#582F08] hidden md:inline">Filter</span>
              {(filterDivision || filterDepartment) && (
                <span className="absolute -top-1 -right-1 bg-[#582F08] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {(filterDivision ? 1 : 0) + (filterDepartment ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="border-t border-[#f0e6da] px-6 py-3 flex gap-6 bg-[#fffaf6]">
          <span className="text-sm text-gray-500"><span className="font-semibold text-[#582F08]">{filteredData.length}</span> documents</span>
        </div>
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

      {/* Mobile Card View */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No documents found</div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((record) => (
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
                    <div className="w-10 h-10 bg-[#FDF4ED] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#9D4D01]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                        <div className="w-5 h-5 bg-[#E3BC97] rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-[#582F08] uppercase">
                            {record.sender?.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">{capitalizeWords(record.sender?.name)}</span>
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
                    {record.isCarbonCopy && (
                      <Tag color="warning" className="text-[10px] m-0 leading-none" style={{ fontSize: '10px', padding: '2px 6px' }}>CC</Tag>
                    )}
                    {record.isCarbonCopy && record.ccEnableForward && (
                      <Tag color="success" className="text-[10px] m-0 leading-none" style={{ fontSize: '10px', padding: '2px 6px' }}>Forward</Tag>
                    )}
                  </div>
                  <Dropdown
                    menu={{ items: getItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SlOptionsVertical className="text-[#582F08] text-sm" />
                    </button>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        <div className="p-4">
          <Table 
            columns={columns} 
            dataSource={_data} 
            loading={isLoading}
            className="incoming-table"
            rowClassName={(_, i) => i % 2 !== 0 ? 'bg-[#fffaf6]' : ''}
          />
        </div>
      </div>
      {isModalOpen && (
        <Modal
          title="Forward Document"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <div className="mt-8">
            <Form
              form={form}
              layout="vertical"
              name="Forward Document"
              onFinish={(values) => handleFormSubmit(values)}
            >
              <Form.Item
                label="Division"
                name="division"
                rules={[
                  {
                    required: true,
                    message: 'Please choose your Division!',
                  },
                ]}
              >
                <Select
                  placeholder="Please choose your Division"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  labelInValue
                  options={divisions?.data.map((division) => ({
                    label: division?.divisionName,
                    value: division?.divisionId,
                  }))}
                  onChange={handleDivisionChange}
                />
              </Form.Item>
              <Form.Item
                label="Department"
                name="department"
                rules={[
                  {
                    required: true,
                    message: 'Please choose your Department!',
                  },
                ]}
              >
                <Select
                  placeholder="Please choose your Department"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  labelInValue
                  options={departments?.data?.data?.map((department) => ({
                    label: department?.departmentName,
                    value: department?.departmentId,
                  }))}
                  onChange={handleDepartmentChange}
                />
              </Form.Item>
              <Form.Item
                name="userId"
                label="User"
                rules={[
                  {
                    required: true,
                    message: 'Please select a User!',
                  },
                ]}
              >
                <Select
                  placeholder="Please select a User"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  options={
                    (users &&
                      (users?.data?.users || users?.data)
                        ?.filter((emp) => emp.userId !== authUser?.userId)
                        .map((user) => ({
                          label: user?.name,
                          value: user?.userId,
                        }))) ||
                    []
                  }
                />
              </Form.Item>
              <Form.Item name="carbonCopyIds" label="CC" initialValue={[]}>
                <Select
                  optionFilterProp="label"
                  mode="multiple"
                  showSearch
                  placeholder="Copy group or Users"
                  options={[
                    {
                      label: <span>User Groups</span>,
                      title: 'User Groups',
                      options:
                        userGroups &&
                        userGroups?.data?.data?.map((group) => ({
                          label: group?.name,
                          value: group?.id,
                        })),
                    },
                    {
                      label: <span>Users</span>,
                      title: 'Users',
                      options:
                        ccUsers &&
                        ccUsers?.data?.users
                          ?.filter((emp) => emp.userId !== authUser?.userId)
                          .map((u) => ({
                            label: u?.name,
                            value: u?.userId,
                          })),
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Checkbox onChange={() => setIsPrivate(!isPrivate)}>
                  Private Comment?
                </Checkbox>
              </Form.Item>

              <Form.Item label="Comment" name="comment">
                <Mentions
                  rows={4}
                  placeholder="Enter Comment...."
                  options={
                    (users &&
                      (users?.data?.users || users?.data)
                        ?.filter((emp) => emp.userId !== authUser?.userId)
                        .map((user) => ({
                          label: user?.name,
                          value: user?.name,
                        }))) ||
                    []
                  }
                />
              </Form.Item>

              <Form.Item name="attachments">
                <Upload {...attachmentUploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    loading={isMultipleUploading}
                    className="cursor-pointer w-full"
                  >
                    Upload Additional Docs
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-[#582F08] px-5 py-1 text-white w-full flex"
                  loading={loading}
                >
                  Forward
                </Button>
              </Form.Item>
            </Form>{' '}
          </div>
        </Modal>
      )}
      {/* <Modal
        title="Locator"
        open={open}
        onCancel={handleClose}
        footer={null}
        centered="true"
        width={'60%'}
      >
        <div className="py-6">
          <Steps
            responsive
            direction
            className="grid grid-cols-2 gap-y-2 "
            items={trailData?.data?.trails.flatMap((trail, index) => {
              if (index === 0) {
                return [
                  {
                    title: 'Sent',
                    description: trail.sender.name,
                  },
                  {
                    title: trail?.status,
                    description: trail.receiver.name,
                  },
                ];
              } else {
                return {
                  title: trail.status,
                  description: trail.receiver.name,
                };
              }
            })}
          />
        </div>
      </Modal> */}

      <Trail
        open={open}
        handleCancel={handleClose}
        trails={trailData?.data?.trails}
      />
      {show ? (
        <ArchiveFiles
          show={show}
          setShow={setShow}
          record={record}
          sender={authUser?.userId}
        />
      ) : null}
    </div>
  );
};

export default Incoming;
