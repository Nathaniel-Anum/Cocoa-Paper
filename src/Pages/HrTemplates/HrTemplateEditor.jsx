import { Button, Form, Input, Radio, Select, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../Components/PageHeader';
import {
  PLACEHOLDER_TYPES,
  QUICK_PLACEHOLDERS,
  getHrTemplate,
  insertPlaceholder,
  saveHrTemplate,
  syncPlaceholders,
} from '../../utils/hrTemplateStore';

const { TextArea } = Input;

const HrTemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const existing = id ? getHrTemplate(id) : null;
  const body = Form.useWatch('body', form) || '';
  const kind = Form.useWatch('kind', form);
  const [placeholderMeta, setPlaceholderMeta] = useState(existing?.placeholders || []);

  useEffect(() => {
    if (id && !existing) {
      message.error('Template not found');
      navigate('/templates', { replace: true });
    }
  }, [existing, id, navigate]);

  const placeholders = useMemo(
    () => syncPlaceholders(body, placeholderMeta),
    [body, placeholderMeta],
  );

  const handleInsert = (item) => {
    const nextBody = insertPlaceholder(form.getFieldValue('body') || body, item.key);
    form.setFieldValue('body', nextBody);
    setPlaceholderMeta((prev) => {
      if (prev.some((entry) => entry.key === item.key)) return prev;
      return [...prev, { key: item.key, label: item.label, type: item.type }];
    });
  };

  const handleTypeChange = (key, type) => {
    setPlaceholderMeta((prev) => {
      const next = syncPlaceholders(body, prev).map((item) =>
        item.key === key ? { ...item, type } : item,
      );
      return next;
    });
  };

  const handleFinish = (values) => {
    const saved = saveHrTemplate({
      ...(existing || {}),
      name: values.name.trim(),
      kind: values.kind,
      body: values.body,
      placeholders: values.kind === 'memo' ? [] : placeholders,
    });
    message.success(existing ? 'Template updated' : 'Template created');
    navigate(`/templates/${saved.id}/fill`);
  };

  return (
    <div className="pt-2">
      <PageHeader
        title={existing ? 'Edit template' : 'New template'}
        description="Write the letter once. Choose Memo or Any type for the letterhead."
      />
      <div className="max-w-3xl rounded-2xl border border-[#ead9cb] bg-white p-5">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: existing?.name || '',
            kind: existing?.kind || 'letter',
            body: existing?.body || '',
          }}
          onFinish={handleFinish}
        >
          <Form.Item
            name="name"
            label="Template name"
            rules={[{ required: true, message: 'Enter a template name' }]}
          >
            <Input placeholder="e.g. Contract letter" size="large" />
          </Form.Item>
          <Form.Item
            name="kind"
            label="Template type"
            rules={[{ required: true, message: 'Choose Memo or Any type' }]}
          >
            <Radio.Group>
              <Radio.Button value="memo">Memo</Radio.Button>
              <Radio.Button value="letter">Any type</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <p className="mb-4 -mt-2 text-xs text-[#7a6859]">
            {kind === 'memo'
              ? 'Memos print on the official memo form. To, From, Date, and Subject are filled when you send. Write the body as it should appear.'
              : 'Any type prints on the Ghana Cocoa Board letterhead. Use placeholders for values that change per person.'}
          </p>
          {kind !== 'memo' && (
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium text-[#582F08]">Insert placeholder</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PLACEHOLDERS.map((item) => (
                <Button key={item.key} htmlType="button" onClick={() => handleInsert(item)}>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          )}
          <Form.Item
            name="body"
            label={kind === 'memo' ? 'Memo body' : 'Letter body'}
            rules={[{ required: true, message: kind === 'memo' ? 'Write the memo body' : 'Write the letter body' }]}
          >
            <TextArea
              rows={12}
              placeholder={
                kind === 'memo'
                  ? 'Write the memo as it should appear on the form.'
                  : 'This contract is made with {{staff_name}} for {{amount}}.'
              }
            />
          </Form.Item>
          {kind !== 'memo' && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-[#582F08]">Placeholders in this letter</p>
            {placeholders.length === 0 ? (
              <p className="text-sm text-[#7a6859]">
                Insert a field or type one like {'{{staff_name}}'}.
              </p>
            ) : (
              <div className="space-y-2">
                {placeholders.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-wrap items-center gap-3 rounded-lg bg-[#fffaf7] px-3 py-2"
                  >
                    <Tag color="gold">{`{{${item.key}}}`}</Tag>
                    <span className="text-sm text-[#582F08]">{item.label}</span>
                    <Select
                      className="ml-auto w-40"
                      value={item.type}
                      options={PLACEHOLDER_TYPES}
                      onChange={(type) => handleTypeChange(item.key, type)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
          <div className="flex gap-2">
            <Button type="primary" htmlType="submit">
              {existing ? 'Save template' : 'Create template'}
            </Button>
            <Button htmlType="button" onClick={() => navigate('/templates')}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default HrTemplateEditor;
