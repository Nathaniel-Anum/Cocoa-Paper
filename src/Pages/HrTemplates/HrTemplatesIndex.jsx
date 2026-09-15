import { Button, Empty, Modal, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, FileAddOutlined, FormOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import PageHeader from '../../Components/PageHeader';
import { deleteHrTemplate, listHrTemplates } from '../../utils/hrTemplateStore';

const HrTemplatesIndex = () => {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const templates = useMemo(() => listHrTemplates(), [version]);

  const handleDelete = (template) => {
    Modal.confirm({
      title: `Delete “${template.name}”?`,
      content: 'This template will be removed from this browser.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteHrTemplate(template.id);
        setVersion((n) => n + 1);
        message.success('Template deleted');
      },
    });
  };

  return (
    <div className="pt-2">
      <PageHeader
        title="Templates"
        description="Create Memo or letter templates here. On Add Document, choose HR Operations to fill one and send it."
        extra={
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={() => navigate('/templates/new')}
          >
            New template
          </Button>
        }
      />

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-[#ead9cb] bg-white py-16">
          <Empty
            description="No templates yet. Create one with placeholders like {{staff_name}} and {{amount}}."
          >
            <Button type="primary" onClick={() => navigate('/templates/new')}>
              Create template
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col rounded-2xl border border-[#ead9cb] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-[#582F08]">{template.name}</h2>
                <Tag color={template.kind === 'memo' ? 'gold' : 'default'}>
                  {template.kind === 'memo' ? 'Memo' : 'Any type'}
                </Tag>
              </div>
              <p className="mt-1 line-clamp-3 text-sm text-[#7a6859]">
                {template.body || 'No letter body yet.'}
              </p>
              <p className="mt-3 text-xs text-[#9D4D01]">
                {(template.placeholders || []).length} placeholder
                {(template.placeholders || []).length === 1 ? '' : 's'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/templates/${template.id}/fill`}>
                  <Button type="primary" icon={<FormOutlined />}>
                    Fill
                  </Button>
                </Link>
                <Link to={`/templates/${template.id}/edit`}>
                  <Button icon={<EditOutlined />}>Edit</Button>
                </Link>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(template)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrTemplatesIndex;
