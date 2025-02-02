import { Table } from 'antd';
import React from 'react';
import { render } from 'react-dom';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';

const RecycleBin = () => {
  const columns = [
    {
      title: 'FileName',
      dataIndex: 'fileName',
      key: 'fileName  ',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject  ',
    },
    {
      title: 'Reference',
      dataIndex: ['file', 'ref'],
      key: 'reference  ',
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id  ',
      render: (value) => (
        <Tooltip title="Restore">
          <MdOutlineSettingsBackupRestore className="text-blue-500 text-xl cursor-pointer" />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
};

export default RecycleBin;
