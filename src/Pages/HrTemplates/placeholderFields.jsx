import { AutoComplete, DatePicker, Input, InputNumber, Select } from 'antd';
import { formatHrMoney } from '../hrLetterTemplates';

export const emptyFill = (placeholders) =>
  Object.fromEntries((placeholders || []).map((item) => [item.key, undefined]));

export function formatFillValues(row, placeholders, staffByUserId = {}) {
  const values = {};
  (placeholders || []).forEach((item) => {
    const raw = row?.[item.key];
    if (item.type === 'staff') {
      values[item.key] = staffByUserId[raw]?.name || raw || '';
      return;
    }
    if (item.type === 'money') {
      values[item.key] = formatHrMoney(raw);
      return;
    }
    if (item.type === 'date' && raw?.format) {
      values[item.key] = raw.format('D MMMM YYYY');
      return;
    }
    values[item.key] = raw ?? '';
  });
  return values;
}

export const PlaceholderInput = ({
  field,
  staffNameOptions,
  staffSelectOptions,
  value,
  onChange,
  ...rest
}) => {
  if (field.type === 'staff' && staffSelectOptions) {
    return (
      <Select
        {...rest}
        value={value}
        onChange={onChange}
        options={staffSelectOptions}
        showSearch
        optionFilterProp="label"
        placeholder="Select staff"
        size="large"
        className="w-full"
        allowClear
      />
    );
  }
  if (field.type === 'staff') {
    return (
      <AutoComplete
        {...rest}
        value={value}
        onChange={onChange}
        options={staffNameOptions}
        filterOption={(input, option) =>
          (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
        }
        placeholder={`Select or type ${field.label.toLowerCase()}`}
        size="large"
      />
    );
  }
  if (field.type === 'money') {
    return (
      <InputNumber
        {...rest}
        value={value}
        onChange={onChange}
        className="w-full"
        min={0}
        placeholder="0.00"
        formatter={(num) => `GHS ${num}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(text) => text?.replace(/GHS\s?|(,*)/g, '') || ''}
      />
    );
  }
  if (field.type === 'number') {
    return (
      <InputNumber
        {...rest}
        value={value}
        onChange={onChange}
        className="w-full"
        min={1}
        precision={0}
        placeholder="e.g. 24"
      />
    );
  }
  if (field.type === 'date') {
    return (
      <DatePicker
        {...rest}
        value={value}
        onChange={onChange}
        className="w-full"
        size="large"
        format="D MMMM YYYY"
      />
    );
  }
  return (
    <Input
      {...rest}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${field.label.toLowerCase()}`}
      size="large"
    />
  );
};
