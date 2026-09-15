import React, { useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Upload, message } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CheckOutlined,
  FileTextOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../../../utils/typography';
import BudgetUploadPanel from './BudgetUploadPanel';
import { flattenCategoriesToItems } from './budgetLineCategories';

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

const STEP_LABELS = ['Budget Details', 'Budget Lines', 'Supporting Docs', 'Review and Create'];

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
  const [collapsedCategories, setCollapsedCategories] = useState(() => new Set());
  const [collapsedItems, setCollapsedItems] = useState(() => new Set());

  const toggleSet = (setter, id) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-[24px] border border-[#ead9cb] bg-white p-6 shadow-sm">
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-[#582f08]">Budget Lines</h2>
        <p className="text-sm text-[#7a6859]">
          Enter a category, then add one or more budget items with quantity and amount under it.
        </p>
        <Form.Item noStyle shouldUpdate>
          {() => {
            const lines = flattenCategoriesToItems(form.getFieldValue('categories') ?? []);
            const total = lines.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
            return (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-[#ead9cb] bg-[#fff8f5] px-6 py-4">
                <p className="m-0 text-4xl font-extrabold leading-none text-[#582f08]">{lines.length}</p>
                <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
                  item{lines.length === 1 ? '' : 's'}
                </p>
                <p className="m-0 mt-1 text-sm font-semibold text-[#7a6859]">{formatMoney(total)}</p>
              </div>
            );
          }}
        </Form.Item>
      </div>

      <Form.List name="categories" initialValue={[{ name: '', items: [{ quantity: 1 }] }]}>
        {(categoryFields, { add: addCategory, remove: removeCategory }) => (
          <div className="space-y-5">
            {categoryFields.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d6c3b7] bg-[#fff8f5] px-5 py-8 text-center text-sm text-[#7a6859]">
                No categories yet. Add a category, then add budget items under it.
              </div>
            )}

            {categoryFields.map(({ key, name, ...restField }, catIndex) => {
              const catCollapsed = collapsedCategories.has(key);
              return (
              <div key={key} className="rounded-2xl border border-[#ead9cb] bg-[#fffaf7]">
                <div className="flex items-start justify-between gap-3 p-4">
                  <button
                    type="button"
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ead9cb] bg-white text-[#9D4D01]"
                    onClick={() => toggleSet(setCollapsedCategories, key)}
                    aria-expanded={!catCollapsed}
                    aria-label={catCollapsed ? 'Expand category' : 'Collapse category'}
                  >
                    {catCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#9D4D01]">
                        Category {catIndex + 1}
                      </p>
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const cat = (form.getFieldValue('categories') ?? [])[name] ?? {};
                          const catItems = flattenCategoriesToItems([cat]);
                          const catTotal = catItems.reduce(
                            (sum, item) => sum + (Number(item?.amount) || 0),
                            0,
                          );
                          return (
                            <span className="text-[11px] font-semibold text-[#7a6859]">
                              {catItems.length} item{catItems.length === 1 ? '' : 's'} · {formatMoney(catTotal)}
                            </span>
                          );
                        }}
                      </Form.Item>
                    </div>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      className="mb-0"
                      label={<span className="text-sm font-semibold text-[#582f08]">Category name</span>}
                      rules={[{ required: true, message: 'Category name is required.' }]}
                    >
                      <Input
                        size="large"
                        className={shellInputClass}
                        placeholder="e.g. IT Equipment"
                      />
                    </Form.Item>
                  </div>
                  {categoryFields.length > 1 && (
                    <Button
                      danger
                      type="text"
                      htmlType="button"
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeCategory(name)}
                      className="mt-7"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className={catCollapsed ? 'hidden' : undefined}>
                <Form.List name={[name, 'items']} initialValue={[{ quantity: 1 }]}>
                  {(itemFields, { add: addItem, remove: removeItem }) => (
                    <div className="space-y-3 border-t border-[#ead9cb] px-4 pb-4 pt-4">
                      {itemFields.map(({ key: itemKey, name: itemName, ...itemRest }, itemIndex) => {
                        const itemId = `${key}-${itemKey}`;
                        const itemCollapsed = collapsedItems.has(itemId);
                        return (
                        <div
                          key={itemKey}
                          className="rounded-xl border border-[#ead9cb] bg-white"
                        >
                          <div className="flex items-center justify-between gap-2 px-3 py-2">
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              onClick={() => toggleSet(setCollapsedItems, itemId)}
                              aria-expanded={!itemCollapsed}
                            >
                              <span className="text-[#9D4D01]">
                                {itemCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                              </span>
                              <Form.Item noStyle shouldUpdate>
                                {() => {
                                  const row =
                                    ((form.getFieldValue('categories') ?? [])[name]?.items ?? [])[
                                      itemName
                                    ] ?? {};
                                  return (
                                    <span className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[#7a6859]">
                                      {row.item
                                        ? `${row.item} · Qty ${row.quantity ?? 1} · ${formatMoney(row.amount ?? 0)}`
                                        : `Budget item ${itemIndex + 1}`}
                                    </span>
                                  );
                                }}
                              </Form.Item>
                            </button>
                            {itemFields.length > 1 && (
                              <Button
                                danger
                                type="text"
                                htmlType="button"
                                size="small"
                                icon={<MinusCircleOutlined />}
                                onClick={() => removeItem(itemName)}
                              >
                                Remove item
                              </Button>
                            )}
                          </div>
                          <div className={itemCollapsed ? 'hidden' : 'px-3 pb-3'}>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
                            <Form.Item
                              {...itemRest}
                              name={[itemName, 'item']}
                              className="mb-0"
                              label={
                                <span className="text-sm font-semibold text-[#582f08]">
                                  Budget item
                                </span>
                              }
                              rules={[{ required: true, message: 'Item name is required.' }]}
                            >
                              <Input
                                size="large"
                                className={shellInputClass}
                                placeholder="e.g. Laptop"
                              />
                            </Form.Item>
                            <Form.Item
                              {...itemRest}
                              name={[itemName, 'quantity']}
                              className="mb-0"
                              label={<span className="text-sm font-semibold text-[#582f08]">Quantity</span>}
                            >
                              <InputNumber
                                min={0}
                                precision={0}
                                size="large"
                                className={`w-full ${shellInputClass}`}
                                placeholder="0"
                              />
                            </Form.Item>
                            <Form.Item
                              {...itemRest}
                              name={[itemName, 'amount']}
                              className="mb-0"
                              label={
                                <span className="text-sm font-semibold text-[#582f08]">Amount (GHS)</span>
                              }
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
                        </div>
                        );
                      })}

                      <Button
                        type="dashed"
                        htmlType="button"
                        icon={<PlusCircleOutlined />}
                        onClick={() => addItem({ quantity: 1 })}
                        className="h-11 w-full rounded-xl border-[#9D4D01] text-[#9D4D01]"
                      >
                        Add budget item
                      </Button>
                    </div>
                  )}
                </Form.List>
                </div>
              </div>
              );
            })}

            <Button
              type="dashed"
              htmlType="button"
              icon={<PlusCircleOutlined />}
              onClick={() => addCategory({ name: '', items: [{ quantity: 1 }] })}
              className="h-12 w-full rounded-2xl border-[#582f08] text-[#582f08]"
            >
              Add category
            </Button>
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
    categories: watchedValues.categories ?? storedValues.categories ?? [],
  };
  const categoryGroups = Array.isArray(reviewValues.categories)
    ? reviewValues.categories.filter((cat) => cat && (cat.name || (cat.items ?? []).length))
    : [];
  const lineItems = flattenCategoriesToItems(categoryGroups);
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
        const categories = form.getFieldValue('categories') ?? [];
        const items = flattenCategoriesToItems(categories);
        if (!items.length) {
          message.warning('Add at least one category with a budget item before continuing.');
          return;
        }
        const itemFields = categories.flatMap((cat, catIndex) => [
          ['categories', catIndex, 'name'],
          ...((cat?.items ?? []).flatMap((_, itemIndex) => [
            ['categories', catIndex, 'items', itemIndex, 'item'],
            ['categories', catIndex, 'items', itemIndex, 'amount'],
          ])),
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
                <Button size="large" htmlType="button" onClick={onCancel} className="rounded-xl border-[#d6c3b7]">
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
                onFinish={(values) => {
                  if (currentStep !== STEP_LABELS.length - 1) return;
                  onFinish(values);
                }}
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
                        htmlType="button"
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
                          {categoryGroups.length} categor{categoryGroups.length === 1 ? 'y' : 'ies'} ·{' '}
                          {lineItems.length} item{lineItems.length === 1 ? '' : 's'} · {formatMoney(total)}
                        </p>
                      </div>
                      <div className="divide-y divide-[#ead9cb]">
                        {lineItems.length === 0 && (
                          <p className="p-5 text-sm text-[#7a6859]">No budget lines entered.</p>
                        )}
                        {categoryGroups.map((cat, catIndex) => {
                          const catItems = (cat?.items ?? []).filter(
                            (row) => row && (row.item || row.amount != null),
                          );
                          if (!catItems.length && !cat?.name) return null;
                          return (
                            <div key={`${cat?.name ?? 'category'}-${catIndex}`}>
                              <div className="bg-[#fdf1eb] px-5 py-2">
                                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#9D4D01]">
                                  {cat?.name || 'Uncategorized'}
                                </p>
                              </div>
                              {catItems.map((item, index) => (
                                <div
                                  key={`${item?.item ?? 'line'}-${index}`}
                                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="m-0 break-words text-sm font-semibold text-[#582f08]">
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
                          );
                        })}
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
                    {currentStep === 1 && 'Step 2 of 4 — Add a category, then budget items under it.'}
                    {currentStep === 2 && 'Step 3 of 4 — Supporting documents are optional.'}
                    {currentStep === 3 &&
                      'Step 4 of 4 — Read-only review. Go Back to edit, then Create Budget.'}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="large" htmlType="button" onClick={onCancel} className="rounded-xl border-[#d6c3b7]">
                      Cancel
                    </Button>
                    {currentStep > 0 && (
                      <Button size="large" htmlType="button" onClick={goBack} className="rounded-xl border-[#d6c3b7]">
                        Back
                      </Button>
                    )}
                    <Button
                      type="primary"
                      htmlType="button"
                      size="large"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goNext();
                      }}
                      className={`rounded-xl px-6 font-bold ${
                        currentStep < STEP_LABELS.length - 1 ? '' : 'hidden'
                      }`}
                      style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
                    >
                      {currentStep === 2 ? 'Skip / Continue' : 'Next'}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      size="large"
                      loading={isPending}
                      onClick={() => {
                        if (currentStep !== STEP_LABELS.length - 1) return;
                        form.submit();
                      }}
                      className={`rounded-xl px-6 font-bold ${
                        currentStep === STEP_LABELS.length - 1 ? '' : 'hidden'
                      }`}
                      style={{ background: '#582f08', borderColor: '#582f08' }}
                    >
                      Create Budget
                    </Button>
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
