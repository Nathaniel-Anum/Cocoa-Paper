import { useQuery, useQueryClient } from '@tanstack/react-query';
import { message, Popconfirm, Table, Tooltip, Input } from 'antd';

import React, { useState } from 'react';
import axiosInstance from '../Components/axiosInstance';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import { FilePdfFilled, FolderFilled } from '@ant-design/icons';

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
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to restore this item?"
          onConfirm={() => handleRestore(record)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Restore">
            <MdOutlineSettingsBackupRestore className="text-blue-500 text-xl cursor-pointer" />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="px-2 md:px-0">
      <div className="flex justify-end mb-4">
        <Input.Search
          placeholder="Search by name, subject, reference..."
          className="w-full md:w-[30rem]"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <Table 
          columns={columns} 
          dataSource={formattedData} 
          scroll={{ x: 500 }}
          size="small"
        />
      </div>
    </div>
  );
};

export default RecycleBin;
