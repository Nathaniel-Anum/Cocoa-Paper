import React, { useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Tooltip, Upload, message } from 'antd';
import {
  CheckOutlined,
  FileTextOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../../../utils/typography';
import BudgetUploadPanel from './BudgetUploadPanel';

const ENTRY_METHODS = [
  {
    key: 'manual',
    title: 'Create Manually',
    description: 'Build the budget from scratch by adding individual line items step by step.',
  },
  {
    key: 'upload',
    title: 'Upload Sheet',
    description: 'Import line items from the approved Excel template in one step.',
  },
];

const STEP_LABELS = ['Budget Details', 'Budget Lines', 'Supporting Docs', 'Review and Submit'];

const shellInputClass =
  'rounded-xl border-[#d6c3b7] bg-[#fff8f5] text-[#201b17] hover:border-[#9D4D01] focus:border-[#9D4D01]';

const stepCircleClass = (state) => {
  if (state === 'active') return 'border-[#9D4D01] bg-[#9D4D01] text-white shadow-sm';
  if (state === 'done') return 'border-[#582f08] bg-[#582f08] text-white';
  return 'border-[#d6c3b7] bg-[#f1e6e0] text-[#84746a]';
};

function DetailsFields({
  isGlobal,
  divisions,
  departments,
  financialYears,
  selectedDivision,
  onDivisionChange,
  managerName,
}) {
  return (
    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#582f08]">Budget Details</h2>
        <p className="text-sm text-[#7a6859]">
          Set the accountable division, department, and portfolio title before adding line items.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isGlobal && (
          <>
            <Form.Item
              name="divisionId"
              label={<span className="text-sm font-semibold text-[#582f08]">Division</span>}
              rules={[{ required: true, message: 'Choose a division.' }]}
            >
              <Select
                size="large"
                className="budget-shell-select"
                placeholder="Select a division"
                options={(divisions ?? []).map((division) => ({
                  label: division?.divisionName,
                  value: division?.divisionId,
                }))}
                onChange={onDivisionChange}
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label={<span className="text-sm font-semibold text-[#582f08]">Department</span>}
              rules={[{ required: true, message: 'Choose a department.' }]}
            >
              <Select
                size="large"
                className="budget-shell-select"
                placeholder={selectedDivision ? 'Select a department' : 'Select a division first'}
                disabled={!selectedDivision}
                options={(departments ?? []).map((department) => ({
                  label: department?.departmentName,
                  value: department?.departmentId,
                }))}
                allowClear
              />
            </Form.Item>
          </>
        )}

        {!!financialYears?.length && (
          <Form.Item
            name="financialYearId"
            label={<span className="text-sm font-semibold text-[#582f08]">Financial Year</span>}
          >
            <Select
              size="large"
              className="budget-shell-select"
              placeholder="Reference financial year"
              options={financialYears.map((year) => ({
                label: `FY ${new Date(year.startDate).getFullYear()}-${String(
                  new Date(year.endDate).getFullYear(),
                ).slice(-2)}`,
                value: year.id,
              }))}
              allowClear
            />
          </Form.Item>
        )}

        <Form.Item
          className={financialYears?.length ? '' : 'md:col-span-2'}
          label={<span className="text-sm font-semibold text-[#582f08]">Budget Manager</span>}
        >
          <Input
            value={managerName || 'Current user'}
            disabled
            size="large"
            className={shellInputClass}
          />
        </Form.Item>

        <Form.Item
          className="md:col-span-2"
          name="name"
          label={<span className="text-sm font-semibold text-[#582f08]">Budget Title</span>}
          rules={[{ required: true, message: 'Budget title is required.' }]}
        >
          <Input
            size="large"
            className={shellInputClass}
            placeholder="e.g. FY 2024 Infrastructure Modernization"
          />
        </Form.Item>
      </div>
    </div>
  );
}

function LinesFields({ form }) {
  return (
    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#582f08]">Budget Lines</h2>
          <p className="text-sm text-[#7a6859]">
            Add each requested item with quantity and total amount.
          </p>
        </div>
        <Form.Item noStyle shouldUpdate>
          {() => {
            const lines = form.getFieldValue('budgetItems') ?? [];
            return (
              <span className="rounded-full bg-[#fdf1eb] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9D4D01]">
                {lines.length} line{lines.length === 1 ? '' : 's'}
              </span>
            );
          }}
        </Form.Item>
      </div>

      <Form.List name="budgetItems">
        {(fields, { add, remove }) => (
          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d6c3b7] bg-[#fff8f5] px-5 py-8 text-center text-sm text-[#7a6859]">
                No line items yet. Start by adding the first budget line.
              </div>
            )}

            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} className="rounded-2xl border border-[#ead9cb] bg-[#fffaf7] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9D4D01]">
                      Line {index + 1}
                    </p>
                    <p className="text-sm text-[#7a6859]">
                      Provide a clear line-item name and funding amount.
                    </p>
                  </div>
                  <Button
                    danger
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr]">
                  <Form.Item
                    {...restField}
                    name={[name, 'item']}
                    label={
                      <span className="text-sm font-semibold text-[#582f08]">Budget Line Item</span>
                    }
                    rules={[{ required: true, message: 'Item name is required.' }]}
                  >
                    <Input
                      size="large"
                      className={shellInputClass}
                      placeholder="e.g. Server Infrastructure Upgrade"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    label={<span className="text-sm font-semibold text-[#582f08]">Quantity</span>}
                  >
                    <InputNumber
                      min={0}
                      size="large"
                      className={`w-full ${shellInputClass}`}
                      placeholder="0"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    label={<span className="text-sm font-semibold text-[#582f08]">Amount (GHS)</span>}
                    rules={[{ required: true, message: 'Amount is required.' }]}
                  >
                    <InputNumber
                      min={0}
                      size="large"
                      className={`w-full ${shellInputClass}`}
                      placeholder="0.00"
                      formatter={(value) =>
                        `GHS ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value?.replace(/GHS\s?|(,*)/g, '') || ''}
                    />
                  </Form.Item>
                </div>
              </div>
            ))}

            <Tooltip title="Add budget line">
              <Button
                type="dashed"
                icon={<PlusCircleOutlined />}
                onClick={() => add({ quantity: 1 })}
                className="h-12 w-full rounded-2xl border-[#9D4D01] text-[#9D4D01]"
              >
                Add Budget Line
              </Button>
            </Tooltip>
          </div>
        )}
      </Form.List>
    </div>
  );
}

const BudgetFormShell = ({
  mode,
  form,
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
  contextDivision,
  contextDepartment,
  embedded = false,
  hideFooter = false,
  compact = false,
  sections = 'all',
}) => {
  const navigate = useNavigate();
  const isCreateWizard = mode === 'create' && !embedded;
  const [currentStep, setCurrentStep] = useState(0);
  const [entryMethod, setEntryMethod] = useState('manual');
  const [supportingDocs, setSupportingDocs] = useState([]);

  // Prefer live watch; fall back to preserved store values (including unmounted fields).
  const watchedValues = Form.useWatch([], form) ?? {};
  const storedValues = form.getFieldsValue(true) ?? {};
  const reviewValues = {
    ...storedValues,
    ...watchedValues,
    budgetItems: watchedValues.budgetItems ?? storedValues.budgetItems ?? [],
  };
  const lineItems = Array.isArray(reviewValues.budgetItems)
    ? reviewValues.budgetItems.filter(Boolean)
    : [];
  const total = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0),
    [lineItems],
  );

  const title = mode === 'edit' ? 'Revise Budget Portfolio' : 'Initialize New Budget';
  const subtitle =
    mode === 'edit'
      ? 'Update the allocation structure and prepare a corrected or revised submission.'
      : 'Define the budget scope and build institutional allocation lines for this cycle.';

  const fyLabel = useMemo(() => {
    const id = reviewValues.financialYearId;
    const year = (financialYears ?? []).find((y) => y.id === id);
    if (!year) return '—';
    return `FY ${new Date(year.startDate).getFullYear()}-${String(
      new Date(year.endDate).getFullYear(),
    ).slice(-2)}`;
  }, [reviewValues.financialYearId, financialYears]);

  const divisionLabel =
    (divisions ?? []).find((d) => d.divisionId === reviewValues.divisionId)?.divisionName ||
    (!isGlobal ? contextDivision : null) ||
    '—';
  const departmentLabel =
    (departments ?? []).find((d) => d.departmentId === reviewValues.departmentId)?.departmentName ||
    (!isGlobal ? contextDepartment : null) ||
    '—';

  const goNext = async () => {
    try {
      if (currentStep === 0) {
        const fields = isGlobal
          ? ['name', 'divisionId', 'departmentId']
          : ['name'];
        await form.validateFields(fields);
      } else if (currentStep === 1) {
        const items = form.getFieldValue('budgetItems') ?? [];
        if (!items.length) {
          message.warning('Add at least one budget line before continuing.');
          return;
        }
        const itemFields = items.flatMap((_, index) => [
          ['budgetItems', index, 'item'],
          ['budgetItems', index, 'amount'],
        ]);
        await form.validateFields(itemFields);
      }
      setCurrentStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    } catch {
      // validation errors shown by Form
    }
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const renderStepper = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-[720px] items-center justify-between gap-4">
        {STEP_LABELS.map((label, index) => {
          const state =
            index === currentStep ? 'active' : index < currentStep ? 'done' : 'pending';
          return (
            <React.Fragment key={label}>
              <button
                type="button"
                onClick={() => {
                  if (index < currentStep) setCurrentStep(index);
                }}
                className="relative z-10 flex flex-col items-center gap-2 text-center"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition-all ${stepCircleClass(
                    state,
                  )}`}
                >
                  {state === 'done' ? <CheckOutlined /> : index + 1}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                    state === 'active'
                      ? 'text-[#9D4D01]'
                      : state === 'done'
                      ? 'text-[#582f08]'
                      : 'text-[#84746a]'
                  }`}
                >
                  {label}
                </span>
              </button>
              {index < STEP_LABELS.length - 1 && (
                <div
                  className={`h-[2px] flex-1 ${
                    index < currentStep ? 'bg-[#582f08]' : 'bg-[#ead9cb]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const entryMethodPanel = (
    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
        Entry Method
      </p>
      <div className="space-y-3">
        {ENTRY_METHODS.map((option) => {
          const active = entryMethod === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setEntryMethod(option.key);
                if (option.key === 'manual') setCurrentStep(0);
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-[#9D4D01] bg-[#ffdcc7]/40 shadow-sm'
                  : 'border-[#ead9cb] bg-[#fffaf7] hover:border-[#9D4D01]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-[#582f08]">{option.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#7a6859]">{option.description}</p>
                </div>
                <span
                  className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                    active ? 'border-[#9D4D01] bg-[#9D4D01] text-white' : 'border-[#d6c3b7]'
                  }`}
                >
                  {active && <CheckOutlined className="text-[10px]" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Embedded / edit modes keep section-based rendering ───────────────────
  if (!isCreateWizard) {
    const formBody = (
      <>
        {!embedded && (
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
              Budget Workspace
            </p>
            <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-[#6b5b4d]">{subtitle}</p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <div className="grid grid-cols-12 gap-6">
            <div className={`col-span-12 space-y-6 ${compact ? '' : 'lg:col-span-8'}`}>
              {(sections === 'all' || sections === 'details') && (
                <DetailsFields
                  isGlobal={isGlobal}
                  divisions={divisions}
                  departments={departments}
                  financialYears={financialYears}
                  selectedDivision={selectedDivision}
                  onDivisionChange={onDivisionChange}
                  managerName={managerName}
                />
              )}
              {(sections === 'all' || sections === 'lines') && <LinesFields form={form} />}
            </div>
          </div>

          {!hideFooter && (
            <div className="mt-8 flex flex-col gap-3 rounded-[24px] border border-[#ead9cb] bg-[#fdf1eb] p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[#7a6859]">
                Update the line items and save the revised budget version.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="large" onClick={onCancel} className="rounded-xl border-[#d6c3b7]">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isPending}
                  className="rounded-xl px-6 font-bold"
                  style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
                >
                  Save Budget Changes
                </Button>
              </div>
            </div>
          )}
        </Form>
      </>
    );

    if (embedded) return formBody;
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        <section className="rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)] md:p-8">
          {formBody}
        </section>
      </div>
    );
  }

  // ── Create wizard ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <section className="rounded-[28px] border border-[#ead9cb] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(88,47,8,0.07)] md:p-8">
        {entryMethod === 'manual' && renderStepper()}

        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
            Budget Workspace
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#582f08]">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-[#6b5b4d]">{subtitle}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {entryMethod === 'upload' ? (
              <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#582f08]">Upload Budget Sheet</h2>
                  <p className="text-sm text-[#7a6859]">
                    Import multiple budget lines from the Excel template. Same workflow as the
                    workspace upload action.
                  </p>
                </div>
                <BudgetUploadPanel
                  showCancel
                  onCancel={onCancel}
                  onSuccess={() => navigate('/budget')}
                />
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                requiredMark={false}
                preserve
              >
                {/* Keep prior steps mounted (hidden) so Ant Design retains field values for review/submit. */}
                <div className={currentStep === 0 ? undefined : 'hidden'} aria-hidden={currentStep !== 0}>
                  <DetailsFields
                    isGlobal={isGlobal}
                    divisions={divisions}
                    departments={departments}
                    financialYears={financialYears}
                    selectedDivision={selectedDivision}
                    onDivisionChange={onDivisionChange}
                    managerName={managerName}
                  />
                </div>

                <div className={currentStep === 1 ? undefined : 'hidden'} aria-hidden={currentStep !== 1}>
                  <LinesFields form={form} />
                </div>

                <div className={currentStep === 2 ? undefined : 'hidden'} aria-hidden={currentStep !== 2}>
                  <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h2 className="text-lg font-bold text-[#582f08]">Supporting Documents</h2>
                      <p className="text-sm text-[#7a6859]">
                        Optional — attach PDFs or spreadsheets that support this budget request.
                      </p>
                    </div>
                    <Upload
                      multiple
                      beforeUpload={(file) => {
                        setSupportingDocs((prev) => [...prev, file]);
                        return false;
                      }}
                      onRemove={(file) => {
                        setSupportingDocs((prev) => prev.filter((f) => f.uid !== file.uid));
                      }}
                      fileList={supportingDocs}
                      accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        className="rounded-xl"
                        style={{ borderStyle: 'dashed', borderColor: '#9D4D01', color: '#9D4D01' }}
                      >
                        Add supporting files
                      </Button>
                    </Upload>
                    {!supportingDocs.length && (
                      <div className="mt-4 rounded-2xl border border-dashed border-[#d6c3b7] bg-[#fff8f5] px-5 py-6 text-center text-sm text-[#7a6859]">
                        No supporting documents attached. You can skip this step.
                      </div>
                    )}
                  </div>
                </div>

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#ead9cb] bg-[#fff4e8] px-5 py-4">
                      <p className="m-0 text-sm font-semibold text-[#7c3200]">
                        Review only — details below cannot be edited on this step. Use{' '}
                        <span className="font-bold">Back</span> (or click an earlier stepper step) to
                        make changes, then return here to submit.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                      <div className="mb-4">
                        <h2 className="m-0 text-lg font-bold text-[#582f08]">Budget Details</h2>
                        <p className="m-0 mt-1 text-sm text-[#7a6859]">
                          Title, accountability, and financial year
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[
                          { label: 'Budget Title', value: reviewValues.name || '—' },
                          { label: 'Budget Manager', value: managerName || 'Current user' },
                          { label: 'Division', value: divisionLabel },
                          { label: 'Department', value: departmentLabel },
                          { label: 'Financial Year', value: fyLabel },
                          { label: 'Total Requested', value: formatMoney(total) },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="rounded-2xl border border-[#ead9cb] bg-[#fffaf7] p-4"
                          >
                            <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#84746a]">
                              {row.label}
                            </p>
                            <p className="m-0 mt-1 break-words text-sm font-bold text-[#582f08]">
                              {row.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-[#ead9cb] bg-white shadow-sm">
                      <div className="border-b border-[#ead9cb] bg-[#582f08] px-5 py-3">
                        <h3 className="m-0 text-base font-bold text-[#fff4e8]">Budget Lines</h3>
                        <p className="m-0 mt-0.5 text-xs uppercase tracking-wider text-[#ead9cb]">
                          {lineItems.length} line{lineItems.length === 1 ? '' : 's'} ·{' '}
                          {formatMoney(total)}
                        </p>
                      </div>
                      <div className="divide-y divide-[#ead9cb]">
                        {lineItems.length === 0 && (
                          <p className="p-5 text-sm text-[#7a6859]">No budget lines entered.</p>
                        )}
                        {lineItems.map((item, index) => (
                          <div
                            key={`${item?.item ?? 'line'}-${index}`}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#9D4D01]">
                                Line {index + 1}
                              </p>
                              <p className="m-0 mt-1 break-words text-sm font-semibold text-[#582f08]">
                                {item?.item || 'Untitled item'}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="m-0 text-[#7a6859]">Qty {item?.quantity ?? 1}</p>
                              <p className="m-0 font-bold text-[#582f08]">
                                {formatMoney(item?.amount ?? 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t-2 border-[#582f08] bg-[#fdf1eb] px-5 py-4">
                        <span className="font-bold text-[#582f08]">Total</span>
                        <span className="text-lg font-extrabold text-[#9D4D01]">
                          {formatMoney(total)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
                      <h3 className="m-0 mb-3 flex items-center gap-2 text-base font-bold text-[#582f08]">
                        <FileTextOutlined className="text-[#9D4D01]" />
                        Supporting Documents
                      </h3>
                      {supportingDocs.length === 0 ? (
                        <p className="m-0 text-sm text-[#7a6859]">None attached (optional).</p>
                      ) : (
                        <ul className="m-0 list-none space-y-2 p-0">
                          {supportingDocs.map((file) => (
                            <li
                              key={file.uid}
                              className="rounded-xl border border-[#ead9cb] bg-[#fffaf7] px-4 py-2 text-sm font-semibold text-[#582f08]"
                            >
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 rounded-[24px] border border-[#ead9cb] bg-[#fdf1eb] p-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-[#7a6859]">
                    {currentStep === 0 && 'Step 1 of 4 — Enter budget details to continue.'}
                    {currentStep === 1 && 'Step 2 of 4 — Add the line items that make up this budget.'}
                    {currentStep === 2 && 'Step 3 of 4 — Supporting documents are optional.'}
                    {currentStep === 3 &&
                      'Step 4 of 4 — Read-only review. Go Back to edit, then Submit Budget.'}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="large" onClick={onCancel} className="rounded-xl border-[#d6c3b7]">
                      Cancel
                    </Button>
                    {currentStep > 0 && (
                      <Button size="large" onClick={goBack} className="rounded-xl border-[#d6c3b7]">
                        Back
                      </Button>
                    )}
                    {currentStep < STEP_LABELS.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={goNext}
                        className="rounded-xl px-6 font-bold"
                        style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
                      >
                        {currentStep === 2 ? 'Skip / Continue' : 'Next'}
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isPending}
                        className="rounded-xl px-6 font-bold"
                        style={{ background: '#582f08', borderColor: '#582f08' }}
                      >
                        Submit Budget
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4">
            {entryMethodPanel}

            <div className="rounded-[24px] bg-[#582f08] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffdcc7]">
                Workflow Note
              </p>
              <h3 className="mt-3 text-xl font-bold">
                {entryMethod === 'upload'
                  ? 'Import creates draft portfolios.'
                  : 'Drafts remain editable.'}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#f6e7d8]">
                {entryMethod === 'upload'
                  ? 'Uploaded sheets are imported and appear on the All Budgets list for review and submission.'
                  : 'Review all details on the final step, then submit. Use Back to change earlier steps before submitting.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BudgetFormShell;
