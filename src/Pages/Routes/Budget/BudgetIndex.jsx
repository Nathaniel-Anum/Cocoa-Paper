import {
  Badge,
  Button,
  Collapse,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'antd';

import React, { useEffect, useMemo, useState } from 'react';
import { capitalize, formatMoney } from '../../../../utils/typography';
import { CheckOutlined, EditOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { BiTrash } from 'react-icons/bi';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../../store/store';

import {
  useGetAllBudgets,
  useGetArchivedBudgets,
  useGetFinancialYear,
} from '../../../queryHooks/budget';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkApproveBudgets, deleteBudget } from '../../../http/budget';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import { useUser } from '../../CustomHook/useUser';
import axiosInstance from '../../../Components/axiosInstance';
import BudgetDashboard from './BudgetDashboard';
import { displayItemCategory, displayItemLabel } from './budgetLineCategories';

const MARK_STORAGE_KEY = 'cp-budget-marked-for-approval';
const MARKABLE_STATUSES = ['SUBMITTED', 'COMMITTEE_REVIEW', 'RECOMMENDED'];

function loadMarkedBudgetIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(MARK_STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveMarkedBudgetIds(ids) {
  localStorage.setItem(MARK_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

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
  const canApprove = hasPermission(allRolePermissions, [requiredPermissions.APPROVE_BUDGET]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
      title: 'Budget',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => {
        const total = record?.budgetItems?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0;
        return (
          <div className="min-w-0">
            <p className="m-0 text-sm font-semibold text-[#582f08]">{value && capitalize(value)}</p>
            <p className="m-0 text-[11px] text-[#7a6859]">
              {record?.budgetItems?.length ?? 0} lines · {formatMoney(total)}
            </p>
          </div>
        );
      },
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_BUDGET_GLOBAL,
    ]) && {
      title: 'Dept',
      key: 'department',
      dataIndex: ['department', 'departmentName'],
      render: (value) => <span className="text-xs">{value && capitalize(value)}</span>,
    },
    {
      title: 'Year',
      dataIndex: 'financialYear',
      key: 'financialYear',
      width: 88,
      render: (value) => (
        <span className="text-xs text-[#7a6859]">{`${new Date(
          value.startDate
        ).getFullYear()}`}</span>
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
            className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: style.bg, color: style.text }}
          >
            {STATUS_LABEL[v] ?? v ?? 'Draft'}
          </span>
        );
      },
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'action',
      width: 88,
      render: (value, record) => {
        const isEditable = ['DRAFT', 'RETURNED'].includes(record.status ?? 'DRAFT');
        return (
          <div className="flex items-center gap-2">
            <Tooltip title="View">
              <EyeOutlined
                className="text-[#9D4D01] cursor-pointer"
                onClick={() => navigate(`/budget/${value}`)}
              />
            </Tooltip>
            {isEditable && hasPermission(allRolePermissions, [requiredPermissions.UPDATE_BUDGET]) && (
              <Tooltip title="Edit">
                <EditOutlined
                  className="text-[#9D4D01] cursor-pointer"
                  onClick={() => {
                    setChosenRecord(record);
                    navigate(`/update-budget-item/${value}`);
                  }}
                />
              </Tooltip>
            )}
            {isEditable && hasPermission(allRolePermissions, [requiredPermissions.DELETE_BUDGET]) && (
              <Popconfirm
                onConfirm={() => removeBudget(value)}
                title="Delete this budget?"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete">
                  <BiTrash className="text-red-400 cursor-pointer" />
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
      title: 'Category',
      key: 'category',
      render: (_, record) => displayItemCategory(record.item) || '—',
    },
    {
      title: 'Budgetary Item',
      dataIndex: 'item',
      key: 'item',
      render: (value) => <span>{value && capitalize(displayItemLabel(value))}</span>,
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

  const showRowSelection =
    MARKABLE_STATUSES.includes(filterStatus) || (canApprove && !filterStatus);
  const dataIdsKey = data.map((b) => b.id).join(',');
  const selectedRecommended = useMemo(
    () => data.filter((b) => selectedRowKeys.includes(b.id) && b.status === 'RECOMMENDED'),
    [data, selectedRowKeys],
  );

  useEffect(() => {
    if (!showRowSelection) {
      setSelectedRowKeys([]);
      return;
    }
    const marked = new Set(loadMarkedBudgetIds());
    setSelectedRowKeys(data.filter((b) => marked.has(b.id)).map((b) => b.id));
  }, [filterStatus, dataIdsKey, showRowSelection]);

  const qClient = useQueryClient();

  const { mutate: approveSelected, isPending: approving } = useMutation({
    mutationFn: (ids) => bulkApproveBudgets(ids),
    onSuccess: (res) => {
      const approved = res?.data?.data?.approved ?? [];
      const failed = res?.data?.data?.failed ?? [];
      if (approved.length) {
        message.success(res?.data?.message || `${approved.length} budget(s) approved.`);
      } else {
        message.error(res?.data?.message || 'No budgets were approved.');
      }
      if (failed.length && approved.length) {
        message.warning(`${failed.length} selected budget(s) could not be approved.`);
      }
      saveMarkedBudgetIds(loadMarkedBudgetIds().filter((id) => !approved.includes(id)));
      setSelectedRowKeys((keys) => keys.filter((id) => !approved.includes(id)));
      qClient.invalidateQueries({ queryKey: ['budgets'] });
      qClient.invalidateQueries({ queryKey: ['budget-stats'] });
    },
    onError: (err) => message.error(err?.response?.data?.error || 'Approval failed'),
  });

  const confirmApproveSelected = () => {
    const ids = selectedRecommended.map((b) => b.id);
    if (!ids.length) {
      message.warning('Select at least one recommended budget to approve.');
      return;
    }
    Modal.confirm({
      title: `Approve ${ids.length} budget${ids.length === 1 ? '' : 's'}?`,
      content:
        'This cannot be undone. Approved budgets are locked for departmental allocation.',
      okText: 'Approve',
      cancelText: 'Cancel',
      okButtonProps: {
        style: { background: '#9D4D01', borderColor: '#9D4D01' },
      },
      onOk: () =>
        new Promise((resolve, reject) => {
          approveSelected(ids, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        }),
    });
  };

  const { mutate: removeBudget } = useMutation({
    mutationKey: ['deleteBudget'],
    mutationFn: (id) => deleteBudget(id),
    onSuccess: () => {
      message.success('Budget Deleted Successfully');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
      qClient.invalidateQueries({ queryKey: ['budget-stats'] });
      qClient.invalidateQueries({ queryKey: ['budgets-archived'] });
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
    <div className="space-y-4 pb-8">
      <BudgetDashboard />

      {['COMMITTEE_REVIEW', 'RECOMMENDED', 'SUBMITTED', 'RETURNED'].includes(filterStatus) && (
        <p className="m-0 text-sm text-[#7a6859]">
          <span className="font-semibold text-[#582F08]">{data.length}</span>
          {filterStatus === 'RECOMMENDED'
            ? ' awaiting approval. Select one or more, then Approve selected.'
            : filterStatus === 'COMMITTEE_REVIEW'
            ? ' in committee review'
            : filterStatus === 'RETURNED'
            ? ' returned for correction'
            : ' submitted'}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[#f0e6da] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#f0e6da] bg-[#fffaf6] px-3 py-2">
          <Input.Search
            placeholder="Search..."
            className="w-44"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(val) => setSearchText(val)}
            size="small"
          />
          <div className="ml-auto">
            <Popover
              trigger="click"
              placement="bottomRight"
              overlayInnerStyle={{ padding: 12 }}
              content={
                <div className="w-64 space-y-3">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#9D4D01]">
                    Filters
                  </p>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#582f08]">Year</p>
                    <Select
                      size="small"
                      className="w-full"
                      placeholder="Year"
                      allowClear
                      value={filterFYId || undefined}
                      onChange={(v) => setFilterFYId(v ?? '')}
                      options={(financialYear?.data?.data ?? []).map((y) => ({
                        label: `FY ${new Date(y.startDate).getFullYear()}`,
                        value: y.id,
                      }))}
                      getPopupContainer={(node) =>
                        node.closest('.ant-popover-inner-content') || node.parentElement
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#582f08]">Division</p>
                    <Select
                      size="small"
                      className="w-full"
                      placeholder="Division"
                      allowClear
                      value={selectedDivision || undefined}
                      onChange={(v) => { setSelectedDivision(v ?? ''); setSelectedDepartment(''); }}
                      options={(divisions?.data ?? []).map((d) => ({
                        label: capitalize(d.divisionName),
                        value: d.divisionId,
                      }))}
                      showSearch
                      optionFilterProp="label"
                      getPopupContainer={(node) =>
                        node.closest('.ant-popover-inner-content') || node.parentElement
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#582f08]">Department</p>
                    <Select
                      size="small"
                      className="w-full"
                      placeholder="Department"
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
                      getPopupContainer={(node) =>
                        node.closest('.ant-popover-inner-content') || node.parentElement
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#582f08]">Status</p>
                    <Select
                      size="small"
                      className="w-full"
                      placeholder="Status"
                      allowClear
                      value={filterStatus || undefined}
                      onChange={(v) => {
                        const next = v ?? '';
                        setFilterStatus(next);
                        navigate(next ? `/budget?status=${next}` : '/budget');
                      }}
                      options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ label: v, value: k }))}
                      getPopupContainer={(node) =>
                        node.closest('.ant-popover-inner-content') || node.parentElement
                      }
                    />
                  </div>
                  {(filterFYId || selectedDivision || selectedDepartment || filterStatus) && (
                    <Button
                      size="small"
                      type="link"
                      className="px-0"
                      style={{ color: '#9D4D01' }}
                      onClick={() => {
                        setFilterFYId('');
                        setSelectedDivision('');
                        setSelectedDepartment('');
                        setFilterStatus('');
                        navigate('/budget');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              }
            >
              <Badge
                count={[filterFYId, selectedDivision, selectedDepartment, filterStatus].filter(Boolean).length}
                size="small"
                color="#9D4D01"
                offset={[-2, 2]}
              >
                <Button
                  size="small"
                  icon={<FilterOutlined />}
                  className="border-[#ead9cb] text-[#582f08]"
                  aria-label="Filter budgets"
                />
              </Badge>
            </Popover>
          </div>
        </div>

        {showRowSelection && selectedRowKeys.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e6da] bg-[#fff4e8] px-3 py-2">
            <p className="m-0 text-sm text-[#582f08]">
              <span className="font-semibold">{selectedRowKeys.length}</span> selected
              {selectedRecommended.length
                ? ` · ${selectedRecommended.length} ready to approve`
                : filterStatus === 'RECOMMENDED'
                  ? ''
                  : ' · marked budgets stay selected on Approvals'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                onClick={() => {
                  const visible = new Set(data.map((b) => b.id));
                  saveMarkedBudgetIds(loadMarkedBudgetIds().filter((id) => !visible.has(id)));
                  setSelectedRowKeys([]);
                }}
              >
                Clear
              </Button>
              {canApprove && (
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={approving}
                  disabled={!selectedRecommended.length}
                  onClick={confirmApproveSelected}
                  style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
                >
                  Approve selected
                </Button>
              )}
            </div>
          </div>
        )}

        <Table
            columns={budgetColumns}
            rowSelection={
              showRowSelection
                ? {
                    selectedRowKeys,
                    onChange: (keys) => {
                      setSelectedRowKeys(keys);
                      const visible = new Set(data.map((b) => b.id));
                      const kept = loadMarkedBudgetIds().filter((id) => !visible.has(id));
                      saveMarkedBudgetIds([...kept, ...keys]);
                    },
                    getCheckboxProps: (record) => ({
                      disabled: !MARKABLE_STATUSES.includes(record.status ?? 'DRAFT'),
                    }),
                    preserveSelectedRowKeys: true,
                  }
                : undefined
            }
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
            dataSource={data}
            loading={isLoading}
            scroll={{ x: 720 }}
            size="small"
            pagination={{
              pageSize: 12,
              showSizeChanger: false,
              className: 'px-3 pb-2',
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#fffaf6]'
            }
          />
      </div>

      {!['COMMITTEE_REVIEW', 'RECOMMENDED', 'SUBMITTED', 'RETURNED'].includes(filterStatus) && (
      <Collapse
        ghost
        size="small"
        items={[
          {
            key: 'archived',
            label: (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#582f08]">Archived</span>
                <Tag color="orange">{archivedData.length}</Tag>
              </div>
            ),
            children: (
              <div className="overflow-x-auto">
                <Input.Search
                    placeholder="Search archived..."
                    className="mb-2 w-full sm:w-64"
                    allowClear
                    size="small"
                    value={archivedSearchText}
                    onChange={(e) => setArchivedSearchText(e.target.value)}
                    onSearch={(val) => setArchivedSearchText(val)}
                  />
                <Table
                  columns={[
                    {
                      title: 'Budget',
                      dataIndex: 'name',
                      key: 'name',
                      render: (value) => (
                        <span className="font-medium text-[#582F08]">{value && capitalize(value)}</span>
                      ),
                    },
                    hasPermission(allRolePermissions, [
                      requiredPermissions.READ_BUDGET_GLOBAL,
                    ]) && {
                      title: 'Department',
                      key: 'department',
                      dataIndex: ['department', 'departmentName'],
                      render: (value) => <span className="text-xs">{value && capitalize(value)}</span>,
                    },
                    {
                      title: 'Year',
                      dataIndex: 'financialYear',
                      key: 'financialYear',
                      render: (value) => (
                        <span className="text-xs">{`${new Date(
                          value.startDate
                        ).getFullYear()}`}</span>
                      ),
                    },
                    {
                      title: '',
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
                  scroll={{ x: 520 }}
                  size="small"
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                />
              </div>
            ),
          },
        ]}
        className="rounded-xl border border-[#f0e6da] bg-white"
      />
      )}
    </div>
  );
};

export default BudgetIndex;
