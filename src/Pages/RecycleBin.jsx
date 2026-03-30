import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dropdown, Input, message, Popconfirm, Table } from 'antd';

import React, { useState } from 'react';
import axiosInstance from '../Components/axiosInstance';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import { FilePdfFilled, FolderFilled, MoreOutlined } from '@ant-design/icons';

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
    <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen">
      <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#FDF4ED"/>
                <path d="M20 21h16l-1.5 18a2 2 0 01-2 1.8h-9a2 2 0 01-2-1.8L20 21z" fill="#E3BC97" stroke="#9D4D01" strokeWidth="1.5"/>
                <path d="M18 21h20" stroke="#582F08" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M24 18h8" stroke="#9D4D01" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#582F08]">Recycle Bin</h1>
              <p className="text-sm text-gray-500 mt-0.5">Deleted items can be restored</p>
            </div>
          </div>
          <Input.Search
            placeholder="Search by name, subject, reference..."
            className="w-full md:w-[22rem]"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="border-t border-[#f0e6da] px-6 py-3 flex gap-6 bg-[#fffaf6]">
          <span className="text-sm text-gray-500"><span className="font-semibold text-[#582F08]">{formattedData.length}</span> deleted items</span>
        </div>
      </div>

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
