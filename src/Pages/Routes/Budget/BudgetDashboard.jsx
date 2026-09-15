import React, { useMemo } from 'react';
import { Button, Skeleton } from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  LikeOutlined,
  PlusOutlined,
  RollbackOutlined,
  SendOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetBudgetStats, useGetFinancialYear } from '../../../queryHooks/budget';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import { useUser } from '../../CustomHook/useUser';

const STAT_CHIPS = [
  { key: 'draft', label: 'Draft', href: '/budget?status=DRAFT', icon: <EditOutlined /> },
  { key: 'submitted', label: 'Submitted', href: '/budget?status=SUBMITTED', icon: <SendOutlined /> },
  { key: 'committee', label: 'Committee', href: '/budget?status=COMMITTEE_REVIEW', icon: <AuditOutlined /> },
  { key: 'recommended', label: 'Approvals', href: '/budget?status=RECOMMENDED', icon: <LikeOutlined /> },
  { key: 'approved', label: 'Approved', href: '/budget?status=APPROVED', icon: <CheckCircleOutlined /> },
  { key: 'returned', label: 'Returned', href: '/budget?status=RETURNED', icon: <RollbackOutlined /> },
  { key: 'rejected', label: 'Rejected', href: '/budget?status=REJECTED', icon: <CloseCircleOutlined /> },
  { key: 'total', label: 'All', href: '/budget', icon: <UnorderedListOutlined /> },
];

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);

  const { data: statsRes, isLoading: statsLoading } = useGetBudgetStats();
  const { data: yearsRes } = useGetFinancialYear({});

  const stats = statsRes?.data?.data ?? {};
  const financialYears = yearsRes?.data?.data ?? [];
  const canCreate = hasPermission(allRolePermissions, [requiredPermissions.CREATE_BUDGET]);

  const activeYear = useMemo(() => {
    const now = dayjs();
    return financialYears.find(
      (year) =>
        !year.closed &&
        now.isAfter(dayjs(year.startDate)) &&
        now.isBefore(dayjs(year.endDate)),
    );
  }, [financialYears]);

  if (statsLoading) {
    return (
      <div className="rounded-xl border border-[#f0e6da] bg-white px-4 py-3">
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-semibold tracking-tight text-[#582F08]">Budgets</h1>
          <p className="m-0 mt-0.5 text-sm text-[#7a6859]">
            {activeYear
              ? `FY ${dayjs(activeYear.startDate).format('YYYY')}–${dayjs(activeYear.endDate).format('YY')}`
              : `${stats.total ?? 0} budgets`}
          </p>
        </div>
        {canCreate && (
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => navigate('/add-budget-item')}
            className="font-medium"
            style={{ background: '#582F08', borderColor: '#582F08', color: '#fff' }}
          >
            Create Budget
          </Button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 pb-0.5">
        {STAT_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => navigate(chip.href)}
            className="inline-flex min-w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-lg border border-[#f0e6da] bg-white px-3 py-2 text-center hover:border-[#E3BC97] hover:bg-[#fdf4ed]"
          >
            <span className="text-[#9D4D01] text-xs">{chip.icon}</span>
            <span className="mt-0.5 text-lg font-semibold leading-none text-[#582F08]">{stats[chip.key] ?? 0}</span>
            <span className="mt-1 text-[11px] font-medium text-[#7a6859]">{chip.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default BudgetDashboard;
