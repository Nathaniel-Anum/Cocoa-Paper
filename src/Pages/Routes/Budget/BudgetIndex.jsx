import {
  Button,
  Collapse,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'antd';

import React, { useEffect, useState } from 'react';
import { capitalize, formatMoney } from '../../../../utils/typography';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { BiTrash } from 'react-icons/bi';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../../store/store';

import {
  useGetAllBudgets,
  useGetArchivedBudgets,
  useGetFinancialYear,
} from '../../../queryHooks/budget';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteBudget } from '../../../http/budget';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import { useUser } from '../../CustomHook/useUser';
import axiosInstance from '../../../Components/axiosInstance';
import BudgetDashboard from './BudgetDashboard';

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  COMMITTEE_REVIEW: 'Under Review',
  RECOMMENDED: 'Recommended',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
};

const STATUS_BADGE_STYLE = {
  DRAFT: { bg: '#f3f4f6', text: '#4b5563' },
  SUBMITTED: { bg: '#fff4e8', text: '#9D4D01' },
  COMMITTEE_REVIEW: { bg: '#eff6ff', text: '#1d4ed8' },
  RECOMMENDED: { bg: '#f5f3ff', text: '#7c3aed' },
  APPROVED: { bg: '#f0fdf4', text: '#15803d' },
  RETURNED: { bg: '#fffbeb', text: '#b45309' },
  REJECTED: { bg: '#fff1f2', text: '#dc2626' },
};

const BudgetIndex = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setChosenRecord = useStore((state) => state.setChosenRecord);

  // Read ?status= from URL (set by sidebar Committee / Approvals links)
  const urlParams = new URLSearchParams(location.search);
  const urlStatus = urlParams.get('status') ?? '';

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  const [filterFYId, setFilterFYId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [archivedSearchText, setArchivedSearchText] = useState('');
  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);

  // Sync URL status param when user navigates via sidebar
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setFilterStatus(p.get('status') ?? '');
  }, [location.search]);

  // Build query params for the API
  const reportFilters = {
    ...(searchText ? { search: searchText } : {}),
    ...(selectedDepartment ? { departmentId: selectedDepartment } : {}),
    ...(filterFYId ? { financialYearId: filterFYId } : {}),
  };

  // Client-side status filter (API doesn't support status filter, so we filter locally)
  const budgetColumns = [
    {
      title: 'Budget Portfolio',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => {
        const total = record?.budgetItems?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0;
        return (
          <div className="min-w-[220px]">
            <p className="m-0 font-bold text-[#582f08]">{value && capitalize(value)}</p>
            <p className="m-0 mt-1 text-xs text-[#7a6859]">
              {record?.budgetItems?.length ?? 0} lines · {formatMoney(total)}
            </p>
          </div>
        );
      },
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_BUDGET_GLOBAL,
    ]) && {
      title: 'Department',
      key: 'department',
      dataIndex: ['department', 'departmentName'],
      render: (value) => <span>{value && capitalize(value)}</span>,
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_BUDGET_GLOBAL,
    ]) && {
      title: 'Division',
      key: 'division',
      dataIndex: ['department', 'division', 'divisionName'],
      render: (value) => <span>{value && capitalize(value)}</span>,
    },
    {
      title: 'Financial Year',
      dataIndex: 'financialYear',
      key: 'financialYear',
      render: (value, record) => (
        <span className={'font-semibold'}>{`${new Date(
          value.startDate
        ).getFullYear()} - ${new Date(value.endDate).getFullYear()}`}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        const style = STATUS_BADGE_STYLE[v] ?? { bg: '#f3f4f6', text: '#4b5563' };
        return (
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ background: style.bg, color: style.text }}
          >
            {STATUS_LABEL[v] ?? v ?? 'Draft'}
          </span>
        );
      },
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value) => (
        <span className="text-[#7a6859]">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'view',
      render: (value) => (
        <Tooltip title="View workflow">
          <EyeOutlined
            className="text-[#9D4D01] cursor-pointer"
            style={{ fontSize: 17 }}
            onClick={() => navigate(`/budget/${value}`)}
          />
        </Tooltip>
      ),
    },
    (hasPermission(allRolePermissions, [requiredPermissions.UPDATE_BUDGET]) ||
      hasPermission(allRolePermissions, [requiredPermissions.DELETE_BUDGET])) && {
      title: 'Actions',
      dataIndex: 'id',
      key: 'action',
      render: (value, record) => {
        const isEditable = ['DRAFT', 'RETURNED'].includes(record.status ?? 'DRAFT');
        if (!isEditable) return null;
        return (
          <div className="flex gap-2">
            {hasPermission(allRolePermissions, [requiredPermissions.UPDATE_BUDGET]) && (
              <Tooltip title="Edit">
                <EditOutlined
                  className="text-blue-400 cursor-pointer"
                  style={{ fontSize: 16 }}
                  onClick={() => {
                    setChosenRecord(record);
                    navigate(`/update-budget-item/${value}`);
                  }}
                />
              </Tooltip>
            )}
            {hasPermission(allRolePermissions, [requiredPermissions.DELETE_BUDGET]) && (
              <Popconfirm
                onConfirm={() => removeBudget(value)}
                title="Delete this budget? This cannot be undone."
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete">
                  <BiTrash className="text-red-400 cursor-pointer" style={{ fontSize: 16 }} />
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ].filter(Boolean);

  const budgetData = [
    {
      title: 'Budgetary Item',
      dataIndex: 'item',
      key: 'item',
      render: (value) => <span>{value && capitalize(value)}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Budget Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => <span>{formatMoney(value)}</span>,
    },
    // {
    //   title: 'Dollar Amount',
    //   dataIndex: 'dollarAmount',
    //   key: 'amount',
    //   render: (value) => <span>{value ? formatMoney(value) : '--'}</span>,
    // },
    {
      title: 'Balance',
      dataIndex: 'budgetAllocation',
      key: 'amountRemaining',
      render: (value, record) => (
        <span>
          {value && value.length
            ? formatMoney(value[value.length - 1].balance)
            : formatMoney(record.amount)}
        </span>
      ),
    },
  ];

  const { data: budgets, isLoading } = useGetAllBudgets(reportFilters);
  const { data: archivedBudgets, isLoading: archivedLoading } = useGetArchivedBudgets();
  const { data: financialYear } = useGetFinancialYear({});

  // Apply client-side status filter
  const allBudgetData = (budgets?.data?.data ?? []).map((s) => ({ ...s, key: s?.id }));
  const data = filterStatus
    ? allBudgetData.filter((b) => b.status === filterStatus)
    : allBudgetData;

  const archivedData = (archivedBudgets?.data?.data ?? []).filter((b) => {
    if (!archivedSearchText) return true;
    const s = archivedSearchText.toLowerCase();
    return (
      b.name?.toLowerCase().includes(s) ||
      b.budgetItems?.some((item) => item.item?.toLowerCase().includes(s))
    );
  });

  const qClient = useQueryClient();

  const { mutate: removeBudget } = useMutation({
    mutationKey: ['deleteBudget'],
    mutationFn: (id) => deleteBudget(id),
    onSuccess: () => {
      message.success('Budget Deleted Successfully');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (err) => message.error(err?.response?.data?.error),
  });

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        return await axiosInstance.get('/division');
      } catch (error) {
        message.error('Failed to Load Divisions', error);
        return { data: [] };
      }
    },
  });

  // Fetch departments based on selected division
  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${selectedDivision}`);
      } catch (error) {
        message.error('Failed to Load Departments', error);
        return { data: { data: [] } };
      }
    },
    enabled: !!selectedDivision,
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ══ Dashboard Stats ═══════════════════════════════════════════════ */}
      <BudgetDashboard />

      {['COMMITTEE_REVIEW', 'RECOMMENDED', 'SUBMITTED', 'RETURNED'].includes(filterStatus) && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            background:
              filterStatus === 'RECOMMENDED'
                ? '#f5f3ff'
                : filterStatus === 'COMMITTEE_REVIEW'
                ? '#eff6ff'
                : filterStatus === 'RETURNED'
                ? '#fffbeb'
                : '#fff4e8',
            borderColor:
              filterStatus === 'RECOMMENDED'
                ? '#ddd6fe'
                : filterStatus === 'COMMITTEE_REVIEW'
                ? '#bfdbfe'
                : filterStatus === 'RETURNED'
                ? '#fde68a'
                : '#fdd9b0',
            color:
              filterStatus === 'RECOMMENDED'
                ? '#5b21b6'
                : filterStatus === 'COMMITTEE_REVIEW'
                ? '#1d4ed8'
                : filterStatus === 'RETURNED'
                ? '#b45309'
                : '#7c3200',
          }}
        >
          <strong>{data.length}</strong>{' '}
          {filterStatus === 'RECOMMENDED'
            ? 'budget(s) awaiting final executive decision.'
            : filterStatus === 'COMMITTEE_REVIEW'
            ? 'budget(s) currently in committee review.'
            : filterStatus === 'RETURNED'
            ? 'budget(s) returned for correction.'
            : 'budget(s) submitted and waiting for committee intake.'}{' '}
          Open a row to continue the approval workflow.
        </div>
      )}

      {/* ══ Table ══════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-[28px] border border-[#ead9cb] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6db] bg-[#582f08] px-6 py-4">
          <div>
            <h3 className="m-0 text-lg font-bold text-[#fff4e8]">
              {filterStatus === 'RECOMMENDED'
                ? 'Approvals Register'
                : filterStatus === 'COMMITTEE_REVIEW'
                ? 'Committee Register'
                : filterStatus === 'SUBMITTED'
                ? 'Submitted Register'
                : filterStatus === 'RETURNED'
                ? 'Returned Register'
                : 'Portfolio Register'}
            </h3>
            <p className="m-0 mt-1 text-xs uppercase tracking-[0.16em] text-[#ead9cb]">
              {data.length} visible budgets
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[#ead9cb] bg-[#fdf5ef] px-5 py-4">
          <span className="flex-shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
            Filters
          </span>
          <Input.Search
            placeholder="Search budget name..."
            className="w-56"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(val) => setSearchText(val)}
            size="small"
          />
          <Select
            size="small"
            className="w-36"
            placeholder="All Years"
            allowClear
            value={filterFYId || undefined}
            onChange={(v) => setFilterFYId(v ?? '')}
            options={(financialYear?.data?.data ?? []).map((y) => ({
              label: `FY ${new Date(y.startDate).getFullYear()}`,
              value: y.id,
            }))}
          />
          <Select
            size="small"
            className="w-40"
            placeholder="All Divisions"
            allowClear
            value={selectedDivision || undefined}
            onChange={(v) => { setSelectedDivision(v ?? ''); setSelectedDepartment(''); }}
            options={(divisions?.data ?? []).map((d) => ({
              label: capitalize(d.divisionName),
              value: d.divisionId,
            }))}
            showSearch
            optionFilterProp="label"
          />
          <Select
            size="small"
            className="w-44"
            placeholder="All Departments"
            allowClear
            disabled={!selectedDivision}
            value={selectedDepartment || undefined}
            onChange={(v) => setSelectedDepartment(v ?? '')}
            options={(departments?.data?.data ?? []).map((d) => ({
              label: capitalize(d.departmentName),
              value: d.departmentId,
            }))}
            showSearch
            optionFilterProp="label"
          />
          <Select
            size="small"
            className="w-40"
            placeholder="All Statuses"
            allowClear
            value={filterStatus || undefined}
            onChange={(v) => {
              const next = v ?? '';
              setFilterStatus(next);
              navigate(next ? `/budget?status=${next}` : '/budget');
            }}
            options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ label: v, value: k }))}
          />
          {(searchText || filterFYId || selectedDivision || selectedDepartment || filterStatus) && (
            <Button
              size="small"
              type="link"
              style={{ color: '#9D4D01', padding: 0 }}
              onClick={() => {
                setSearchText('');
                setFilterFYId('');
                setSelectedDivision('');
                setSelectedDepartment('');
                setFilterStatus('');
                navigate('/budget');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={budgetColumns}
            expandable={{
              expandedRowRender: (record) => (
                <div className="overflow-x-auto px-2 py-2">
                  <Table
                    columns={budgetData}
                    dataSource={record.budgetItems}
                    pagination={false}
                    bordered={false}
                    className="custom-inner-table"
                    scroll={{ x: 400 }}
                    size="small"
                  />
                </div>
              ),
              rowExpandable: (record) => record?.budgetItems?.length > 0,
            }}
            dataSource={data}
            loading={isLoading}
            scroll={{ x: 920 }}
            size="middle"
            pagination={{
              showSizeChanger: false,
              className: 'px-4 pb-3',
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'bg-[#fdf5ef]' : 'bg-[#f7eee6]'
            }
          />
        </div>
      </div>

      {/* ══ Archived Budgets ═══════════════════════════════════════════════ */}
      {!['COMMITTEE_REVIEW', 'RECOMMENDED', 'SUBMITTED', 'RETURNED'].includes(filterStatus) && (
      <Collapse
        ghost
        items={[
          {
            key: 'archived',
            label: (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#582f08]">Archived Budgets</span>
                <Tag color="orange">
                  {archivedData.length}
                </Tag>
              </div>
            ),
            children: (
              <div className="overflow-x-auto rounded-xl shadow-sm">
                <div className="mb-3">
                  <Input.Search
                    placeholder="Search by category or budget item..."
                    className="w-full sm:w-72"
                    allowClear
                    value={archivedSearchText}
                    onChange={(e) => setArchivedSearchText(e.target.value)}
                    onSearch={(val) => setArchivedSearchText(val)}
                  />
                </div>
                <Table
                  columns={[
                    {
                      title: 'Budgetary Item',
                      dataIndex: 'name',
                      key: 'name',
                      render: (value) => (
                        <span className="font-bold">{value && capitalize(value)}</span>
                      ),
                    },
                    hasPermission(allRolePermissions, [
                      requiredPermissions.READ_BUDGET_GLOBAL,
                    ]) && {
                      title: 'Department',
                      key: 'department',
                      dataIndex: ['department', 'departmentName'],
                      render: (value) => <span>{value && capitalize(value)}</span>,
                    },
                    hasPermission(allRolePermissions, [
                      requiredPermissions.READ_BUDGET_GLOBAL,
                    ]) && {
                      title: 'Division',
                      key: 'division',
                      dataIndex: ['department', 'division', 'divisionName'],
                      render: (value) => <span>{value && capitalize(value)}</span>,
                    },
                    {
                      title: 'Financial Year',
                      dataIndex: 'financialYear',
                      key: 'financialYear',
                      render: (value) => (
                        <span className="font-bold">{`${new Date(
                          value.startDate
                        ).getFullYear()} – ${new Date(value.endDate).getFullYear()}`}</span>
                      ),
                    },
                    {
                      title: 'Status',
                      key: 'status',
                      render: () => <Tag color="orange">Archived</Tag>,
                    },
                  ].filter(Boolean)}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="overflow-x-auto px-2 py-1">
                        <Table
                          columns={budgetData}
                          dataSource={record.budgetItems}
                          pagination={false}
                          bordered={false}
                          className="custom-inner-table"
                          scroll={{ x: 400 }}
                          size="small"
                        />
                      </div>
                    ),
                    rowExpandable: (record) => record?.budgetItems?.length > 0,
                  }}
                  dataSource={
                    archivedData.map((b) => ({ ...b, key: b.id }))
                  }
                  loading={archivedLoading}
                  scroll={{ x: 700 }}
                  size="middle"
                />
              </div>
            ),
          },
        ]}
        className="border border-[#f0e6da] rounded-xl bg-white shadow-sm"
      />
      )}
    </div>
  );
};

export default BudgetIndex;
