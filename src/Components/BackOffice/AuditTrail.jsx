import { useGetAuditTrail } from '../../queryHooks/audit-trail';
import { Table } from 'antd';

const AuditTrail = () => {
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'userName'],
    },
    {
      title: 'Ip address',
      dataIndex: 'ipAddress',
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
    },
  ];

  const { data: auditTrail } = useGetAuditTrail();

  console.log({ auditTrail });

  return (
    <div>
      <Table
        columns={columns}
        dataSource={
          (auditTrail &&
            auditTrail?.data?.map((trail) => ({
              ...trail,
              key: trail.id,
            }))) ||
          []
        }
      />
    </div>
  );
};

export default AuditTrail;
