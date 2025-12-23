import {
  Button,
  Card,
  InputNumber,
  message,
  Modal,
  Switch,
  Table,
  Tag,
  Tooltip,
  Statistic,
  Alert,
} from 'antd';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRetentionStatus, triggerAutoArchive } from '../../http/retention';
import { useGetAllConfigurations } from '../../queryHooks/configuration';
import { addConfiguration, updateConfiguration } from '../../http/configuration';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FiArchive, FiClock, FiFileText, FiSettings } from 'react-icons/fi';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';

dayjs.extend(relativeTime);

const RetentionPolicy = () => {
  const queryClient = useQueryClient();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [retentionEnabled, setRetentionEnabled] = useState(false);

  // Fetch retention status
  const { data: retentionStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['retentionStatus'],
    queryFn: getRetentionStatus,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch configurations
  const { data: configurations } = useGetAllConfigurations();

  // Get current config values
  const currentConfigs = configurations?.data?.data || [];
  const enabledConfig = currentConfigs.find(c => c.name === 'DOCUMENT_RETENTION_ENABLED');
  const daysConfig = currentConfigs.find(c => c.name === 'DOCUMENT_RETENTION_DAYS');

  // Save configuration mutation
  const { mutate: saveConfig, isPending: savingConfig } = useMutation({
    mutationFn: async ({ name, value }) => {
      const existingConfig = currentConfigs.find(c => c.name === name);
      if (existingConfig) {
        return updateConfiguration(existingConfig.id, { name, value });
      } else {
        return addConfiguration({ name, value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      queryClient.invalidateQueries({ queryKey: ['retentionStatus'] });
      message.success('Retention policy updated successfully');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update retention policy');
    },
  });

  // Auto-archive mutation
  const { mutate: runAutoArchive, isPending: archiving } = useMutation({
    mutationFn: triggerAutoArchive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retentionStatus'] });
      if (data.data.archived > 0) {
        message.success(`Successfully archived ${data.data.archived} documents`);
      } else {
        message.info('No documents to archive');
      }
    },
    onError: (error) => {
      message.error(error.message || 'Failed to run auto-archive');
    },
  });

  const handleOpenConfig = () => {
    setRetentionEnabled(enabledConfig?.value === 'true');
    setRetentionDays(parseInt(daysConfig?.value || '90', 10));
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async () => {
    await saveConfig({ name: 'DOCUMENT_RETENTION_ENABLED', value: retentionEnabled.toString() });
    await saveConfig({ name: 'DOCUMENT_RETENTION_DAYS', value: retentionDays.toString() });
    setIsConfigModalOpen(false);
  };

  const handleRunAutoArchive = () => {
    Modal.confirm({
      title: 'Run Auto-Archive',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>This will archive all documents that have been inactive for more than {retentionStatus?.data?.retentionDays || 90} days.</p>
          <p className="mt-2 text-orange-600 font-medium">
            {retentionStatus?.data?.pendingArchive || 0} documents will be archived.
          </p>
        </div>
      ),
      okText: 'Archive Now',
      okButtonProps: { style: { backgroundColor: '#582F08' } },
      cancelText: 'Cancel',
      onOk: () => runAutoArchive(),
    });
  };

  const expiredDocColumns = [
    {
      title: 'Reference',
      dataIndex: 'ref',
      key: 'ref',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD MMM YYYY, HH:mm')}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="orange">Pending Archive</Tag>,
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Document Retention Policy</h2>
        <div className="flex gap-2">
          <Button
            icon={<SyncOutlined spin={statusLoading} />}
            onClick={() => refetchStatus()}
          >
            Refresh
          </Button>
          <Button
            icon={<FiSettings />}
            onClick={handleOpenConfig}
          >
            Configure
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <Statistic
            title="Policy Status"
            value={retentionStatus?.data?.enabled ? 'Enabled' : 'Disabled'}
            valueStyle={{ color: retentionStatus?.data?.enabled ? '#52c41a' : '#ff4d4f' }}
            prefix={retentionStatus?.data?.enabled ? '✓' : '✗'}
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic
            title="Retention Period"
            value={retentionStatus?.data?.retentionDays || 90}
            suffix="days"
            prefix={<FiClock className="mr-2" />}
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic
            title="Documents Pending Archive"
            value={retentionStatus?.data?.pendingArchive || 0}
            prefix={<FiFileText className="mr-2" />}
            valueStyle={{ color: retentionStatus?.data?.pendingArchive > 0 ? '#faad14' : '#52c41a' }}
          />
        </Card>
        <Card className="shadow-sm">
          <div className="flex flex-col items-center justify-center h-full">
            <Button
              type="primary"
              icon={<FiArchive />}
              onClick={handleRunAutoArchive}
              loading={archiving}
              disabled={!retentionStatus?.data?.enabled || retentionStatus?.data?.pendingArchive === 0}
              style={{ backgroundColor: '#582F08' }}
              size="large"
            >
              Run Auto-Archive
            </Button>
          </div>
        </Card>
      </div>

      {/* Info Alert */}
      {!retentionStatus?.data?.enabled && (
        <Alert
          message="Retention Policy Disabled"
          description="Enable the retention policy to automatically archive documents that have been inactive for the specified period."
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      {/* Pending Documents Table */}
      {retentionStatus?.data?.pendingArchive > 0 && (
        <Card title="Documents Pending Archive" className="shadow-sm">
          <Table
            dataSource={retentionStatus?.data?.expiredDocuments?.map((doc) => ({
              ...doc,
              key: doc.docID,
            })) || []}
            columns={expiredDocColumns}
            pagination={{ pageSize: 10 }}
            loading={statusLoading}
          />
        </Card>
      )}

      {/* Configuration Modal */}
      <Modal
        title="Configure Retention Policy"
        open={isConfigModalOpen}
        onCancel={() => setIsConfigModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfigModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            style={{ backgroundColor: '#582F08' }}
            onClick={handleSaveConfig}
            loading={savingConfig}
          >
            Save Changes
          </Button>,
        ]}
      >
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Enable Retention Policy</h4>
              <p className="text-sm text-gray-500">
                Automatically archive documents after the retention period
              </p>
            </div>
            <Switch
              checked={retentionEnabled}
              onChange={setRetentionEnabled}
            />
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Retention Period (Days)</h4>
            <p className="text-sm text-gray-500 mb-2">
              Documents inactive for this many days will be auto-archived
            </p>
            <InputNumber
              min={1}
              max={365}
              value={retentionDays}
              onChange={setRetentionDays}
              disabled={!retentionEnabled}
              style={{ width: '100%' }}
              addonAfter="days"
            />
          </div>

          <Alert
            message="Note"
            description="Auto-archive runs when triggered manually. Documents will be moved to the 'Auto-Archived' folder."
            type="warning"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default RetentionPolicy;
