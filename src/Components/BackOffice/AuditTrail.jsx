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
    <div className="pl-[236px] pr-8 pt-6 pb-8 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
          <h2 className="text-lg font-bold text-[#582F08]">Audit Trail</h2>
          <Input.Search
            placeholder="Search by user, action, resource, method, IP..."
            className="w-80"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            loading={loading}
            dataSource={rows}
            rowKey="id"
            size="middle"
            className="backoffice-table"
            rowClassName={(_, i) => (i % 2 !== 0 ? 'backoffice-row-alt' : '')}
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
      </div>
    </div>
  );
};

export default AuditTrail;
