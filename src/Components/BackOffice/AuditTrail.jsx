import { useState, useEffect } from 'react';
import { Table, Tag, Tooltip, Input } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../Components/axiosInstance';

const AuditTrail = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/audit-trail', {
          params: { page, limit: pageSize },
        });
        if (!isMounted) return;
        setRows(res?.data?.data ?? []);
        setTotal(res?.data?.pagination?.total ?? 0);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        return (
          record.user?.name?.toLowerCase().includes(search) ||
          record.user?.email?.toLowerCase().includes(search) ||
          record.action?.toLowerCase().includes(search) ||
          record.resource?.toLowerCase().includes(search) ||
          record.method?.toLowerCase().includes(search) ||
          record.ipAddress?.toLowerCase().includes(search) ||
          record.statusCode?.toString().includes(search)
        );
      },
      render: (name, record) => (
        <Tooltip title={record.user?.email}>{name}</Tooltip>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => <Tag color="geekblue">{method}</Tag>,
    },
    // {
    //   title: 'Path',
    //   dataIndex: 'path',
    //   key: 'path',
    //   ellipsis: true,
    //   width: '10%',
    // },
    {
      title: 'Status',
      dataIndex: 'statusCode',
      key: 'statusCode',
      render: (status) => (
        <Tag color={status >= 400 ? 'red' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: 'Response Time (ms)',
      dataIndex: 'responseTime',
      key: 'responseTime',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div className="px-[240px] pt-[50px] mx-auto ">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
      <div className="flex justify-end mb-4">
        <Input.Search
          placeholder="Search by user, action, resource, method, IP..."
          className="w-[30rem]"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        loading={loading}
        dataSource={rows}
        rowKey="id"
        bordered
        size="middle"
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (current, size) => {
            setPage(current);
            setPageSize(size);
          },
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default AuditTrail;
