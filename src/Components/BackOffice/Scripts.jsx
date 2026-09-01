import React, { useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Spin,
  Empty,
  Alert,
  Popconfirm,
  message,
} from 'antd';
import {
  PlayCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  HddOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  getMaintenanceScripts,
  runMaintenanceScript,
} from '../../http/maintenance';

const actionColor = {
  FIXED: 'green',
  WOULD_FIX: 'blue',
  SKIP: 'default',
  MISSING: 'red',
};

const ScriptCard = ({ script }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (apply) => {
    setRunning(true);
    try {
      const data = await runMaintenanceScript(script.id, apply);
      setResult(data);
      if (apply) {
        message.success('Script applied successfully');
      } else {
        message.info('Dry run complete — no changes were made');
      }
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to run script');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card
      className="shadow-sm border border-[#f0e6da]"
      title={
        <span className="flex items-center gap-2 text-[#582F08]">
          <HddOutlined /> {script.name}
        </span>
      }
    >
      <p className="text-sm text-gray-500 mb-4">{script.description}</p>

      <div className="flex flex-wrap gap-2">
        <Button
          icon={<PlayCircleOutlined />}
          onClick={() => run(false)}
          loading={running}
        >
          Dry run (preview)
        </Button>
        <Popconfirm
          title="Apply changes?"
          description="This will modify the database. Make sure you've reviewed the dry run first."
          okText="Apply"
          okButtonProps={{ danger: true }}
          onConfirm={() => run(true)}
        >
          <Button
            type="primary"
            danger
            icon={<ThunderboltOutlined />}
            loading={running}
          >
            Apply
          </Button>
        </Popconfirm>
      </div>

      {result && (
        <div className="mt-4">
          <Alert
            type={result.applied ? 'success' : 'info'}
            showIcon
            message={
              result.applied
                ? 'Changes applied'
                : 'Dry run — no changes were made'
            }
            description={
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(result.summary || {}).map(([k, v]) => (
                  <Tag key={k} className="!m-0">
                    {k}: <strong>{v}</strong>
                  </Tag>
                ))}
              </div>
            }
          />

          {Array.isArray(result.items) && result.items.length > 0 && (
            <div className="mt-3 border border-[#f0e6da] rounded-lg max-h-72 overflow-auto divide-y divide-[#f5ece2]">
              {result.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 px-3 py-2 text-sm"
                >
                  <Tag color={actionColor[it.action] || 'default'} className="!m-0 flex-shrink-0">
                    {it.action}
                  </Tag>
                  <div className="min-w-0">
                    <p className="text-[#582F08] truncate">{it.name}</p>
                    {(it.reason || it.to) && (
                      <p className="text-xs text-gray-400 break-all">
                        {it.reason || `${it.from} → ${it.to}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const Scripts = () => {
  const {
    data: scripts = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['maintenanceScripts'],
    queryFn: getMaintenanceScripts,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#582F08]">Maintenance Scripts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Run one-off data repair tasks. Always preview with a dry run before
            applying.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isRefetching}
        >
          Refresh
        </Button>
      </div>

      <Alert
        type="warning"
        showIcon
        className="mb-4"
        message="These actions modify production data"
        description="Dry run shows what would change without touching anything. Apply performs the changes. Back up the database before applying."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : scripts.length === 0 ? (
        <Empty description="No scripts available" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scripts.map((s) => (
            <ScriptCard key={s.id} script={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Scripts;
