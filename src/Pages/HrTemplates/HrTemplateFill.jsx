import { Button, Form, Input, message } from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../Components/PageHeader';
import { useUser } from '../CustomHook/useUser';
import { useGetAllUsers } from '../../queryHooks/user';
import { getHrTemplate } from '../../utils/hrTemplateStore';
import { buildHrMergeLetter } from '../hrLetterTemplates';
import {
  PlaceholderInput,
  emptyFill,
  formatFillValues,
} from './placeholderFields';

const { TextArea } = Input;

const HrTemplateFill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useUser();
  const template = getHrTemplate(id);
  const placeholders = template?.placeholders || [];
  const isMemo = template?.kind === 'memo';
  const { data: ccUsers } = useGetAllUsers();

  const staffNameOptions = (ccUsers?.data?.users || ccUsers?.data || [])
    .map((person) => person?.name)
    .filter(Boolean)
    .map((name) => ({ value: name }));

  useEffect(() => {
    if (!template) {
      message.error('Template not found');
      navigate('/templates', { replace: true });
    }
  }, [navigate, template]);

  if (!template) return null;

  const handleGenerate = async (values) => {
    try {
      if (isMemo || placeholders.length === 0) {
        const letter = await buildHrMergeLetter({
          title: template.name,
          body: values.body || template.body,
          values: {},
          senderName: user?.name,
          kind: template.kind,
        });
        saveAs(letter.blob, letter.filename);
        message.success('Downloaded');
        return;
      }
      const rows = (values.rows || []).filter((row) =>
        placeholders.some((item) => {
          const value = row?.[item.key];
          return value != null && String(value).trim() !== '';
        }),
      );
      if (!rows.length) {
        message.error('Enter values for at least one person');
        return;
      }
      for (let index = 0; index < rows.length; index += 1) {
        const filledValues = formatFillValues(rows[index], placeholders);
        const letter = await buildHrMergeLetter({
          title: template.name,
          body: template.body,
          values: filledValues,
          senderName: user?.name,
          kind: template.kind,
        });
        saveAs(letter.blob, letter.filename);
        if (index < rows.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      message.success(
        rows.length === 1
          ? 'Letter downloaded'
          : `${rows.length} letters downloaded, one for each person`,
      );
    } catch (error) {
      message.error(error?.message || 'Could not generate the letter');
    }
  };

  return (
    <div className="pt-2">
      <PageHeader
        title={template.name}
        description={
          isMemo
            ? 'Preview the memo body, edit if needed, then download.'
            : 'Fill the placeholders. Add another person to generate a separate letter for each one.'
        }
        extra={
          <Link to={`/templates/${template.id}/edit`}>
            <Button>Edit template</Button>
          </Link>
        }
      />
      <div className="max-w-3xl rounded-2xl border border-[#ead9cb] bg-white p-5">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={
            isMemo
              ? { body: template.body }
              : { rows: [emptyFill(placeholders)] }
          }
        >
          {isMemo ? (
            <Form.Item
              name="body"
              label="Memo body"
              rules={[{ required: true, message: 'Write the memo body' }]}
            >
              <TextArea rows={12} />
            </Form.Item>
          ) : (
            <Form.List name="rows">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="rounded-xl border border-[#ead9cb] bg-[#fffaf7] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold text-[#582F08]">
                          {index === 0 ? 'First person' : `Person ${index + 1}`}
                        </p>
                        {index > 0 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </div>
                      {placeholders.length === 0 ? (
                        <p className="text-sm text-[#7a6859]">
                          This template has no placeholders. Generate to download the letter as written.
                        </p>
                      ) : (
                        placeholders.map((item) => (
                          <Form.Item
                            key={item.key}
                            name={[field.name, item.key]}
                            label={item.label}
                            rules={
                              index === 0
                                ? [{ required: true, message: `Enter ${item.label.toLowerCase()}` }]
                                : []
                            }
                          >
                            <PlaceholderInput
                              field={item}
                              staffNameOptions={staffNameOptions}
                            />
                          </Form.Item>
                        ))
                      )}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    htmlType="button"
                    icon={<PlusOutlined />}
                    className="w-full"
                    onClick={() => add(emptyFill(placeholders))}
                  >
                    Add person
                  </Button>
                </div>
              )}
            </Form.List>
          )}
          <div className="mt-6 flex gap-2">
            <Button type="primary" htmlType="submit">
              {isMemo ? 'Download memo' : 'Generate letters'}
            </Button>
            <Button htmlType="button" onClick={() => navigate('/templates')}>
              Back to templates
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default HrTemplateFill;
