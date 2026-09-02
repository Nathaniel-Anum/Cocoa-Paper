import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dropdown, Input, message, Popconfirm, Table } from 'antd';

import React, { useState } from 'react';
import axiosInstance from '../Components/axiosInstance';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import { FilePdfFilled, FolderFilled, MoreOutlined } from '@ant-design/icons';
import PageHeader from '../Components/PageHeader';

const RecycleBin = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  // useQuery to fetch all trails
  const { data: recycle } = useQuery({
    queryKey: ['recycle'],
    queryFn: () => {
      return axiosInstance.get('/recycle');
    },
  });
  // console.log(recycle?.data?.result);

  const formattedData = [
    ...(recycle?.data?.result?.deletedFiles || []).map((file) => ({
      key: file.fileId, // Used as unique row key
      fileId: file.fileId,
      isDeleted: file.isDeleted,
      name: (
        <div className="flex items-center align-center">
          <FilePdfFilled className="text-[24px] text-[#eb3b3b]" />
          {file.fileName}
        </div>
      ),
      subject: file.subject,
      reference: file.ref,
      type: 'File',
    })),
    ...(recycle?.data?.result?.deletedFolders || []).map((folder) => ({
      key: folder.folderId, // Used as unique row key
      folderId: folder.folderId,
      isDeleted: folder.isDeleted,
      name: (
        <div className="flex items-center align-center">
          <FolderFilled className="text-[24px] text-[#FFAC28]" />
          {folder.folderName}
        </div>
      ),
      subject: '-',
      reference: '-',
      type: 'Folder',
    })),
  ];

  const Restore = () => {
    // console.log("object");
  };

  const handleRestore = async (record) => {
    // console.log("Restoring:", record);

    try {
      if (record.type === 'File') {
        await axiosInstance.patch(`/restore/${record.fileId}`);
      } else {
        await axiosInstance.patch(`/restore/${record.folderId}`);
      }

      message.success('Item restored successfully!');

      await queryClient.invalidateQueries('recycle');
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const nameText = typeof record.name === 'string' ? record.name : 
          record.name?.props?.children?.[1] || '';
        return (
          nameText.toString().toLowerCase().includes(search) ||
          record.subject?.toLowerCase().includes(search) ||
          record.reference?.toLowerCase().includes(search)
        );
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      render: (_, record) => {
        const items = [
          {
            key: 'restore',
            label: (
              <Popconfirm
                title="Are you sure you want to restore this item?"
                onConfirm={() => handleRestore(record)}
                okText="Yes"
                cancelText="No"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="inline-flex items-center gap-2">
                  <MdOutlineSettingsBackupRestore />
                  Restore
                </span>
              </Popconfirm>
            ),
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

  return (
    <div className="page-shell">
      <PageHeader
        title="Recycle bin"
        description="Deleted items can be restored"
        meta={`${formattedData.length} item${formattedData.length === 1 ? '' : 's'}`}
        extra={
          <Input.Search
            placeholder="Search by name, subject, reference..."
            className="w-full lg:w-[22rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da] overflow-x-auto">
        <div className="p-4">
          <Table 
            columns={columns} 
            dataSource={formattedData} 
            scroll={{ x: 500 }}
            size="small"
            rowClassName={(_, index) => (index % 2 !== 0 ? 'bg-[#fffaf6]' : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
