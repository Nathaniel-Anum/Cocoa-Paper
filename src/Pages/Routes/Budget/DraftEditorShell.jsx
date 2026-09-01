import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import WorkflowStepper from './WorkflowStepper';
import BudgetFormShell from './BudgetFormShell';
import { SummaryTile, StickyActionBar } from './BudgetDesignShared';
import { formatMoney } from '../../../../utils/typography';

const DRAFT_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'lines', label: 'Budget Lines' },
  { key: 'validation', label: 'Validation' },
];

function fmtShortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DraftEditorShell = ({
  budget,
  form,
  mode,
  isGlobal,
  divisions,
  departments,
  financialYears,
  selectedDivision,
  onDivisionChange,
  onFinish,
  onCancel,
  isPending,
  managerName,
  onSubmitForReview,
  canSubmit,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lines');
  const status = budget?.status ?? 'DRAFT';
  const isReturned = status === 'RETURNED';

  const lineItems = Form.useWatch('budgetItems', form) ?? [];
  const totalRequested = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0),
    [lineItems],
  );

  const validationItems = useMemo(() => {
    const missingNames = lineItems.filter((item) => !item?.item?.trim?.()).length;
    const missingAmounts = lineItems.filter((item) => !item?.amount && item?.amount !== 0).length;
    const hasTitle = !!form.getFieldValue('name');

    return [
      {
        ok: lineItems.length > 0,
        title: 'At least one budget line',
        detail: lineItems.length ? `${lineItems.length} lines entered` : 'Add budget lines to continue',
      },
      {
        ok: missingNames === 0 && missingAmounts === 0,
        title: 'Line item completeness',
        detail:
          missingNames || missingAmounts
            ? `${missingNames + missingAmounts} line(s) need attention`
            : 'All lines have names and amounts',
      },
      {
        ok: hasTitle,
        title: 'Budget title provided',
        detail: hasTitle ? 'Portfolio title is set' : 'Add a budget title in Overview',
      },
      {
        ok: totalRequested > 0,
        title: 'Total within allocation',
        detail: totalRequested > 0 ? `Total requested: ${formatMoney(totalRequested)}` : 'Enter line amounts',
      },
    ];
  }, [lineItems, totalRequested, form]);

  const validationErrors = validationItems.filter((item) => !item.ok).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-24">
      <section className="rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)] md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onCancel}
              size="small"
              className="mb-4 border-[#ead9cb] text-[#7a6859]"
            >
              Back to budget
            </Button>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#fd984e]/30 bg-[#fd984e]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6d3300]">
                {isReturned ? 'Corrections Required' : 'Work in Progress'}
              </span>
              {budget?.id && (
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7a6859]">
                  ID: {String(budget.id).slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="m-0 text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">
              {isReturned ? 'Corrected Draft' : 'Draft'}: {form.getFieldValue('name') || budget?.name || 'Budget Portfolio'}
            </h1>
          </div>
          <div className="rounded-xl border border-[#ead9cb] bg-[#fdf1eb] p-4">
            <WorkflowStepper status={status} compact />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryTile
            label="Total Requested"
            value={formatMoney(totalRequested)}
            caption={`${lineItems.length} budget line${lineItems.length === 1 ? '' : 's'}`}
            tone="highlight"
          />
          <SummaryTile
            label="Last Saved"
            value={fmtShortDate(budget?.updatedAt)}
            caption={managerName ? `By ${managerName}` : 'Autosave on submit'}
          />
          <SummaryTile
            label="Line Items"
            value={`${lineItems.length} Rows`}
            caption={
              validationErrors
                ? `${validationErrors} validation check${validationErrors === 1 ? '' : 's'} pending`
                : 'All checks passing'
            }
            tone={validationErrors ? 'warning' : 'success'}
          />
          <SummaryTile
            label="Workflow Stage"
            value={isReturned ? 'Returned' : 'Draft'}
            caption={isReturned ? 'Update lines then resubmit' : 'Ready for internal review'}
            tone={isReturned ? 'warning' : 'default'}
          />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={DRAFT_TABS.map((tab) => ({
                key: tab.key,
                label:
                  tab.key === 'validation' ? (
                    <span className="flex items-center gap-2">
                      Validation
                      {validationErrors > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white">
                          {validationErrors}
                        </span>
                      )}
                    </span>
                  ) : (
                    tab.label
                  ),
              }))}
              className="draft-editor-tabs mb-4"
            />

            {activeTab === 'overview' && (
              <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                <h2 className="m-0 text-lg font-bold text-[#582f08]">Portfolio Overview</h2>
                <p className="mt-1 text-sm text-[#7a6859]">
                  Set the accountable division, department, and portfolio title before editing lines.
                </p>
                <BudgetFormShell
                  embedded
                  compact
                  hideFooter
                  sections="details"
                  mode={mode}
                  form={form}
                  isGlobal={isGlobal}
                  divisions={divisions}
                  departments={departments}
                  financialYears={financialYears}
                  selectedDivision={selectedDivision}
                  onDivisionChange={onDivisionChange}
                  onFinish={onFinish}
                  onCancel={onCancel}
                  isPending={isPending}
                  managerName={managerName}
                />
                <div className="mt-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7a6859]">
                    Budget Rationale / Justification
                  </label>
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter administrative notes or strategic alignment details..."
                    className="rounded-xl border-[#d6c3b7] bg-[#fff8f5]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'lines' && (
              <div className="rounded-[24px] border border-[#ead9cb] bg-white p-2 shadow-sm md:p-4">
                <BudgetFormShell
                  embedded
                  compact
                  hideFooter
                  sections="lines"
                  mode={mode}
                  form={form}
                  isGlobal={isGlobal}
                  divisions={divisions}
                  departments={departments}
                  financialYears={financialYears}
                  selectedDivision={selectedDivision}
                  onDivisionChange={onDivisionChange}
                  onFinish={onFinish}
                  onCancel={onCancel}
                  isPending={isPending}
                  managerName={managerName}
                />
              </div>
            )}

            {activeTab === 'validation' && (
              <div className="space-y-3 rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                {validationItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl bg-[#fdf1eb] p-4"
                  >
                    {item.ok ? (
                      <CheckCircleOutlined className="mt-0.5 text-lg text-[#16a34a]" />
                    ) : (
                      <ExclamationCircleOutlined className="mt-0.5 text-lg text-[#d97706]" />
                    )}
                    <div>
                      <p className="m-0 text-sm font-bold text-[#582f08]">{item.title}</p>
                      <p className="m-0 mt-1 text-xs text-[#7a6859]">{item.detail}</p>
                    </div>
                  </div>
                ))}
                {budget?.workflowNote && isReturned && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4">
                    <WarningOutlined className="mt-0.5 text-lg text-[#b45309]" />
                    <div>
                      <p className="m-0 text-sm font-bold text-[#b45309]">Return note from reviewer</p>
                      <p className="m-0 mt-1 text-sm leading-6 text-[#7c3200]">{budget.workflowNote}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
            <div className="overflow-hidden rounded-2xl border border-[#ead9cb] bg-white shadow-sm">
              <div className="bg-[#582f08] p-4">
                <h4 className="m-0 flex items-center gap-2 text-lg font-bold text-white">
                  <CheckCircleOutlined />
                  Validation Checklist
                </h4>
              </div>
              <div className="space-y-3 p-4">
                {validationItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl bg-[#fdf1eb] p-3">
                    {item.ok ? (
                      <CheckCircleOutlined className="text-[#16a34a]" />
                    ) : (
                      <ExclamationCircleOutlined className="text-[#d97706]" />
                    )}
                    <div>
                      <p className="m-0 text-xs font-bold text-[#582f08]">{item.title}</p>
                      <p className="m-0 mt-0.5 text-[11px] text-[#7a6859]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isReturned && budget?.workflowNote && (
              <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#b45309]">
                  Resolution Required
                </p>
                <p className="m-0 mt-2 text-sm leading-6 text-[#7c3200]">{budget.workflowNote}</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <StickyActionBar>
        <Button onClick={onCancel} className="rounded-xl border-[#d6c3b7]">
          Cancel
        </Button>
        <Button
          icon={<SaveOutlined />}
          loading={isPending}
          onClick={() => form.submit()}
          className="rounded-xl px-6 font-bold"
          style={{ background: '#582f08', color: '#fff', border: 'none' }}
        >
          Save Draft
        </Button>
        {canSubmit && onSubmitForReview && (
          <Button
            icon={<SendOutlined />}
            onClick={onSubmitForReview}
            className="rounded-xl px-6 font-bold"
            style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
          >
            Submit for Review
          </Button>
        )}
        <Button
          type="link"
          onClick={() => navigate(budget?.id ? `/budget/${budget.id}` : '/budget')}
          className="text-[#7a6859]"
        >
          View detail page
        </Button>
      </StickyActionBar>
    </div>
  );
};

export default DraftEditorShell;
