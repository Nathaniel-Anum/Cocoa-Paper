import { useGetAuditTrail } from '../../queryHooks/audit-trail';
import { Table } from 'antd';

const AuditTrail = () => {
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'name'],
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

  const { data: auditTrail, isLoading } = useGetAuditTrail();

  console.log({ auditTrail });

  return (
    <div className=" px-[240px] pt-[50px] mx-auto ">
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
      />
    </div>
  );
};

export default AuditTrail;
