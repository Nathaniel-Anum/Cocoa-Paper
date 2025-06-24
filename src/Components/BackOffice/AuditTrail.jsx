import { useGetAuditTrail } from '../../queryHooks/audit-trail';
import { Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';

const AuditTrail = () => {
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
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

  const { data: auditTrail, isLoading } = useGetAuditTrail();

  console.log({ auditTrail });

  return (
    <div className="px-[240px] pt-[50px] mx-auto ">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
      <Table
        columns={columns}
        loading={isLoading}
        dataSource={
          (auditTrail &&
            auditTrail?.data?.data?.map((trail) => ({
              ...trail,
              key: trail.id,
            }))) ||
          []
        }
        bordered
        size="middle"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default AuditTrail;
