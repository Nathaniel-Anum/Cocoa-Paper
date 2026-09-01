import React, { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Progress,
  Select,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Radio,
} from 'antd';
import {
  ArrowLeftOutlined,
  SwapOutlined,
  RiseOutlined,
  FallOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useGetFinancialYear,
  useCompareBudgetsByYear,
  useGetAllBudgets,
} from '../../../queryHooks/budget';
import { capitalize, formatMoney } from '../../../../utils/typography';
import axiosInstance from '../../../Components/axiosInstance';
import { compareBudgetVersions, versionLabel } from './compareBudgetVersions';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(v) {
  if (v === null || v === undefined) return null;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  increased: {
    label: 'Increased',
    color: '#ba1a1a',
    bg: '#fff1f2',
    border: '#fecdd3',
    icon: <RiseOutlined />,
    tagColor: 'error',
    rowBg: '#fff1f2',
  },
  reduced: {
    label: 'Reduced',
    color: '#003e57',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: <FallOutlined />,
    tagColor: 'processing',
    rowBg: '#eff6ff',
  },
  new: {
    label: 'New Line',
    color: '#9D4D01',
    bg: '#fdf5ef',
    border: '#f0e6db',
    icon: <PlusCircleOutlined />,
    tagColor: 'orange',
    rowBg: '#fdf5ef',
  },
  removed: {
    label: 'Removed',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: <MinusCircleOutlined />,
    tagColor: 'warning',
    rowBg: '#fffbeb',
  },
  unchanged: {
    label: 'Unchanged',
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    icon: null,
    tagColor: 'default',
    rowBg: '',
  },
};

// ── Summary stat card ─────────────────────────────────────────────────────────
function SummaryCard({ type, count, active, onClick }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <button
      onClick={onClick}
      className="rounded-xl border-2 p-3 text-center transition-all cursor-pointer w-full"
      style={{
        background: active ? cfg.bg : '#fff',
        borderColor: active ? cfg.color : '#e5e7eb',
        boxShadow: active ? `0 0 0 2px ${cfg.color}22` : undefined,
      }}
    >
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: cfg.color }}>
        {cfg.icon && <span className="text-base">{cfg.icon}</span>}
        <span className="text-xl font-extrabold">{count}</span>
      </div>
      <div className="text-xs font-semibold" style={{ color: cfg.color }}>
        {cfg.label}
      </div>
    </button>
  );
}

function InsightCard({ title, items, footer, accent = 'default' }) {
  const accentStyles = {
    default: { bg: '#fff', border: '#ead9cb', title: '#7a6859' },
    alert: { bg: '#582f08', border: '#582f08', title: '#ffdcc7' },
  };
  const style = accentStyles[accent] ?? accentStyles.default;

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <h4
        className="m-0 text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: style.title }}
      >
        {title}
      </h4>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span style={{ color: accent === 'alert' ? '#fff4e8' : '#582f08' }}>{item.label}</span>
            <span className="font-bold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {footer && (
        <p
          className="m-0 mt-4 border-t pt-3 text-xs italic"
          style={{
            borderColor: accent === 'alert' ? 'rgba(255,255,255,0.12)' : '#ead9cb',
            color: accent === 'alert' ? '#f6e7d8' : '#7a6859',
          }}
        >
          {footer}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const BudgetCompare = () => {
  const navigate = useNavigate();

  // Comparison mode: financial years vs budget versions
  const [compareMode, setCompareMode] = useState('version');
  const [viewPreference, setViewPreference] = useState('delta');
  const [lineSearch, setLineSearch] = useState('');

  // Selector state
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [yearAId, setYearAId] = useState(null);
  const [yearBId, setYearBId] = useState(null);
  const [budgetAId, setBudgetAId] = useState(null);
  const [budgetBId, setBudgetBId] = useState(null);

  // Filter: 'all' | 'new' | 'recurring' | 'removed'
  const [lineFilter, setLineFilter] = useState('all');

  // Comparison modal
  const [modalOpen, setModalOpen] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: yearsRes, isLoading: yearsLoading } = useGetFinancialYear({});
  const financialYears = yearsRes?.data?.data ?? [];

  const { data: divisionsRes, isLoading: divisionsLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
  });
  const divisions = divisionsRes?.data ?? [];

  const { data: deptsRes, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: !!selectedDivision,
  });
  const departments = deptsRes?.data?.data ?? [];

  const compareParams = useMemo(
    () => ({
      ...(selectedDeptId ? { departmentId: selectedDeptId } : {}),
      yearAId,
      yearBId,
    }),
    [selectedDeptId, yearAId, yearBId],
  );

  const {
    data: compareRes,
    isLoading: compareLoading,
    isFetching: compareFetching,
  } = useCompareBudgetsByYear(compareParams);

  const compareData = compareRes?.data?.data;

  const { data: budgetsRes, isLoading: budgetsLoading } = useGetAllBudgets(
    selectedDeptId ? { departmentId: selectedDeptId, limit: 100 } : { limit: 100 },
  );
  const departmentBudgets = budgetsRes?.data?.data ?? [];

  const { data: budgetARes } = useQuery({
    queryKey: ['budget', budgetAId],
    queryFn: () => axiosInstance.get(`/budget/${budgetAId}`),
    enabled: compareMode === 'version' && !!budgetAId,
  });
  const { data: budgetBRes } = useQuery({
    queryKey: ['budget', budgetBId],
    queryFn: () => axiosInstance.get(`/budget/${budgetBId}`),
    enabled: compareMode === 'version' && !!budgetBId,
  });

  const versionCompareData = useMemo(() => {
    if (compareMode !== 'version' || !budgetAId || !budgetBId || budgetAId === budgetBId) {
      return null;
    }
    const budgetA = budgetARes?.data?.data;
    const budgetB = budgetBRes?.data?.data;
    if (!budgetA || !budgetB) return null;
    return compareBudgetVersions(budgetA, budgetB);
  }, [compareMode, budgetAId, budgetBId, budgetARes, budgetBRes]);

  const activeCompareData = compareMode === 'version' ? versionCompareData : compareData;
  const activeCompareLoading =
    compareMode === 'version'
      ? budgetsLoading || (!!budgetAId && !budgetARes) || (!!budgetBId && !budgetBRes)
      : compareLoading || compareFetching;

  // ── Derived rows ───────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!activeCompareData?.rows) return [];
    const rows = activeCompareData.rows;
    const searched = lineSearch
      ? rows.filter((row) => row.item?.toLowerCase().includes(lineSearch.toLowerCase()))
      : rows;
    if (lineFilter === 'all') return searched;
    if (lineFilter === 'new') return searched.filter((r) => r.type === 'new');
    if (lineFilter === 'removed') return searched.filter((r) => r.type === 'removed');
    if (lineFilter === 'recurring')
      return searched.filter((r) => ['increased', 'reduced', 'unchanged'].includes(r.type));
    return searched;
  }, [activeCompareData, lineFilter, lineSearch]);

  // ── Year label helpers ─────────────────────────────────────────────────────
  const yearLabel = (id) => {
    const fy = financialYears.find((y) => y.id === id);
    if (!fy) return '?';
    const s = new Date(fy.startDate).getFullYear();
    const e = new Date(fy.endDate).getFullYear();
    return s === e ? String(s) : `${s}–${e}`;
  };

  const deptName =
    departments.find((d) => d.departmentId === selectedDeptId)?.departmentName ??
    activeCompareData?.department?.departmentName ??
    'All Departments';

  const yearALabel =
    compareMode === 'version'
      ? versionLabel(activeCompareData?.versionA?.budget)
      : activeCompareData?.yearA?.label ?? yearLabel(yearAId);
  const yearBLabel =
    compareMode === 'version'
      ? versionLabel(activeCompareData?.versionB?.budget)
      : activeCompareData?.yearB?.label ?? yearLabel(yearBId);

  const canCompare =
    compareMode === 'version'
      ? !!(budgetAId && budgetBId && budgetAId !== budgetBId)
      : !!(yearAId && yearBId && yearAId !== yearBId);

  const totals = activeCompareData?.totals;
  const summary = activeCompareData?.summary ?? {};
  const topIncreases = useMemo(
    () =>
      [...(activeCompareData?.rows ?? [])]
        .filter((row) => row.type === 'increased' || row.type === 'new')
        .sort((a, b) => Math.abs(b.diff ?? b.amountB ?? 0) - Math.abs(a.diff ?? a.amountB ?? 0))
        .slice(0, 3),
    [activeCompareData],
  );
  const topReductions = useMemo(
    () =>
      [...(activeCompareData?.rows ?? [])]
        .filter((row) => row.type === 'reduced' || row.type === 'removed')
        .sort((a, b) => Math.abs(b.diff ?? a.amountA ?? 0) - Math.abs(a.diff ?? a.amountA ?? 0))
        .slice(0, 3),
    [activeCompareData],
  );
  const variancePctAbs = Math.abs(totals?.pctChange ?? 0);
  const thresholdExceeded = variancePctAbs > 1;

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Budget Line',
      dataIndex: 'item',
      key: 'item',
      width: '25%',
      render: (v, row) => (
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-800">{capitalize(v)}</span>
          {row.type !== 'unchanged' && (
            <Tag
              color={TYPE_CONFIG[row.type].tagColor}
              className="text-[10px] font-bold uppercase m-0 flex-shrink-0 mt-0.5"
              style={{ lineHeight: '16px' }}
            >
              {TYPE_CONFIG[row.type].icon} {TYPE_CONFIG[row.type].label}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: () => (
        <span className="font-bold text-gray-600">
          {compareMode === 'version' ? yearALabel : `FY ${yearALabel}`}
        </span>
      ),
      dataIndex: 'amountA',
      key: 'amountA',
      align: 'right',
      render: (v) =>
        v === null ? (
          <span className="text-gray-300 text-xs italic">—</span>
        ) : (
          <span className="font-medium text-gray-700">{formatMoney(v)}</span>
        ),
    },
    {
      title: () => (
        <span className="font-bold" style={{ color: '#9D4D01' }}>
          {compareMode === 'version' ? yearBLabel : `FY ${yearBLabel}`}
        </span>
      ),
      dataIndex: 'amountB',
      key: 'amountB',
      align: 'right',
      render: (v, row) => {
        if (v === null) return <span className="text-gray-300 text-xs italic">—</span>;
        // Highlight if increased from previous year
        if (row.type === 'increased' || row.type === 'new') {
          return (
            <span className="font-bold" style={{ color: TYPE_CONFIG.increased.color }}>
              {formatMoney(v)}
            </span>
          );
        }
        if (row.type === 'reduced') {
          return (
            <span className="font-bold" style={{ color: TYPE_CONFIG.reduced.color }}>
              {formatMoney(v)}
            </span>
          );
        }
        return <span className="font-medium text-gray-700">{formatMoney(v)}</span>;
      },
    },
    {
      title: 'Change (GHS)',
      key: 'diff',
      align: 'right',
      render: (_, row) => {
        if (row.type === 'new')
          return <span className="font-semibold" style={{ color: '#9D4D01' }}>New entry</span>;
        if (row.type === 'removed')
          return <span className="font-semibold text-amber-500">Line removed</span>;
        const sign = row.diff > 0 ? '+' : '';
        return (
          <span
            className="font-semibold"
            style={{ color: TYPE_CONFIG[row.type].color }}
          >
            {sign}
            {formatMoney(row.diff)}
          </span>
        );
      },
    },
    {
      title: '% Change',
      key: 'pct',
      align: 'right',
      render: (_, row) => {
        if (row.type === 'new' || row.type === 'removed' || row.pctChange === null)
          return <span className="text-gray-300">—</span>;
        return (
          <Tag
            color={TYPE_CONFIG[row.type].tagColor}
            className="font-bold"
          >
            {fmtPct(row.pctChange)}
          </Tag>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/budget')}
              size="small"
              className="mt-1 border-[#ead9cb] text-[#7a6859] hover:border-[#9D4D01] hover:text-[#9D4D01]"
            />
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
                Analytical Workspace
              </p>
              <h2 className="m-0 mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">
                <BarChartOutlined className="text-[#9D4D01]" /> Version Comparison
              </h2>
              <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-[#7a6859]">
                Compare departmental budget versions across workflow milestones or financial years
                and identify major shifts in requested, reduced, and newly introduced spend.
              </p>
            </div>
          </div>

          {activeCompareData && (
            <div className="rounded-2xl border border-[#ead9cb] bg-[#fdf5ef] px-4 py-3">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#9D4D01]">
                Active Comparison
              </p>
              <p className="m-0 mt-1 text-sm font-semibold text-[#582f08]">
                {capitalize(deptName)} · {yearALabel} vs {yearBLabel}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type={compareMode === 'version' ? 'primary' : 'default'}
            onClick={() => setCompareMode('version')}
            style={
              compareMode === 'version'
                ? { background: '#582f08', borderColor: '#582f08' }
                : undefined
            }
          >
            Budget Versions
          </Button>
          <Button
            type={compareMode === 'year' ? 'primary' : 'default'}
            onClick={() => setCompareMode('year')}
            style={
              compareMode === 'year'
                ? { background: '#582f08', borderColor: '#582f08' }
                : undefined
            }
          >
            Financial Years
          </Button>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#ead9cb] bg-[#fdf1eb] p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {/* Division */}
          <div>
            <label className="block text-xs font-bold text-[#582f08] uppercase tracking-wider mb-1.5">
              Division
            </label>
            <Select
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Select division…"
              value={selectedDivision || undefined}
              onChange={(v) => {
                setSelectedDivision(v);
                setSelectedDeptId('');
              }}
              options={(divisions ?? []).map((d) => ({
                label: capitalize(d.divisionName),
                value: d.divisionId,
              }))}
              loading={divisionsLoading}
              allowClear
              onClear={() => { setSelectedDivision(''); setSelectedDeptId(''); }}
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-[#582f08] uppercase tracking-wider mb-1.5">
              Department
            </label>
            <Select
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder={selectedDivision ? 'Select department…' : 'Select division first'}
              value={selectedDeptId || undefined}
              onChange={setSelectedDeptId}
              options={(departments ?? []).map((d) => ({
                label: capitalize(d.departmentName),
                value: d.departmentId,
              }))}
              disabled={!selectedDivision}
              loading={deptsLoading}
              allowClear
              onClear={() => setSelectedDeptId('')}
            />
          </div>

          {/* Year A / Budget A */}
          <div>
            <label className="block text-xs font-bold text-[#582f08] uppercase tracking-wider mb-1.5">
              {compareMode === 'version' ? 'Base Version' : 'Base Year (from)'}
            </label>
            {compareMode === 'version' ? (
              <Select
                className="w-full"
                size="large"
                showSearch
                optionFilterProp="label"
                placeholder="Select base budget version…"
                value={budgetAId ?? undefined}
                onChange={setBudgetAId}
                options={departmentBudgets
                  .filter((b) => b.id !== budgetBId)
                  .map((b) => ({
                    label: `${capitalize(b.name)} · ${versionLabel(b)}`,
                    value: b.id,
                  }))}
                loading={budgetsLoading}
                allowClear
                onClear={() => setBudgetAId(null)}
              />
            ) : (
            <Select
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Select base year…"
              value={yearAId ?? undefined}
              onChange={setYearAId}
              options={(financialYears ?? [])
                .filter((y) => y.id !== yearBId)
                .map((y) => ({
                  label: `FY ${new Date(y.startDate).getFullYear()}`,
                  value: y.id,
                }))}
              loading={yearsLoading}
              allowClear
              onClear={() => setYearAId(null)}
            />
            )}
          </div>

          {/* Year B / Budget B */}
          <div>
            <label className="block text-xs font-bold text-[#582f08] uppercase tracking-wider mb-1.5">
              {compareMode === 'version' ? 'Comparison Version' : 'Compare Year (to)'}
            </label>
            {compareMode === 'version' ? (
              <Select
                className="w-full"
                size="large"
                showSearch
                optionFilterProp="label"
                placeholder="Select comparison version…"
                value={budgetBId ?? undefined}
                onChange={setBudgetBId}
                options={departmentBudgets
                  .filter((b) => b.id !== budgetAId)
                  .map((b) => ({
                    label: `${capitalize(b.name)} · ${versionLabel(b)}`,
                    value: b.id,
                  }))}
                loading={budgetsLoading}
                allowClear
                onClear={() => setBudgetBId(null)}
              />
            ) : (
            <Select
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Select compare year…"
              value={yearBId ?? undefined}
              onChange={setYearBId}
              options={(financialYears ?? [])
                .filter((y) => y.id !== yearAId)
                .map((y) => ({
                  label: `FY ${new Date(y.startDate).getFullYear()}`,
                  value: y.id,
                }))}
              loading={yearsLoading}
              allowClear
              onClear={() => setYearBId(null)}
            />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#582f08] uppercase tracking-wider mb-1.5">
              View Preference
            </label>
            <Radio.Group
              value={viewPreference}
              onChange={(e) => setViewPreference(e.target.value)}
              buttonStyle="solid"
              className="w-full"
            >
              <Radio.Button value="side" className="w-1/2 text-center">
                Side-by-Side
              </Radio.Button>
              <Radio.Button value="delta" className="w-1/2 text-center">
                Unified Delta
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

          <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            size="large"
            icon={<SwapOutlined />}
            disabled={!canCompare}
            loading={activeCompareLoading}
            onClick={() => setModalOpen(true)}
            style={{
              background: canCompare ? '#582f08' : undefined,
              border: 'none',
              fontWeight: 700,
              letterSpacing: '0.02em',
              paddingLeft: 28,
              paddingRight: 28,
            }}
          >
            Compare Budgets
          </Button>
          </div>
        </div>
      </section>

      {/* ── Quick summary (shown after data loads) ───────────────────────── */}
      {activeCompareData && (
        <>
          <Card
            className="rounded-[28px] shadow-sm"
            style={{ borderColor: '#ead9cb' }}
            bodyStyle={{ padding: '24px 28px' }}
          >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#582f08] m-0">
                {capitalize(deptName)} — FY {yearALabel} vs FY {yearBLabel}
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Click a category card to filter, or{' '}
                <button
                  className="text-[#9D4D01] font-semibold underline-offset-2 hover:underline"
                  onClick={() => setModalOpen(true)}
                >
                  open full comparison
                </button>
                .
              </p>
            </div>
            <Button
              icon={<SwapOutlined />}
              onClick={() => setModalOpen(true)}
              style={{ borderColor: '#9D4D01', color: '#9D4D01', fontWeight: 600 }}
            >
              View Full Table
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {['new', 'increased', 'reduced', 'removed', 'unchanged'].map((type) => (
              <SummaryCard
                key={type}
                type={type}
                count={summary[type] ?? 0}
                active={lineFilter === (type === 'increased' || type === 'reduced' || type === 'unchanged' ? 'recurring' : type === 'new' ? 'new' : type === 'removed' ? 'removed' : 'all')}
                onClick={() => {
                  if (type === 'increased' || type === 'reduced' || type === 'unchanged') {
                    setLineFilter('recurring');
                  } else if (type === 'new') {
                    setLineFilter('new');
                  } else if (type === 'removed') {
                    setLineFilter('removed');
                  }
                  setModalOpen(true);
                }}
              />
            ))}
          </div>

          <div
            className="rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ background: '#fdf5ef', border: '1px solid #f0e6db' }}
          >
            <Statistic
              title={<span className="text-xs font-semibold text-[#9D4D01] uppercase tracking-wider">FY {yearALabel} Total</span>}
              value={totals?.amountA ?? 0}
              formatter={(v) => formatMoney(v)}
              valueStyle={{ color: '#582f08', fontWeight: 800, fontSize: 20 }}
            />
            <Statistic
              title={<span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9D4D01' }}>FY {yearBLabel} Total</span>}
              value={totals?.amountB ?? 0}
              formatter={(v) => formatMoney(v)}
              valueStyle={{ color: '#9D4D01', fontWeight: 800, fontSize: 20 }}
            />
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Net Change
              </div>
              <div
                className="text-xl font-extrabold"
                style={{
                  color:
                    (totals?.diff ?? 0) > 0
                      ? TYPE_CONFIG.increased.color
                      : (totals?.diff ?? 0) < 0
                      ? TYPE_CONFIG.reduced.color
                      : '#6b7280',
                }}
              >
                {(totals?.diff ?? 0) >= 0 ? '+' : ''}
                {formatMoney(totals?.diff ?? 0)}
                {totals?.pctChange !== null && totals?.pctChange !== undefined && (
                  <span className="ml-2 text-sm font-semibold opacity-75">
                    ({fmtPct(totals.pctChange)})
                  </span>
                )}
              </div>
              {totals && (
                <Progress
                  percent={Math.min(
                    100,
                    Math.abs(((totals.diff / (totals.amountA || 1)) * 100)),
                  )}
                  showInfo={false}
                  strokeColor={
                    totals.diff > 0
                      ? TYPE_CONFIG.increased.color
                      : TYPE_CONFIG.reduced.color
                  }
                  trailColor="#e5e7eb"
                  size="small"
                  className="mt-1"
                />
              )}
            </div>
          </div>
          </Card>

          <section className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[#7a6859]">Quick Filters:</span>
            <Input.Search
              placeholder="Search line items..."
              className="ml-auto w-64"
              allowClear
              onChange={(e) => setLineSearch(e.target.value)}
            />
            <Button
              onClick={() => setLineFilter('recurring')}
              className="rounded-full"
              style={{
                borderColor: '#fecdd3',
                color: '#ba1a1a',
                background: lineFilter === 'recurring' ? '#fff1f2' : '#fff',
              }}
            >
              Increased / Reduced
            </Button>
            <Button
              onClick={() => setLineFilter('new')}
              className="rounded-full"
              style={{
                borderColor: '#f0e6db',
                color: '#9D4D01',
                background: lineFilter === 'new' ? '#fdf5ef' : '#fff',
              }}
            >
              New Items
            </Button>
            <Button
              onClick={() => setLineFilter('removed')}
              className="rounded-full"
              style={{
                borderColor: '#bfdbfe',
                color: '#003e57',
                background: lineFilter === 'removed' ? '#eff6ff' : '#fff',
              }}
            >
              Removed
            </Button>
            <Button onClick={() => setLineFilter('all')} className="rounded-full">
              Reset
            </Button>
          </section>

          <div className="overflow-hidden rounded-[28px] border border-[#ead9cb] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6db] bg-[#582f08] px-6 py-4">
              <div>
                <h3 className="m-0 text-lg font-bold text-[#fff4e8]">Comparison Table</h3>
                <p className="m-0 mt-1 text-xs uppercase tracking-[0.16em] text-[#ead9cb]">
                  {filteredRows.length} visible lines
                </p>
              </div>
              <Button
                icon={<SwapOutlined />}
                onClick={() => setModalOpen(true)}
                style={{ borderColor: '#ffdcc7', color: '#ffdcc7', background: 'transparent' }}
              >
                Expand Detailed View
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={filteredRows.map((r) => ({ ...r, key: r.key }))}
              pagination={{ pageSize: 12, size: 'small', hideOnSinglePage: true }}
              size="middle"
              scroll={{ x: 860 }}
              locale={{ emptyText: 'No budget lines match this filter.' }}
              onRow={(row) => ({
                style: { background: TYPE_CONFIG[row.type]?.rowBg || '' },
              })}
              summary={() => (
                <Table.Summary.Row style={{ background: '#fdf5ef', fontWeight: 700 }}>
                  <Table.Summary.Cell>
                    <span className="font-extrabold text-[#582f08]">
                      Aggregate totals ({filteredRows.length} lines)
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span className="font-bold text-gray-700">
                      {formatMoney(filteredRows.reduce((s, r) => s + (r.amountA ?? 0), 0))}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span className="font-bold" style={{ color: '#9D4D01' }}>
                      {formatMoney(filteredRows.reduce((s, r) => s + (r.amountB ?? 0), 0))}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span
                      className="font-bold"
                      style={{
                        color:
                          filteredRows.reduce((s, r) => s + (r.amountB ?? 0), 0) -
                            filteredRows.reduce((s, r) => s + (r.amountA ?? 0), 0) >
                          0
                            ? TYPE_CONFIG.increased.color
                            : TYPE_CONFIG.reduced.color,
                      }}
                    >
                      {formatMoney(
                        filteredRows.reduce((s, r) => s + (r.amountB ?? 0), 0) -
                          filteredRows.reduce((s, r) => s + (r.amountA ?? 0), 0),
                      )}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              title="Major Upside Drivers"
              items={(topIncreases.length ? topIncreases : [{ item: 'No major increases', diff: 0 }]).map((row) => ({
                label: capitalize(row.item ?? row.label),
                value:
                  row.type === 'new'
                    ? formatMoney(row.amountB ?? 0)
                    : `${row.diff >= 0 ? '+' : ''}${formatMoney(row.diff ?? 0)}`,
                color: TYPE_CONFIG.increased.color,
              }))}
              footer="Largest upward changes usually indicate scope growth, late additions, or re-baselined estimates."
            />
            <InsightCard
              title="Efficiency Gains"
              items={(topReductions.length ? topReductions : [{ item: 'No reductions detected', diff: 0 }]).map((row) => ({
                label: capitalize(row.item ?? row.label),
                value:
                  row.type === 'removed'
                    ? 'Removed'
                    : `${row.diff >= 0 ? '+' : ''}${formatMoney(row.diff ?? 0)}`,
                color: TYPE_CONFIG.reduced.color,
              }))}
              footer="Reductions and removals help surface where committee review created measurable savings."
            />
            <InsightCard
              title="Governance Status"
              accent="alert"
              items={[
                {
                  label: 'Net Variation',
                  value: `${(totals?.diff ?? 0) >= 0 ? '+' : ''}${formatMoney(totals?.diff ?? 0)}`,
                  color: '#fff4e8',
                },
                {
                  label: 'Threshold Check',
                  value: thresholdExceeded ? 'Manual Review' : 'Within Tolerance',
                  color: '#ffdcc7',
                },
              ]}
              footer={
                thresholdExceeded
                  ? 'Net variance exceeds the 1% guidance threshold and should be reviewed before approval.'
                  : 'The comparison remains within the default tolerance threshold.'
              }
            />
          </div>
        </>
      )}

      {/* Prompt when nothing selected yet */}
      {!activeCompareData && !activeCompareLoading && (
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={
            compareMode === 'version'
              ? 'Select a department and two budget versions above, then click Compare Budgets.'
              : 'Select two financial years above and click Compare Budgets to get started.'
          }
          className="rounded-xl"
        />
      )}

      {/* ── Full comparison modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose={false}
        title={
          <div className="pb-3 border-b border-[#f0e6db]">
            <div className="flex items-center gap-2">
              <BarChartOutlined className="text-[#9D4D01] text-base" />
              <span className="text-base font-extrabold text-[#582f08]">
                Budget Comparison — {capitalize(deptName)}
              </span>
            </div>
            <p className="text-xs text-gray-500 m-0 mt-0.5">
              FY {yearALabel}{' '}
              <SwapOutlined className="mx-1 text-gray-400" />
              FY {yearBLabel}
            </p>
          </div>
        }
        styles={{ body: { padding: '16px 24px 24px' } }}
      >
        {activeCompareLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !activeCompareData ? (
          <Empty description="Select parameters and compare" />
        ) : (
          <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Radio.Group
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="all">
                  All <Badge count={activeCompareData.rows.length} style={{ backgroundColor: '#6b7280' }} className="ml-1" />
                </Radio.Button>
                <Radio.Button value="new">
                  New Lines <Badge count={summary.new ?? 0} style={{ backgroundColor: '#9D4D01' }} className="ml-1" />
                </Radio.Button>
                <Radio.Button value="recurring">
                  Recurring <Badge count={(summary.increased ?? 0) + (summary.reduced ?? 0) + (summary.unchanged ?? 0)} style={{ backgroundColor: '#582f08' }} className="ml-1" />
                </Radio.Button>
                <Radio.Button value="removed">
                  Removed <Badge count={summary.removed ?? 0} style={{ backgroundColor: TYPE_CONFIG.removed.color }} className="ml-1" />
                </Radio.Button>
              </Radio.Group>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 text-xs">
                {['new', 'increased', 'reduced', 'removed', 'unchanged'].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 font-semibold"
                    style={{ color: TYPE_CONFIG[t].color }}
                  >
                    {TYPE_CONFIG[t].icon}
                    {TYPE_CONFIG[t].label}
                  </span>
                ))}
              </div>
            </div>

            {/* Comparison table */}
            <Table
              columns={columns}
              dataSource={filteredRows.map((r) => ({ ...r, key: r.key }))}
              pagination={{ pageSize: 15, hideOnSinglePage: true, size: 'small' }}
              size="small"
              scroll={{ x: 700 }}
              locale={{ emptyText: 'No budget lines match this filter.' }}
              rowClassName={(row) => {
                const bg = TYPE_CONFIG[row.type]?.rowBg;
                return bg ? `bg-custom-row` : '';
              }}
              onRow={(row) => ({
                style: { background: TYPE_CONFIG[row.type]?.rowBg || '' },
              })}
              summary={() => (
                <Table.Summary.Row
                  style={{ background: '#fdf5ef', fontWeight: 700 }}
                >
                  <Table.Summary.Cell>
                    <span className="font-extrabold text-[#582f08]">
                      Totals ({filteredRows.length} lines)
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span className="font-bold text-gray-700">
                      {formatMoney(
                        filteredRows.reduce((s, r) => s + (r.amountA ?? 0), 0),
                      )}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span className="font-bold" style={{ color: '#9D4D01' }}>
                      {formatMoney(
                        filteredRows.reduce((s, r) => s + (r.amountB ?? 0), 0),
                      )}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    {(() => {
                      const diff =
                        filteredRows.reduce((s, r) => s + (r.amountB ?? 0), 0) -
                        filteredRows.reduce((s, r) => s + (r.amountA ?? 0), 0);
                      return (
                        <span
                          className="font-bold"
                          style={{
                            color:
                              diff > 0
                                ? TYPE_CONFIG.increased.color
                                : diff < 0
                                ? TYPE_CONFIG.reduced.color
                                : '#6b7280',
                          }}
                        >
                          {diff >= 0 ? '+' : ''}{formatMoney(diff)}
                        </span>
                      );
                    })()}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BudgetCompare;
