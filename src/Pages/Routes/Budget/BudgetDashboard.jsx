import React, { useMemo } from 'react';
import { Button, Skeleton, Tooltip } from 'antd';
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
import { useGetAllBudgets, useGetBudgetStats, useGetFinancialYear } from '../../../queryHooks/budget';
import { capitalize, formatMoney } from '../../../../utils/typography';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import { useUser } from '../../CustomHook/useUser';

const STATUS_BADGE = {
  DRAFT: { label: 'Draft', bg: '#f3f4f6', text: '#4b5563' },
  SUBMITTED: { label: 'Pending', bg: '#fd984e', text: '#6d3300' },
  COMMITTEE_REVIEW: { label: 'Review', bg: '#ffdcc7', text: '#723600' },
  RECOMMENDED: { label: 'Approval', bg: '#f5f3ff', text: '#6d28d9' },
  APPROVED: { label: 'Approved', bg: '#E8F5E9', text: '#2E7D32' },
  RETURNED: { label: 'Returned', bg: '#fffbeb', text: '#b45309' },
  REJECTED: { label: 'Rejected', bg: '#ffdad6', text: '#93000a' },
};

const ATTENTION_STATUSES = ['SUBMITTED', 'COMMITTEE_REVIEW', 'RECOMMENDED', 'RETURNED', 'REJECTED'];

function budgetTotal(budget) {
  return budget?.budgetItems?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0;
}

function fmtRelative(date) {
  if (!date) return '—';
  const d = dayjs(date);
  if (d.isSame(dayjs(), 'day')) return `Today, ${d.format('hh:mm A')}`;
  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return `Yesterday, ${d.format('hh:mm A')}`;
  return d.format('MMM D, hh:mm A');
}

function activityCopy(budget) {
  const name = capitalize(budget.name);
  const actor =
    budget.approvedBy?.name ||
    budget.submittedBy?.name ||
    budget.updatedBy?.name ||
    'A user';

  switch (budget.status) {
    case 'APPROVED':
      return (
        <>
          <span className="font-bold">{actor}</span> approved{' '}
          <span className="font-bold text-[#9D4D01]">{name}</span>.
        </>
      );
    case 'SUBMITTED':
      return (
        <>
          <span className="font-bold">{actor}</span> submitted{' '}
          <span className="font-bold text-[#9D4D01]">{name}</span>.
        </>
      );
    case 'RECOMMENDED':
      return (
        <>
          Committee recommended <span className="font-bold text-[#9D4D01]">{name}</span> for final approval.
        </>
      );
    case 'RETURNED':
      return (
        <>
          <span className="font-bold text-[#9D4D01]">{name}</span> was returned for correction
          {budget.workflowNote ? (
            <span className="italic text-[#7a6859]"> — “{budget.workflowNote}”</span>
          ) : (
            '.'
          )}
        </>
      );
    case 'COMMITTEE_REVIEW':
      return (
        <>
          <span className="font-bold text-[#9D4D01]">{name}</span> entered committee review.
        </>
      );
    case 'REJECTED':
      return (
        <>
          <span className="font-bold text-[#9D4D01]">{name}</span> was rejected.
        </>
      );
    default:
      return (
        <>
          <span className="font-bold text-[#9D4D01]">{name}</span> was updated.
        </>
      );
  }
}

function activityIcon(status) {
  switch (status) {
    case 'APPROVED':
      return { icon: <CheckCircleOutlined />, bg: '#582f08' };
    case 'SUBMITTED':
      return { icon: <SendOutlined />, bg: '#9D4D01' };
    case 'RECOMMENDED':
      return { icon: <LikeOutlined />, bg: '#7c3aed' };
    case 'RETURNED':
      return { icon: <RollbackOutlined />, bg: '#d97706' };
    case 'COMMITTEE_REVIEW':
      return { icon: <AuditOutlined />, bg: '#2563eb' };
    case 'REJECTED':
      return { icon: <CloseCircleOutlined />, bg: '#ba1a1a' };
    default:
      return { icon: <EditOutlined />, bg: '#84746a' };
  }
}

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);

  const { data: statsRes, isLoading: statsLoading } = useGetBudgetStats();
  const { data: budgetsRes, isLoading: budgetsLoading } = useGetAllBudgets({ limit: 50 });
  const { data: yearsRes } = useGetFinancialYear({});

  const stats = statsRes?.data?.data ?? {};
  const budgets = budgetsRes?.data?.data ?? [];
  const financialYears = yearsRes?.data?.data ?? [];

  const canCreate = hasPermission(allRolePermissions, [requiredPermissions.CREATE_BUDGET]);
  const canStartReview = hasPermission(allRolePermissions, [
    requiredPermissions.START_COMMITTEE_REVIEW,
  ]);
  const canRecommend = hasPermission(allRolePermissions, [requiredPermissions.RECOMMEND_BUDGET]);
  const canApprove = hasPermission(allRolePermissions, [requiredPermissions.APPROVE_BUDGET]);

  const attentionBudgets = useMemo(
    () =>
      budgets
        .filter((b) => ATTENTION_STATUSES.includes(b.status))
        .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())
        .slice(0, 6),
    [budgets],
  );

  const recentActivity = useMemo(
    () =>
      [...budgets]
        .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())
        .slice(0, 5),
    [budgets],
  );

  const totalAllocated = useMemo(
    () =>
      budgets
        .filter((b) => b.status === 'APPROVED')
        .reduce((sum, b) => sum + budgetTotal(b), 0),
    [budgets],
  );

  const activeYear = useMemo(() => {
    const now = dayjs();
    return financialYears.find(
      (year) =>
        !year.closed &&
        now.isAfter(dayjs(year.startDate)) &&
        now.isBefore(dayjs(year.endDate)),
    );
  }, [financialYears]);

  const upcomingYear = useMemo(() => {
    const now = dayjs();
    return financialYears.find((year) => !year.closed && dayjs(year.startDate).isAfter(now));
  }, [financialYears]);

  const primaryTiles = [
    {
      key: 'draft',
      label: 'Draft Budgets',
      value: stats.draft ?? 0,
      icon: <EditOutlined />,
      href: '/budget?status=DRAFT',
      accent: '#582f08',
    },
    {
      key: 'committee',
      label: 'Committee Review',
      value: stats.committee ?? 0,
      icon: <AuditOutlined />,
      href: '/budget?status=COMMITTEE_REVIEW',
      accent: '#9D4D01',
    },
    {
      key: 'recommended',
      label: 'Pending Approval',
      value: stats.recommended ?? 0,
      icon: <LikeOutlined />,
      href: '/budget?status=RECOMMENDED',
      accent: '#9D4D01',
    },
    {
      key: 'approved',
      label: 'Approved Budgets',
      value: stats.approved ?? 0,
      icon: <CheckCircleOutlined />,
      href: '/budget?status=APPROVED',
      accent: '#582f08',
      filled: true,
    },
  ];

  const secondaryTiles = [
    { key: 'submitted', label: 'Submitted', value: stats.submitted ?? 0, href: '/budget?status=SUBMITTED', icon: <SendOutlined /> },
    { key: 'returned', label: 'Returned', value: stats.returned ?? 0, href: '/budget?status=RETURNED', icon: <RollbackOutlined /> },
    { key: 'rejected', label: 'Rejected', value: stats.rejected ?? 0, href: '/budget?status=REJECTED', icon: <CloseCircleOutlined /> },
    { key: 'total', label: 'Total Tracked', value: stats.total ?? 0, href: '/budget', icon: <UnorderedListOutlined /> },
  ];

  const pendingActions = [
    canStartReview &&
      (stats.submitted ?? 0) > 0 && {
        id: 'start-review',
        title: `Start review for ${stats.submitted} submitted budget(s)`,
        detail: 'Locked submissions awaiting committee intake',
        href: '/budget?status=SUBMITTED',
        accent: '#9D4D01',
        icon: <SendOutlined />,
      },
    canRecommend &&
      (stats.committee ?? 0) > 0 && {
        id: 'committee',
        title: `Complete committee review (${stats.committee})`,
        detail: 'Budgets currently under committee revision',
        href: '/budget?status=COMMITTEE_REVIEW',
        accent: '#2563eb',
        icon: <AuditOutlined />,
      },
    canApprove &&
      (stats.recommended ?? 0) > 0 && {
        id: 'approve',
        title: `Finalize ${stats.recommended} recommended budget(s)`,
        detail: 'Requires executive approve / return / reject',
        href: '/budget?status=RECOMMENDED',
        accent: '#582f08',
        icon: <LikeOutlined />,
      },
    (stats.returned ?? 0) > 0 && {
      id: 'returned',
      title: `Resolve ${stats.returned} returned budget(s)`,
      detail: 'Corrections required before resubmission',
      href: '/budget?status=RETURNED',
      accent: '#d97706',
      icon: <RollbackOutlined />,
    },
  ].filter(Boolean);

  if (statsLoading && budgetsLoading) {
    return (
      <div className="space-y-5 rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)]">
        <Skeleton active paragraph={{ rows: 2 }} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#ead9cb] bg-[#f7ece5] p-4">
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)]">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
            Institutional Oversight
          </p>
          <h2 className="m-0 mt-2 text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">
            Budget Dashboard
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-[#7a6859]">
            Track draft volume, committee queues, and approval throughput for the active fiscal cycle.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeYear && (
            <div className="rounded-xl border border-[#ead9cb] bg-[#fdf1eb] px-4 py-2 text-sm font-semibold text-[#582f08]">
              FY {dayjs(activeYear.startDate).format('YYYY')}–
              {dayjs(activeYear.endDate).format('YY')}
            </div>
          )}
          {canCreate && (
            <Button
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/add-budget-item')}
              className="rounded-xl font-bold"
              style={{ background: '#9D4D01', borderColor: '#9D4D01', color: '#fff' }}
            >
              Create New Budget
            </Button>
          )}
        </div>
      </div>

      {/* Primary summary tiles — design system 4-up */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryTiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => navigate(tile.href)}
            className="rounded-xl border border-[#d6c3b7] bg-[#f7ece5] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#9D4D01] hover:shadow-md"
          >
            <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#7a6859]">
              {tile.label}
            </p>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: tile.accent }}>
                {String(tile.value).padStart(2, '0')}
              </span>
              <span className="text-2xl" style={{ color: tile.accent, opacity: 0.7 }}>
                {tile.icon}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {secondaryTiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => navigate(tile.href)}
            className="flex items-center justify-between rounded-xl border border-[#ead9cb] bg-white px-4 py-3 text-left transition-colors hover:bg-[#fdf1eb]"
          >
            <div>
              <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-[#84746a]">
                {tile.label}
              </p>
              <p className="m-0 mt-1 text-xl font-extrabold text-[#582f08]">{tile.value}</p>
            </div>
            <span className="text-[#9D4D01]">{tile.icon}</span>
          </button>
        ))}
      </div>

      {/* Bento layout */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 lg:col-span-8">
          {/* Attention table */}
          <div className="overflow-hidden rounded-xl border border-[#d6c3b7] bg-white shadow-sm">
            <div className="flex items-center justify-between bg-[#582f08] px-5 py-3">
              <h3 className="m-0 text-lg font-bold text-[#fff4e8]">Budgets Requiring Attention</h3>
              <button
                type="button"
                onClick={() => navigate('/budget')}
                className="text-xs font-bold uppercase tracking-wider text-[#d29667] hover:text-white"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#ead9cb] bg-[#f1e6e0]">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                      Department
                    </th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                      Budget Name
                    </th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                      Requested
                    </th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attentionBudgets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#7a6859]">
                        No budgets currently require attention.
                      </td>
                    </tr>
                  )}
                  {attentionBudgets.map((budget, index) => {
                    const badge = STATUS_BADGE[budget.status] ?? STATUS_BADGE.DRAFT;
                    return (
                      <tr
                        key={budget.id}
                        className={`border-b border-[#ead9cb]/60 transition-colors hover:bg-[#fdf1eb] ${
                          index % 2 === 1 ? 'bg-[#f7ece5]/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-[#582f08]">
                          {budget.department?.departmentName ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#582f08]">
                          {capitalize(budget.name)}
                        </td>
                        <td className="px-4 py-3 text-[#582f08]">{formatMoney(budgetTotal(budget))}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/budget/${budget.id}`)}
                            className="font-semibold text-[#9D4D01] hover:underline"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-[#d6c3b7] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="m-0 text-lg font-bold text-[#582f08]">Recent Activity</h3>
              <button
                type="button"
                onClick={() => navigate('/backoffice/auditTrail')}
                className="text-xs font-bold uppercase tracking-wider text-[#9D4D01] hover:underline"
              >
                View History
              </button>
            </div>
            <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-0.5 before:bg-[#d6c3b7]">
              {recentActivity.length === 0 && (
                <p className="m-0 text-sm italic text-[#7a6859]">No recent budget activity yet.</p>
              )}
              {recentActivity.map((budget) => {
                const style = activityIcon(budget.status);
                return (
                  <button
                    key={budget.id}
                    type="button"
                    onClick={() => navigate(`/budget/${budget.id}`)}
                    className="relative block w-full pl-10 text-left"
                  >
                    <div
                      className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-white"
                      style={{ background: style.bg }}
                    >
                      {style.icon}
                    </div>
                    <p className="m-0 text-sm leading-6 text-[#201b17]">{activityCopy(budget)}</p>
                    <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-wider text-[#84746a]/70">
                      {fmtRelative(budget.updatedAt ?? budget.createdAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 space-y-5 lg:col-span-4">
          {/* Pending actions */}
          <div className="rounded-xl border border-[#d6c3b7] bg-[#f1e6e0] p-5">
            <h3 className="m-0 mb-4 flex items-center gap-2 text-lg font-bold text-[#582f08]">
              <UnorderedListOutlined className="text-[#9D4D01]" />
              Pending Actions
            </h3>
            <div className="space-y-3">
              {pendingActions.length === 0 && (
                <p className="m-0 rounded-lg border border-[#ead9cb] bg-white p-3 text-sm text-[#7a6859]">
                  No pending actions in your workflow scope.
                </p>
              )}
              {pendingActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => navigate(action.href)}
                  className="flex w-full items-start gap-3 rounded-lg border-l-4 bg-white p-3 text-left shadow-sm transition-transform hover:translate-x-1"
                  style={{ borderLeftColor: action.accent }}
                >
                  <span className="mt-0.5 text-base" style={{ color: action.accent }}>
                    {action.icon}
                  </span>
                  <div>
                    <p className="m-0 text-sm font-bold text-[#582f08]">{action.title}</p>
                    <p className="m-0 mt-0.5 text-xs text-[#7a6859]">{action.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="rounded-xl border border-[#d6c3b7] bg-white p-5 shadow-sm">
            <h3 className="m-0 mb-4 text-lg font-bold text-[#582f08]">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {activeYear && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-[#ead9cb] bg-[#f7ece5]">
                    <span className="text-[10px] font-bold uppercase text-[#7a6859]">
                      {dayjs(activeYear.endDate).format('MMM')}
                    </span>
                    <span className="text-lg font-extrabold leading-none text-[#582f08]">
                      {dayjs(activeYear.endDate).format('D')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="m-0 text-sm font-bold text-[#201b17]">Active Year Close</p>
                    <p className="m-0 text-xs text-[#7a6859]">
                      FY {dayjs(activeYear.startDate).format('YYYY')}–
                      {dayjs(activeYear.endDate).format('YY')}
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#ba1a1a]" />
                </div>
              )}
              {upcomingYear && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-[#ead9cb] bg-[#f7ece5]">
                    <span className="text-[10px] font-bold uppercase text-[#7a6859]">
                      {dayjs(upcomingYear.startDate).format('MMM')}
                    </span>
                    <span className="text-lg font-extrabold leading-none text-[#582f08]">
                      {dayjs(upcomingYear.startDate).format('D')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="m-0 text-sm font-bold text-[#201b17]">Next Planning Cycle</p>
                    <p className="m-0 text-xs text-[#7a6859]">
                      FY {dayjs(upcomingYear.startDate).format('YYYY')}–
                      {dayjs(upcomingYear.endDate).format('YY')} opens
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#9D4D01]" />
                </div>
              )}
              {!activeYear && !upcomingYear && (
                <p className="m-0 text-sm italic text-[#7a6859]">
                  No open financial years configured.
                </p>
              )}
            </div>
          </div>

          {/* Total allocated */}
          <div className="relative overflow-hidden rounded-xl bg-[#582f08] p-5">
            <div className="relative z-10">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#d29667]">
                Total Allocated
              </p>
              <p className="m-0 mt-2 text-3xl font-extrabold text-white">
                {formatMoney(totalAllocated)}
              </p>
              <p className="m-0 mt-2 text-xs text-white/60">
                Sum of approved budgets in the current portfolio view
              </p>
            </div>
            <Tooltip title="Approved allocation total">
              <CheckCircleOutlined className="absolute -bottom-2 -right-2 text-[110px] text-white/10" />
            </Tooltip>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetDashboard;
