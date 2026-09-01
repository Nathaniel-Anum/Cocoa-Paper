import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  InputNumber,
  message,
  Modal,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tabs,
  Tag,
  Input,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  PlayCircleOutlined,
  LikeOutlined,
  SendOutlined,
  DownloadOutlined,
  EditOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetBudgetById } from '../../../queryHooks/budget';
import {
  submitBudget,
  startCommitteeReview,
  recommendBudget,
  approveBudget,
  rejectBudget,
  returnBudget,
  updateBudget,
} from '../../../http/budget';
import { useUser } from '../../CustomHook/useUser';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import WorkflowStepper from './WorkflowStepper';
import { capitalize, formatMoney } from '../../../../utils/typography';
import {
  SummaryTile,
  LockBanner,
  TotalAmountCard,
  StickyActionBar,
  ReadOnlyPanel,
  BudgetWorkflowTimeline,
  buildBudgetAuditEvents,
  ExportReportButton,
} from './BudgetDesignShared';

// ── Status tag colours ──────────────────────────────────────────────────────
const STATUS_COLOR = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  COMMITTEE_REVIEW: 'blue',
  RECOMMENDED: 'purple',
  APPROVED: 'success',
  RETURNED: 'warning',
  REJECTED: 'error',
};

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  COMMITTEE_REVIEW: 'Committee Review',
  RECOMMENDED: 'Recommended',
  APPROVED: 'Approved',
  RETURNED: 'Returned for Correction',
  REJECTED: 'Rejected',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtYear(budget) {
  if (!budget?.financialYear) return '—';
  const s = new Date(budget.financialYear.startDate).getFullYear();
  const e = new Date(budget.financialYear.endDate).getFullYear();
  return s === e ? String(s) : `${s} – ${e}`;
}

const SURFACE_TONE = {
  DRAFT: { bg: '#fdf5ef', border: '#f0e6db', text: '#582f08', accent: '#9D4D01', label: 'Draft Workspace' },
  SUBMITTED: { bg: '#fff4e8', border: '#fdd9b0', text: '#7c3200', accent: '#9D4D01', label: 'Submitted for Review' },
  COMMITTEE_REVIEW: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', accent: '#2563eb', label: 'Committee Workspace' },
  RECOMMENDED: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', accent: '#7c3aed', label: 'Committee Recommendation' },
  APPROVED: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', accent: '#16a34a', label: 'Approved Budget' },
  RETURNED: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', accent: '#d97706', label: 'Returned for Correction' },
  REJECTED: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', accent: '#dc2626', label: 'Rejected Budget' },
};

// ── Workflow action modal ────────────────────────────────────────────────────
function ActionModal({ open, onCancel, onConfirm, title, requireNote, noteLabel, loading, confirmText, confirmDanger, description }) {
  const [note, setNote] = useState('');

  return (
    <Modal
      open={open}
      onCancel={() => { onCancel(); setNote(''); }}
      footer={null}
      title={<span className="font-bold text-[#582f08]">{title}</span>}
      destroyOnClose
    >
      {description && (
        <p className="mt-2 mb-0 text-sm leading-6 text-[#7a6859]">{description}</p>
      )}
      {requireNote && (
        <div className="mt-4 mb-4">
          <label className="text-sm font-semibold text-[#582f08] block mb-1">
            {noteLabel ?? 'Note'} <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your reason or comment..."
            className="rounded-lg"
          />
        </div>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={() => { onCancel(); setNote(''); }}>Cancel</Button>
        <Button
          type="primary"
          danger={confirmDanger}
          loading={loading}
          disabled={requireNote && !note.trim()}
          onClick={() => { onConfirm(note); setNote(''); }}
          style={!confirmDanger ? { background: '#582f08', border: 'none' } : undefined}
        >
          {confirmText ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qClient = useQueryClient();
  const { user: authUser } = useUser();
  const allRolePerms = getAllRolePermissions(authUser);

  const { data: budgetRes, isLoading } = useGetBudgetById(id);
  const budget = budgetRes?.data?.data;

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // 'submit' | 'start-review' | 'recommend' | 'approve' | 'reject' | 'return'

  const invalidate = () => {
    qClient.invalidateQueries({ queryKey: ['budget', id] });
    qClient.invalidateQueries({ queryKey: ['budgets'] });
    qClient.invalidateQueries({ queryKey: ['budget-stats'] });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const mkMutation = (fn, successMsg) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => { message.success(successMsg); invalidate(); setModal(null); },
      onError: (e) => message.error(e?.response?.data?.error ?? 'Action failed'),
    });

  const submitM = mkMutation(() => submitBudget(id), 'Budget submitted for review.');
  const reviewM = mkMutation(() => startCommitteeReview(id), 'Committee review started.');
  const recommendM = mkMutation((note) => recommendBudget(id, note), 'Budget recommended for approval.');
  const approveM = mkMutation((note) => approveBudget(id, note), 'Budget approved successfully!');
  const rejectM = mkMutation((note) => rejectBudget(id, note), 'Budget rejected.');
  const returnM = mkMutation((note) => returnBudget(id, note), 'Budget returned for correction.');

  const pending = submitM.isPending || reviewM.isPending || recommendM.isPending ||
    approveM.isPending || rejectM.isPending || returnM.isPending;

  // ── Permissions ────────────────────────────────────────────────────────────
  const can = (perm) => hasPermission(allRolePerms, [requiredPermissions[perm]]);

  // ── Inline amount editing ──────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editedAmounts, setEditedAmounts] = useState({});

  const enterEditMode = () => {
    const initial = {};
    budget?.budgetItems?.forEach((item) => { initial[item.id] = item.amount; });
    setEditedAmounts(initial);
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setEditMode(false);
    setEditedAmounts({});
  };

  const { mutate: saveAmounts, isPending: savingAmounts } = useMutation({
    mutationFn: () =>
      updateBudget(id, {
        name: budget.name,
        departmentId: budget.departmentId,
        budgetItems: budget.budgetItems.map((item) => ({
          id: item.id,
          item: item.item,
          amount: editedAmounts[item.id] ?? item.amount,
          quantity: item.quantity,
          dollarAmount: item.dollarAmount,
        })),
      }),
    onSuccess: () => {
      message.success('Budget amounts updated successfully.');
      invalidate();
      setEditMode(false);
      setEditedAmounts({});
    },
    onError: (e) => message.error(e?.response?.data?.error ?? 'Failed to save changes'),
  });

  // ── Committee Workspace state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('revision');
  const [lineEditDrawer, setLineEditDrawer] = useState(null); // item object or null
  const [lineEditReason, setLineEditReason] = useState('');
  const [lineEditAmount, setLineEditAmount] = useState(null);

  // ── Budget items table ─────────────────────────────────────────────────────
  const budgetItemCols = [
    { title: 'Item', dataIndex: 'item', key: 'item', render: (v) => capitalize(v) },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', render: (v) => v ?? '—' },
    {
      title: 'Amount (GHS)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (v, record) => {
        if (editMode) {
          return (
            <InputNumber
              min={0}
              value={editedAmounts[record.id] ?? v}
              onChange={(val) =>
                setEditedAmounts((prev) => ({ ...prev, [record.id]: val ?? 0 }))
              }
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
              style={{ width: 140 }}
              size="small"
            />
          );
        }
        return <span className="font-semibold">{formatMoney(v)}</span>;
      },
    },
  ];

  // ── Total (reflects live edits) ────────────────────────────────────────────
  const total = editMode
    ? Object.values(editedAmounts).reduce((s, v) => s + (v ?? 0), 0)
    : (budget?.budgetItems?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6 text-center text-gray-500">Budget not found.</div>
    );
  }

  const status = budget.status ?? 'DRAFT';
  const isLocked = ['APPROVED', 'REJECTED'].includes(status);
  const tone = SURFACE_TONE[status] ?? SURFACE_TONE.DRAFT;
  const lineCount = budget?.budgetItems?.length ?? 0;
  const liveEditedTotal = editMode
    ? Object.values(editedAmounts).reduce((s, v) => s + (v ?? 0), 0)
    : total;
  const amountVariance = liveEditedTotal - total;

  // Who can edit amounts inline at each stage:
  //   DRAFT / RETURNED      → UPDATE_BUDGET
  //   COMMITTEE_REVIEW      → RECOMMEND_BUDGET or EDIT_BUDGET_COMMITTEE
  //   RECOMMENDED           → APPROVE_BUDGET  or EDIT_BUDGET_COMMITTEE
  const canEditAmountsInline =
    !isLocked &&
    ((['DRAFT', 'RETURNED'].includes(status) && can('UPDATE_BUDGET')) ||
      (status === 'COMMITTEE_REVIEW' &&
        (can('RECOMMEND_BUDGET') || can('EDIT_BUDGET_COMMITTEE'))) ||
      (status === 'RECOMMENDED' &&
        (can('APPROVE_BUDGET') || can('EDIT_BUDGET_COMMITTEE'))));

  // Keep isEditableByRole for the navigate-to-full-edit button
  const isEditableByRole =
    ['DRAFT', 'RETURNED'].includes(status) ||
    ((can('RECOMMEND_BUDGET') || can('APPROVE_BUDGET') || can('EDIT_BUDGET_COMMITTEE')) &&
      ['COMMITTEE_REVIEW', 'RECOMMENDED'].includes(status));

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/budget')}
              size="small"
              className="mt-1 text-[#582f08] border-[#f0e6db]"
            />
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
                {tone.label}
              </p>
              <h2 className="m-0 mt-2 text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">
                {capitalize(budget.name)}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#7a6859]">
                <span>{budget.department?.departmentName ?? '—'}</span>
                <span className="h-1 w-1 rounded-full bg-[#c9b8a7]" />
                <span>{budget.department?.division?.divisionName ?? '—'}</span>
                <span className="h-1 w-1 rounded-full bg-[#c9b8a7]" />
                <span>FY {fmtYear(budget)}</span>
                <span className="h-1 w-1 rounded-full bg-[#c9b8a7]" />
                <span>{lineCount} line items</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Tag
              color={STATUS_COLOR[status]}
              className="text-sm font-semibold px-3 py-1 rounded-full"
            >
              {STATUS_LABEL[status]}
            </Tag>
            <Tooltip title="Compare with another year's budget">
              <Button
                icon={<SwapOutlined />}
                size="small"
                onClick={() => navigate('/budget/compare')}
                style={{ borderColor: '#9D4D01', color: '#9D4D01' }}
              >
                Compare
              </Button>
            </Tooltip>
            {isEditableByRole && (
              <Tooltip title={['COMMITTEE_REVIEW', 'RECOMMENDED'].includes(status) ? 'Edit (Committee / Approval access)' : 'Edit budget'}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => navigate(`/update-budget-item/${id}`)}
                  style={{ background: '#1d4ed8', color: '#fff', border: 'none' }}
                >
                  Edit Budget
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <div
          className="mt-6 rounded-[24px] border p-5"
          style={{ background: tone.bg, borderColor: tone.border }}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: tone.accent }}>
                Workflow Context
              </p>
              <h3 className="m-0 mt-2 text-xl font-bold" style={{ color: tone.text }}>
                {status === 'SUBMITTED' && 'Budget locked and awaiting committee intake.'}
                {status === 'RETURNED' && 'Corrections are required before resubmission.'}
                {status === 'RECOMMENDED' && 'Committee recommendation is finalized for executive review.'}
                {status === 'APPROVED' && 'Final approval completed and locked for audit.'}
                {status === 'REJECTED' && 'This budget has been formally rejected.'}
                {status === 'COMMITTEE_REVIEW' && 'Committee members can revise and evaluate this submission.'}
                {status === 'DRAFT' && 'Continue preparing the draft before submission.'}
              </h3>
              <p className="m-0 mt-3 max-w-3xl text-sm leading-6" style={{ color: tone.text }}>
                {status === 'SUBMITTED' &&
                  'The submitted version is preserved while the committee prepares the next review action.'}
                {status === 'RETURNED' &&
                  'Use the reviewer note below to resolve issues, update affected lines, and then submit the corrected version again.'}
                {status === 'RECOMMENDED' &&
                  'Amounts are effectively locked while approvers review the recommendation, supporting files, and rationale.'}
                {status === 'APPROVED' &&
                  'No further changes can be made to this version. The approved figures are now part of the audit trail.'}
                {status === 'REJECTED' &&
                  'The record remains visible for audit purposes, but no workflow actions remain available on this budget.'}
                {status === 'COMMITTEE_REVIEW' &&
                  'Reviewers can adjust amounts inline, compare the submitted totals, and record a recommendation outcome.'}
                {status === 'DRAFT' &&
                  'Drafts remain fully editable. When ready, submit this version into the formal review process.'}
              </p>
            </div>
            <SummaryTile
              label="Total Portfolio Value"
              value={formatMoney(total)}
              caption={`Updated ${fmtDate(budget.updatedAt ?? budget.createdAt)}`}
              tone={
                status === 'APPROVED'
                  ? 'success'
                  : status === 'REJECTED'
                  ? 'danger'
                  : status === 'RECOMMENDED'
                  ? 'violet'
                  : 'highlight'
              }
            />
          </div>
        </div>
      </section>

      {/* ── Workflow tracker ──────────────────────────────────────────────── */}
      <Card
        className="rounded-2xl shadow-sm border-[#f0e6db]"
        bodyStyle={{ padding: '8px 16px 16px' }}
      >
        <p className="text-xs font-semibold text-[#9D4D01] uppercase tracking-wider mb-0 mt-2">
          Approval Workflow
        </p>
        <WorkflowStepper
          status={status}
          submittedAt={budget.submittedAt}
          submittedBy={budget.submittedBy?.name}
          approvedAt={budget.approvedAt}
          approvedBy={budget.approvedBy?.name}
        />

        {/* Return / rejection note */}
        {budget.workflowNote && ['RETURNED', 'REJECTED'].includes(status) && (
          <div
            className={`mt-2 p-3 rounded-lg text-sm border ${
              status === 'RETURNED'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="font-semibold">
              {status === 'RETURNED' ? 'Return reason: ' : 'Rejection reason: '}
            </span>
            {budget.workflowNote}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryTile
          label="Current Status"
          value={STATUS_LABEL[status]}
          caption={budget.submittedAt ? `Submitted ${fmtDate(budget.submittedAt)}` : 'Not yet submitted'}
          tone={
            status === 'APPROVED'
              ? 'success'
              : status === 'REJECTED'
              ? 'danger'
              : status === 'RETURNED'
              ? 'warning'
              : status === 'RECOMMENDED'
              ? 'violet'
              : status === 'COMMITTEE_REVIEW'
              ? 'info'
              : 'default'
          }
        />
        <SummaryTile
          label="Budget Lines"
          value={String(lineCount)}
          caption="Tracked individual funding requests"
          tone="default"
        />
        <SummaryTile
          label="Portfolio Total"
          value={formatMoney(liveEditedTotal)}
          caption={
            editMode
              ? `Staged variance ${amountVariance >= 0 ? '+' : ''}${formatMoney(amountVariance)}`
              : 'Live total of current line items'
          }
          tone={editMode ? 'info' : 'highlight'}
        />
      </div>

      {/* ── Committee Workspace (COMMITTEE_REVIEW status) ─────────────────── */}
      {status === 'COMMITTEE_REVIEW' && (
        <>
          {/* Stat cards */}
          <Row gutter={[12, 12]}>
            {[
              {
                title: 'Submitted Total',
                value: budget?.budgetItems?.reduce((s, i) => s + (i.amount ?? 0), 0) ?? 0,
                prefix: 'GHS',
                color: '#582f08',
                bg: '#fdf5ef',
                border: '#f0e6db',
                caption: 'Institutional base request',
              },
              {
                title: 'Committee Revision',
                value: liveEditedTotal,
                prefix: 'GHS',
                color: '#9D4D01',
                bg: '#fff4e8',
                border: '#fdd9b0',
                caption: 'Current working revision',
              },
              {
                title: 'Budget Lines',
                value: budget?.budgetItems?.length ?? 0,
                prefix: '',
                color: '#1d4ed8',
                bg: '#eff6ff',
                border: '#bfdbfe',
                caption: 'Tracked funding requests',
              },
              {
                title: 'Variance',
                value: amountVariance,
                prefix: 'GHS',
                color: amountVariance < 0 ? '#16a34a' : amountVariance > 0 ? '#dc2626' : '#582f08',
                bg: amountVariance < 0 ? '#f0fdf4' : amountVariance > 0 ? '#fff1f2' : '#fdf5ef',
                border: amountVariance < 0 ? '#bbf7d0' : amountVariance > 0 ? '#fecdd3' : '#f0e6db',
                caption: editMode ? 'Vs. submitted total' : 'No staged changes yet',
                signed: true,
              },
            ].map((card) => (
              <Col xs={24} sm={12} lg={6} key={card.title}>
                <div
                  className="rounded-xl p-4 border h-full"
                  style={{ background: card.bg, borderColor: card.border }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{ color: card.color }}>
                    {card.title}
                  </p>
                  {card.isText ? (
                    <p className="text-sm font-bold mt-1 m-0 leading-snug" style={{ color: card.color }}>
                      {card.value}
                    </p>
                  ) : (
                    <Statistic
                      value={card.value}
                      prefix={card.signed && card.value > 0 ? `+${card.prefix}` : card.prefix}
                      valueStyle={{ fontSize: 20, fontWeight: 700, color: card.color }}
                      formatter={
                        card.prefix === 'GHS'
                          ? (v) => Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2 })
                          : undefined
                      }
                    />
                  )}
                  {card.caption && (
                    <p className="m-0 mt-2 text-[10px] uppercase tracking-wider" style={{ color: card.color, opacity: 0.7 }}>
                      {card.caption}
                    </p>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Tabbed workspace */}
          <Card
            className="rounded-2xl shadow-sm border-[#f0e6db]"
            bodyStyle={{ padding: 0 }}
            title={
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#582f08] text-sm">Committee Workspace</span>
                {editMode && <Tag color="orange" className="m-0 font-semibold text-xs">Editing</Tag>}
              </div>
            }
            extra={
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#582f08]">
                  Total: {editMode
                    ? Object.values(editedAmounts).reduce((s, v) => s + (v ?? 0), 0).toLocaleString('en-GH', { minimumFractionDigits: 2, style: 'currency', currency: 'GHS' })
                    : budget?.budgetItems?.reduce((s, i) => s + (i.amount ?? 0), 0).toLocaleString('en-GH', { minimumFractionDigits: 2, style: 'currency', currency: 'GHS' })}
                </span>
                {canEditAmountsInline && (
                  editMode ? (
                    <div className="flex gap-2">
                      <Button size="small" onClick={cancelEditMode} disabled={savingAmounts}>Cancel</Button>
                      <Button size="small" loading={savingAmounts} onClick={() => saveAmounts()}
                        style={{ background: '#582f08', color: '#fff', border: 'none' }}>
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Tooltip title="Edit budget amounts inline">
                      <Button size="small" icon={<EditOutlined />} onClick={enterEditMode}
                        style={{ borderColor: '#9D4D01', color: '#9D4D01' }}>
                        Edit Amounts
                      </Button>
                    </Tooltip>
                  )
                )}
              </div>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="px-4 pt-0"
              size="small"
              items={[
                {
                  key: 'revision',
                  label: 'Committee Revision',
                  children: (
                    <Table
                      columns={[
                        { title: '#', key: 'idx', render: (_, __, i) => i + 1, width: 40, align: 'center' },
                        { title: 'Budget Line Item', dataIndex: 'item', key: 'item', render: (v) => capitalize(v) },
                        { title: 'Category', dataIndex: ['budgetCategory', 'name'], key: 'cat', render: (v) => v ?? '—' },
                        {
                          title: 'Submitted Amt', dataIndex: 'amount', key: 'orig', align: 'right',
                          render: (v) => <span className="text-gray-600">{formatMoney(v)}</span>,
                        },
                        {
                          title: 'Proposed Revision', key: 'revision', align: 'right',
                          render: (_, record) => {
                            if (!editMode) return <span className="font-semibold text-[#582f08]">{formatMoney(record.amount)}</span>;
                            return (
                              <InputNumber
                                min={0} size="small"
                                value={editedAmounts[record.id] ?? record.amount}
                                onChange={(v) => setEditedAmounts((p) => ({ ...p, [record.id]: v ?? 0 }))}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(v) => v.replace(/,/g, '')}
                                style={{ width: 130 }}
                              />
                            );
                          },
                        },
                        {
                          title: 'Variance', key: 'variance', align: 'right',
                          render: (_, record) => {
                            const revised = editMode ? (editedAmounts[record.id] ?? record.amount) : record.amount;
                            const diff = revised - record.amount;
                            if (diff === 0) return <span className="text-gray-400">—</span>;
                            return (
                              <span style={{ color: diff > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                                {diff > 0 ? '+' : ''}{formatMoney(diff)}
                              </span>
                            );
                          },
                        },
                        ...(canEditAmountsInline ? [{
                          title: '', key: 'action', width: 60, align: 'center',
                          render: (_, record) => (
                            <Button size="small" type="link" style={{ color: '#9D4D01' }}
                              onClick={() => {
                                setLineEditDrawer(record);
                                setLineEditAmount(record.amount);
                                setLineEditReason('');
                              }}>
                              Edit
                            </Button>
                          ),
                        }] : []),
                      ]}
                      dataSource={budget.budgetItems?.map((item, i) => ({ ...item, key: item.id }))}
                      pagination={false}
                      size="small"
                      summary={() => (
                        <Table.Summary.Row className="font-bold bg-[#fdf5ef]">
                          <Table.Summary.Cell colSpan={3}>
                            <span className="font-bold text-[#582f08]">Total</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="right">
                            <span className="text-gray-600">{formatMoney(budget?.budgetItems?.reduce((s, i) => s + (i.amount ?? 0), 0))}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="right">
                            <span className="font-bold text-[#582f08]">
                              {editMode
                                ? formatMoney(Object.values(editedAmounts).reduce((s, v) => s + (v ?? 0), 0))
                                : formatMoney(budget?.budgetItems?.reduce((s, i) => s + (i.amount ?? 0), 0))}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell />
                          {canEditAmountsInline && <Table.Summary.Cell />}
                        </Table.Summary.Row>
                      )}
                    />
                  ),
                },
                {
                  key: 'original',
                  label: 'Original Submission',
                  children: (
                    <Table
                      columns={[
                        { title: '#', key: 'idx', render: (_, __, i) => i + 1, width: 40, align: 'center' },
                        { title: 'Budget Line Item', dataIndex: 'item', key: 'item', render: (v) => capitalize(v) },
                        { title: 'Category', dataIndex: ['budgetCategory', 'name'], key: 'cat', render: (v) => v ?? '—' },
                        { title: 'Qty', dataIndex: 'quantity', key: 'qty', align: 'center', render: (v) => v ?? '—' },
                        { title: 'Original Amount', dataIndex: 'amount', key: 'amount', align: 'right', render: (v) => <span className="font-semibold">{formatMoney(v)}</span> },
                      ]}
                      dataSource={budget.budgetItems?.map((item) => ({ ...item, key: item.id }))}
                      pagination={false}
                      size="small"
                    />
                  ),
                },
                {
                  key: 'history',
                  label: 'History',
                  children: (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      Audit trail for this budget will appear here.
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Committee action bar */}
          <Card
            className="sticky bottom-4 z-20 rounded-2xl border-[#ead9cb] shadow-lg"
            bodyStyle={{ padding: '16px 24px' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#7a6859]">
                Workspace Status:{' '}
                <strong className="text-[#9D4D01]">Review in Progress</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {can('RETURN_BUDGET') && (
                  <Button icon={<RollbackOutlined />} onClick={() => setModal('return')}
                    style={{ borderColor: '#d97706', color: '#d97706' }} className="font-semibold">
                    Return for Correction
                  </Button>
                )}
                {can('REJECT_BUDGET') && (
                  <Button icon={<CloseOutlined />} danger onClick={() => setModal('reject')} className="font-semibold">
                    Reject Budget
                  </Button>
                )}
                {can('RECOMMEND_BUDGET') && (
                  <Button icon={<LikeOutlined />} onClick={() => setModal('recommend')}
                    style={{ background: '#582f08', color: '#fff', border: 'none' }} className="font-semibold">
                    Complete Committee Review
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Line item edit drawer */}
          <Drawer
            title={
              <span className="font-bold text-[#582f08]">
                Edit Line — {lineEditDrawer ? capitalize(lineEditDrawer.item) : ''}
              </span>
            }
            placement="right"
            width={400}
            open={!!lineEditDrawer}
            onClose={() => setLineEditDrawer(null)}
            footer={
              <div className="flex justify-end gap-2">
                <Button onClick={() => setLineEditDrawer(null)}>Cancel</Button>
                <Button
                  disabled={!lineEditReason.trim()}
                  onClick={() => {
                    if (lineEditDrawer) {
                      setEditedAmounts((p) => ({ ...p, [lineEditDrawer.id]: lineEditAmount }));
                      if (!editMode) setEditMode(true);
                      message.success('Amount staged. Click "Save Changes" to persist.');
                    }
                    setLineEditDrawer(null);
                  }}
                  style={{ background: '#582f08', color: '#fff', border: 'none' }}
                >
                  Stage Change
                </Button>
              </div>
            }
          >
            {lineEditDrawer && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Budget Category</label>
                  <p className="text-sm font-semibold text-[#582f08] mt-1">
                    {lineEditDrawer.budgetCategory?.name ?? '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Budget Line Item</label>
                  <p className="text-sm font-semibold mt-1">{capitalize(lineEditDrawer.item)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted Amount</label>
                  <p className="text-lg font-extrabold text-gray-700 mt-1">{formatMoney(lineEditDrawer.amount)}</p>
                </div>
                <Divider className="my-3" />
                <div>
                  <label className="text-xs font-bold text-[#9D4D01] uppercase tracking-widest block mb-1">
                    New Committee Amount <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    className="w-full"
                    value={lineEditAmount}
                    onChange={(v) => setLineEditAmount(v ?? 0)}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(v) => v.replace(/,/g, '')}
                    size="large"
                  />
                  {lineEditAmount !== null && lineEditAmount !== lineEditDrawer.amount && (
                    <p className="text-xs mt-1" style={{ color: lineEditAmount > lineEditDrawer.amount ? '#dc2626' : '#16a34a' }}>
                      Variance: {lineEditAmount > lineEditDrawer.amount ? '+' : ''}{formatMoney(lineEditAmount - lineEditDrawer.amount)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#9D4D01] uppercase tracking-widest block mb-1">
                    Reason for Change <span className="text-red-500">*</span>
                  </label>
                  <Input.TextArea
                    rows={4}
                    placeholder="Provide justification for this revision…"
                    value={lineEditReason}
                    onChange={(e) => setLineEditReason(e.target.value)}
                  />
                </div>
              </div>
            )}
          </Drawer>
        </>
      )}

      {/* ── Recommended / Final Decision view ─────────────────────────────── */}
      {status === 'RECOMMENDED' && (
        <>
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 border-[#9D4D01] bg-[#fdf1eb] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl text-[#9D4D01]">🔒</span>
              <div>
                <h3 className="m-0 text-lg font-bold text-[#582f08]">
                  Committee Recommendation Finalized
                </h3>
                <p className="m-0 mt-1 text-sm text-[#7a6859]">
                  Committee has recommended this budget for final approval. Financial figures are
                  locked while the executive decision is recorded.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#fd984e] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6d3300]">
              Locked
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { title: 'Original Submission', value: total, tone: 'default' },
                  { title: 'Recommendation', value: total, tone: 'violet' },
                  { title: 'Variance', value: 0, tone: 'success', prefix: '' },
                ].map((c) => (
                  <SummaryTile
                    key={c.title}
                    label={c.title}
                    value={`${c.prefix ?? ''}${formatMoney(c.value)}`}
                    caption={c.title === 'Variance' ? 'No change from recommended total' : undefined}
                    tone={c.tone}
                  />
                ))}
              </div>

              <Card
                className="overflow-hidden rounded-[24px] shadow-sm border-[#ead9cb]"
                bodyStyle={{ padding: 0 }}
              >
                <div className="flex items-center justify-between bg-[#582f08] px-5 py-3">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-[#fff4e8]">
                    Key Revisions Detail
                  </span>
                </div>
                <Table
                  columns={[
                    {
                      title: 'Budget Line Item',
                      dataIndex: 'item',
                      key: 'item',
                      render: (v) => <span className="font-semibold">{capitalize(v)}</span>,
                    },
                    {
                      title: 'Category',
                      dataIndex: ['budgetCategory', 'name'],
                      key: 'cat',
                      render: (v) => v ?? '—',
                    },
                    {
                      title: 'Recommended Amt',
                      dataIndex: 'amount',
                      key: 'amount',
                      align: 'right',
                      render: (v) => (
                        <span className="font-bold text-[#582f08]">{formatMoney(v)}</span>
                      ),
                    },
                  ]}
                  dataSource={budget.budgetItems?.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  size="small"
                  rowClassName={(_, index) =>
                    index % 2 === 0 ? 'bg-[#fdf5ef]' : 'bg-[#f7eee6]'
                  }
                  summary={() => (
                    <Table.Summary.Row className="font-bold bg-[#fdf5ef]">
                      <Table.Summary.Cell colSpan={2}>
                        <span className="font-bold text-[#582f08]">Recommended Total</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right">
                        <span className="font-bold text-[#9D4D01]">{formatMoney(total)}</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>
            </div>

            <div className="space-y-5 lg:col-span-4">
              {(can('APPROVE_BUDGET') || can('REJECT_BUDGET') || can('RETURN_BUDGET')) && (
                <Card
                  className="rounded-[24px] border-[#ead9cb] shadow-lg"
                  title={
                    <span className="text-base font-bold text-[#582f08]">Final Review</span>
                  }
                  bodyStyle={{ padding: '20px 24px' }}
                >
                  <p className="m-0 mb-4 text-sm text-[#7a6859]">
                    Review the committee notes and perform the final executive action.
                  </p>
                  <div className="mb-5 rounded-xl border-l-4 border-[#9D4D01] bg-[#fdf1eb] p-4 text-sm italic text-[#51443b]">
                    <p className="m-0 mb-2 text-xs font-bold not-italic uppercase tracking-[0.14em] text-[#9D4D01]">
                      Committee Recommendation
                    </p>
                    {budget.workflowNote
                      ? `"${budget.workflowNote}"`
                      : '"This budget has been reviewed and recommended by the committee. Please make your final decision below."'}
                  </div>

                  <div className="mb-5 space-y-2">
                    <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[#7a6859]">
                      Decision Checklist
                    </p>
                    <div className="rounded-xl border border-[#ead9cb] bg-[#fffaf7] px-3 py-2 text-sm text-[#582f08]">
                      Fiscal compliance check completed for recommended total.
                    </div>
                    <div className="rounded-xl border border-[#ead9cb] bg-[#fffaf7] px-3 py-2 text-sm text-[#582f08]">
                      Recommended total: <strong>{formatMoney(total)}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {can('APPROVE_BUDGET') && (
                      <Button
                        size="large"
                        icon={<CheckOutlined />}
                        onClick={() => setModal('approve')}
                        className="h-12 font-bold uppercase tracking-[0.12em]"
                        style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
                      >
                        Approve Budget
                      </Button>
                    )}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {can('RETURN_BUDGET') && (
                        <Button
                          icon={<RollbackOutlined />}
                          onClick={() => setModal('return')}
                          className="font-semibold"
                          style={{ borderColor: '#d97706', color: '#d97706' }}
                        >
                          Return to Committee
                        </Button>
                      )}
                      {can('REJECT_BUDGET') && (
                        <Button
                          icon={<CloseOutlined />}
                          danger
                          onClick={() => setModal('reject')}
                          className="font-semibold"
                        >
                          Reject Budget
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              <Card
                className="rounded-[24px] border-[#ead9cb]"
                title={
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#582f08]">
                    Authorization Trail
                  </span>
                }
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div className="space-y-4">
                  {[
                    budget.submittedAt && {
                      title: 'Submitted',
                      detail: `${fmtDate(budget.submittedAt)}${budget.submittedBy?.name ? ` · ${budget.submittedBy.name}` : ''}`,
                    },
                    {
                      title: 'Committee Recommended',
                      detail: budget.workflowNote
                        ? 'Recommendation note recorded'
                        : 'Awaiting final executive action',
                    },
                    budget.approvedAt && {
                      title: 'Approved',
                      detail: `${fmtDate(budget.approvedAt)}${budget.approvedBy?.name ? ` · ${budget.approvedBy.name}` : ''}`,
                    },
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <div key={item.title} className="border-b border-[#f0e6db] pb-3 last:border-0 last:pb-0">
                        <p className="m-0 text-sm font-bold text-[#582f08]">{item.title}</p>
                        <p className="m-0 mt-1 text-xs text-[#7a6859]">{item.detail}</p>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </div>

          {canEditAmountsInline && (
            <Card
              className="rounded-2xl shadow-sm border-[#ddd6fe]"
              title={<span className="font-bold text-[#7c3aed] text-sm">Committee Amount Adjustments</span>}
              bodyStyle={{ padding: '16px 24px' }}
              extra={
                editMode ? (
                  <div className="flex gap-2">
                    <Button size="small" onClick={cancelEditMode} disabled={savingAmounts}>Cancel</Button>
                    <Button size="small" loading={savingAmounts} onClick={() => saveAmounts()}
                      style={{ background: '#582f08', color: '#fff', border: 'none' }}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button size="small" icon={<EditOutlined />} onClick={enterEditMode}
                    style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
                    Adjust Amounts
                  </Button>
                )
              }
            >
              <Table
                columns={budgetItemCols}
                dataSource={budget.budgetItems?.map((item) => ({ ...item, key: item.id }))}
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary.Row className="font-bold bg-[#f5f3ff]">
                    <Table.Summary.Cell colSpan={2}><span className="font-bold text-[#7c3aed]">Total</span></Table.Summary.Cell>
                    <Table.Summary.Cell align="right"><span className="font-bold text-[#7c3aed]">{formatMoney(total)}</span></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>
          )}
        </>
      )}

      {status === 'RETURNED' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card
            className="rounded-2xl shadow-sm border-[#fde68a]"
            title={<span className="font-bold text-[#b45309] text-sm">Return Specification</span>}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div className="space-y-4">
              <div
                className="rounded-xl border p-4"
                style={{ background: '#fffbeb', borderColor: '#fde68a' }}
              >
                <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#b45309]">
                  Reviewer Note
                </p>
                <p className="m-0 mt-2 text-sm leading-6 text-[#7c3200]">
                  {budget.workflowNote || 'A correction request was issued. Review the affected lines and update the submission before sending it back.'}
                </p>
              </div>
              <Table
                columns={[
                  {
                    title: 'Affected Line',
                    dataIndex: 'item',
                    key: 'item',
                    render: (value) => <span className="font-semibold">{capitalize(value)}</span>,
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    align: 'right',
                    render: (value) => formatMoney(value),
                  },
                ]}
                dataSource={budget.budgetItems?.map((item) => ({ ...item, key: item.id }))}
                pagination={false}
                size="small"
              />
            </div>
          </Card>
          <Card
            className="rounded-2xl shadow-sm border-[#fde68a]"
            title={<span className="font-bold text-[#b45309] text-sm">Resolution Path</span>}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div className="space-y-3 text-sm text-[#7c3200]">
              <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4">
                Review the return note and update the impacted budget lines.
              </div>
              <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4">
                Save changes from the editor, then return here to resubmit for review.
              </div>
              <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4">
                Attach any supporting rationale expected by the reviewing committee.
              </div>
              {isEditableByRole && (
                <Button
                  block
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/update-budget-item/${id}`)}
                  style={{ background: '#d97706', color: '#fff', border: 'none' }}
                >
                  Create Corrected Version
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Default view for DRAFT / SUBMITTED / RETURNED / APPROVED / REJECTED ─ */}
      {!['COMMITTEE_REVIEW', 'RECOMMENDED'].includes(status) && (
        <>
          {status === 'DRAFT' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[24px] border border-[#ead9cb] bg-[#fdf1eb] p-6">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
                  Draft Workspace
                </p>
                <h3 className="m-0 mt-2 text-2xl font-extrabold text-[#582f08]">
                  Continue building this portfolio
                </h3>
                <p className="m-0 mt-3 max-w-2xl text-sm leading-6 text-[#7a6859]">
                  Use the draft editor to add line items, validate totals, and prepare the
                  submission package before sending it into committee review.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {isEditableByRole && (
                    <Button
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/update-budget-item/${id}`)}
                      style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
                    >
                      Open Draft Editor
                    </Button>
                  )}
                  {can('SUBMIT_BUDGET') && (
                    <Button size="large" icon={<SendOutlined />} onClick={() => setModal('submit')}>
                      Submit for Review
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SummaryTile label="Line Items" value={String(lineCount)} caption="Budget rows entered" />
                <SummaryTile
                  label="Total Requested"
                  value={formatMoney(total)}
                  caption="Current draft total"
                  tone="highlight"
                />
              </div>
            </div>
          )}

          {status === 'SUBMITTED' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-8">
                <LockBanner
                  title="Budget Locked"
                  description="This budget is locked and undergoing initial processing. Modifications are disabled until the current review cycle is completed or a revision is requested by the committee."
                />
                <div>
                  <h3 className="m-0 text-3xl font-extrabold tracking-tight text-[#582f08]">
                    {capitalize(budget.name)}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#7a6859]">
                    {budget.submittedBy && <span>Submitted by {budget.submittedBy.name}</span>}
                    {budget.submittedAt && <span>{fmtDate(budget.submittedAt)}</span>}
                    <span>Version {budget.version ?? '1.0'} (Latest)</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                <TotalAmountCard
                  label="Total Requested Amount"
                  amount={formatMoney(total)}
                  subtitle="Institutional gross allocation"
                  badge={{ label: 'Risk Profile', value: 'STABLE' }}
                />
              </div>
            </div>
          )}

          {status === 'SUBMITTED' && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <ReadOnlyPanel title="Strategic Rationale" icon={<span>📄</span>}>
                <div className="rounded-xl border border-[#ead9cb]/50 bg-[#fffaf7] p-4 italic text-sm text-[#7a6859]">
                  {budget.rationale ||
                    budget.workflowNote ||
                    'This submission reflects the department\'s operational priorities for the current financial year. Supporting rationale is preserved with the locked version.'}
                </div>
              </ReadOnlyPanel>
              <ReadOnlyPanel title="Supporting Documentation" icon={<span>📎</span>}>
                <div className="space-y-2">
                  {['Personnel breakdown', 'Facility audit summary', 'Committee briefing pack'].map(
                    (doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between rounded-lg border border-[#ead9cb] bg-white p-3 text-sm"
                      >
                        <span className="font-semibold text-[#582f08]">{doc}</span>
                        <span className="text-xs uppercase tracking-wider text-[#84746a]">Locked</span>
                      </div>
                    ),
                  )}
                </div>
              </ReadOnlyPanel>
            </div>
          )}

          {status === 'APPROVED' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 border-[#16a34a] bg-[#f0fdf4] p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[#16a34a]">✓</span>
                <div>
                  <h3 className="m-0 text-lg font-bold text-[#15803d]">Approved Budget Baseline</h3>
                  <p className="m-0 mt-1 text-sm text-[#4d7c57]">
                    Approved by{' '}
                    <strong>{budget.approvedBy?.name ?? 'authorized officer'}</strong>
                    {budget.approvedAt ? ` on ${fmtDate(budget.approvedAt)}` : ''}. This version is
                    sealed for audit and disbursement reference.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#16a34a] px-4 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Locked
              </span>
            </div>
          )}

          <div className={`grid grid-cols-1 gap-5 ${status === 'APPROVED' ? 'lg:grid-cols-12' : ''}`}>
            <div className={status === 'APPROVED' ? 'space-y-5 lg:col-span-8' : 'contents'}>
              {/* ── Budget metadata ─────────────────────────────────────────────── */}
              {status !== 'APPROVED' && status !== 'SUBMITTED' && (
                <Card
                  className="rounded-2xl shadow-sm border-[#f0e6db]"
                  title={<span className="font-bold text-[#582f08] text-sm">Budget Information</span>}
                  bodyStyle={{ padding: '0 24px 16px' }}
                >
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mt-4">
                    <Descriptions.Item label="Budget Name">
                      <span className="font-semibold">{capitalize(budget.name)}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Financial Year">{fmtYear(budget)}</Descriptions.Item>
                    <Descriptions.Item label="Department">
                      {budget.department?.departmentName ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Division">
                      {budget.department?.division?.divisionName ?? '—'}
                    </Descriptions.Item>
                    {budget.submittedAt && (
                      <Descriptions.Item label="Submitted On">{fmtDate(budget.submittedAt)}</Descriptions.Item>
                    )}
                    {budget.submittedBy && (
                      <Descriptions.Item label="Submitted By">{budget.submittedBy.name}</Descriptions.Item>
                    )}
                    {budget.approvedAt && (
                      <Descriptions.Item label="Approved On">{fmtDate(budget.approvedAt)}</Descriptions.Item>
                    )}
                    {budget.approvedBy && (
                      <Descriptions.Item label="Approved By">{budget.approvedBy.name}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Created">{fmtDate(budget.createdAt)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* ── Budget lines ──────────────────────────────────────────────── */}
              <Card
                className="overflow-hidden rounded-[24px] shadow-sm border-[#ead9cb]"
                bodyStyle={{ padding: 0 }}
                title={
                  status === 'APPROVED' || status === 'SUBMITTED' ? undefined : (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#582f08] text-sm">Budget Lines</span>
                      {editMode && <Tag color="orange" className="font-semibold text-xs m-0">Editing</Tag>}
                    </div>
                  )
                }
                extra={
                  status === 'APPROVED' || status === 'SUBMITTED' ? undefined : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#582f08]">Total: {formatMoney(total)}</span>
                      {canEditAmountsInline && (
                        editMode ? (
                          <div className="flex gap-2">
                            <Button size="small" onClick={cancelEditMode} disabled={savingAmounts}>Cancel</Button>
                            <Button size="small" loading={savingAmounts} onClick={() => saveAmounts()}
                              style={{ background: '#582f08', color: '#fff', border: 'none' }}>
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <Tooltip title="Edit budget amounts inline">
                            <Button size="small" icon={<EditOutlined />} onClick={enterEditMode}
                              style={{ borderColor: '#9D4D01', color: '#9D4D01' }}>
                              Edit Amounts
                            </Button>
                          </Tooltip>
                        )
                      )}
                    </div>
                  )
                }
              >
                {status === 'APPROVED' && (
                  <div className="flex items-center justify-between bg-[#582f08] px-5 py-3">
                    <h3 className="m-0 text-base font-bold text-[#fff4e8]">Budget Line Items</h3>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#ead9cb]">
                      Immutable baseline
                    </span>
                  </div>
                )}
                {status === 'SUBMITTED' && (
                  <div className="flex items-center justify-between bg-[#582f08] px-5 py-3">
                    <h3 className="m-0 text-base font-bold text-[#fff4e8]">Operational Budget Lines</h3>
                    <ExportReportButton />
                  </div>
                )}
                <Table
                  columns={
                    status === 'APPROVED'
                      ? [
                          {
                            title: '#',
                            key: 'idx',
                            width: 50,
                            align: 'center',
                            render: (_, __, i) => String(i + 1).padStart(2, '0'),
                          },
                          {
                            title: 'Category',
                            dataIndex: ['budgetCategory', 'name'],
                            key: 'cat',
                            render: (v) => v ?? '—',
                          },
                          {
                            title: 'Description',
                            dataIndex: 'item',
                            key: 'item',
                            render: (v) => <span className="font-semibold">{capitalize(v)}</span>,
                          },
                          {
                            title: 'Allocated',
                            dataIndex: 'amount',
                            key: 'amount',
                            align: 'right',
                            render: (v) => <span className="font-bold">{formatMoney(v)}</span>,
                          },
                          {
                            title: 'Status',
                            key: 'immutable',
                            align: 'center',
                            render: () => (
                              <span className="rounded border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-800">
                                Immutable
                              </span>
                            ),
                          },
                        ]
                      : budgetItemCols
                  }
                  dataSource={budget.budgetItems?.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  size="small"
                  rowClassName={
                    status === 'APPROVED'
                      ? (_, index) => (index % 2 === 0 ? 'bg-[#fdf5ef]' : 'bg-[#f7eee6]')
                      : undefined
                  }
                  className="rounded-b-2xl overflow-hidden"
                  summary={() => (
                    <Table.Summary.Row className="font-bold bg-[#fdf5ef]">
                      <Table.Summary.Cell colSpan={status === 'APPROVED' ? 3 : 2}>
                        <span className="font-bold text-[#582f08]">
                          {status === 'APPROVED' ? 'Total Approved Budget' : 'Total'}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right">
                        <span className="font-bold text-[#9D4D01]">{formatMoney(total)}</span>
                      </Table.Summary.Cell>
                      {status === 'APPROVED' && <Table.Summary.Cell />}
                    </Table.Summary.Row>
                  )}
                />
              </Card>

              {/* ── Workflow actions ────────────────────────────────────────── */}
              {!isLocked && status !== 'SUBMITTED' && status !== 'DRAFT' && (
                <Card
                  className="rounded-2xl shadow-sm border-[#f0e6db]"
                  title={<span className="font-bold text-[#582f08] text-sm">Workflow Actions</span>}
                  bodyStyle={{ padding: '16px 24px' }}
                >
                  <div className="flex flex-wrap gap-3">
                    {['DRAFT', 'RETURNED'].includes(status) && can('SUBMIT_BUDGET') && (
                      <Button icon={<SendOutlined />} onClick={() => setModal('submit')}
                        style={{ background: '#582f08', color: '#fff', border: 'none' }} className="font-semibold">
                        Submit for Review
                      </Button>
                    )}
                    {status === 'SUBMITTED' && can('START_COMMITTEE_REVIEW') && (
                      <Button icon={<PlayCircleOutlined />} onClick={() => setModal('start-review')}
                        style={{ background: '#9D4D01', color: '#fff', border: 'none' }} className="font-semibold">
                        Start Committee Review
                      </Button>
                    )}
                    {['SUBMITTED', 'COMMITTEE_REVIEW', 'RECOMMENDED'].includes(status) && can('REJECT_BUDGET') && (
                      <Button icon={<CloseOutlined />} danger onClick={() => setModal('reject')} className="font-semibold">
                        Reject Budget
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {status === 'APPROVED' && (
              <Card
                className="rounded-[24px] border-[#ead9cb] lg:col-span-4"
                title={
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#582f08]">
                    Audit History
                  </span>
                }
                bodyStyle={{ padding: '20px 24px' }}
              >
                <BudgetWorkflowTimeline events={buildBudgetAuditEvents(budget, fmtDate)} />
              </Card>
            )}
          </div>

          {status === 'SUBMITTED' && can('START_COMMITTEE_REVIEW') && (
            <StickyActionBar>
              <ExportReportButton />
              <Button
                icon={<PlayCircleOutlined />}
                size="large"
                onClick={() => setModal('start-review')}
                style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
                className="rounded-xl px-8 font-bold"
              >
                Start Committee Review
              </Button>
            </StickyActionBar>
          )}
        </>
      )}

      {/* ── Rejected locked notice ────────────────────────────────────────── */}
      {status === 'REJECTED' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          This budget has been rejected and is locked for audit purposes.
        </div>
      )}
      {/* ── Action Modals ─────────────────────────────────────────────────── */}
      <ActionModal
        open={modal === 'submit'}
        onCancel={() => setModal(null)}
        onConfirm={() => submitM.mutate()}
        title="Submit Budget for Review"
        requireNote={false}
        loading={submitM.isPending}
        confirmText="Confirm Submission"
      />
      <ActionModal
        open={modal === 'start-review'}
        onCancel={() => setModal(null)}
        onConfirm={() => reviewM.mutate()}
        title="Start Committee Review"
        requireNote={false}
        loading={reviewM.isPending}
        confirmText="Start Review"
      />
      <ActionModal
        open={modal === 'recommend'}
        onCancel={() => setModal(null)}
        onConfirm={(note) => recommendM.mutate(note)}
        title="Recommend Budget for Approval"
        requireNote={false}
        noteLabel="Optional recommendation note"
        loading={recommendM.isPending}
        confirmText="Recommend"
      />
      <ActionModal
        open={modal === 'approve'}
        onCancel={() => setModal(null)}
        onConfirm={(note) => approveM.mutate(note)}
        title="Confirm Final Approval"
        requireNote
        noteLabel="Approval reason"
        loading={approveM.isPending}
        confirmText="Finalize & Sign"
        description={`Are you sure you want to approve the recommended total of ${formatMoney(total)}? This action locks the budget for departmental allocation.`}
      />
      <ActionModal
        open={modal === 'reject'}
        onCancel={() => setModal(null)}
        onConfirm={(note) => rejectM.mutate(note)}
        title="Reject Budget"
        requireNote
        noteLabel="Rejection reason"
        loading={rejectM.isPending}
        confirmText="Reject"
        confirmDanger
      />
      <ActionModal
        open={modal === 'return'}
        onCancel={() => setModal(null)}
        onConfirm={(note) => returnM.mutate(note)}
        title="Return for Correction"
        requireNote
        noteLabel="Return reason"
        loading={returnM.isPending}
        confirmText="Return for Correction"
      />
    </div>
  );
};

export default BudgetDetail;
