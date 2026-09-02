import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { List, Avatar, Tag, Spin, Empty, Tabs, Typography, Space, Tooltip } from 'antd';
import { EyeOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getDocumentViewStats, getUnviewedRecipients } from '../http/documentViews';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TabPane } = Tabs;

/**
 * ReadReceipts Component - Displays who has viewed a document
 * @param {string} documentId - The document ID to get read receipts for
 */
const ReadReceipts = ({ documentId }) => {
  // Fetch view statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['documentViewStats', documentId],
    queryFn: () => getDocumentViewStats(documentId),
    enabled: !!documentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch unviewed recipients
  const { data: unviewedData, isLoading: unviewedLoading } = useQuery({
    queryKey: ['unviewedRecipients', documentId],
    queryFn: () => getUnviewedRecipients(documentId),
    enabled: !!documentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsData?.data;
  const unviewedRecipients = unviewedData?.data || [];

  if (statsLoading || unviewedLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" tip="Loading read receipts..." />
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#1890ff';
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-4 bg-[#fffaf6] rounded-xl border border-[#f0e6da]">
            <EyeOutlined className="text-xl text-[#9D4D01] mb-2" />
            <div className="text-2xl font-semibold text-[#582F08]">{stats?.totalViews || 0}</div>
            <div className="text-[#7a6859] text-xs uppercase tracking-[0.12em] mt-1">Total views</div>
          </div>
          <div className="text-center p-4 bg-[#fffaf6] rounded-xl border border-[#f0e6da]">
            <UserOutlined className="text-xl text-[#9D4D01] mb-2" />
            <div className="text-2xl font-semibold text-[#582F08]">{stats?.uniqueViewers || 0}</div>
            <div className="text-[#7a6859] text-xs uppercase tracking-[0.12em] mt-1">Unique viewers</div>
          </div>
          <div className="text-center p-4 bg-[#fffaf6] rounded-xl border border-[#f0e6da]">
            <ClockCircleOutlined className="text-xl text-[#9D4D01] mb-2" />
            <div className="text-lg font-semibold text-[#582F08]">
              {stats?.firstView ? dayjs(stats.firstView).fromNow() : '—'}
            </div>
            <div className="text-[#7a6859] text-xs uppercase tracking-[0.12em] mt-1">First viewed</div>
          </div>
        </div>

      {/* Tabs for Viewed and Unviewed */}
      <Tabs defaultActiveKey="viewed">
        <TabPane
          tab={
            <span>
              <CheckCircleOutlined />
              Viewed ({stats?.viewers?.length || 0})
            </span>
          }
          key="viewed"
        >
          {!stats?.viewers || stats.viewers.length === 0 ? (
            <Empty
              description="No one has viewed this document yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={stats.viewers}
              renderItem={(viewer) => (
                <List.Item className="hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getAvatarColor(viewer.name) }}
                        size={48}
                      >
                        {getInitials(viewer.name)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong>{viewer.name}</Text>
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Viewed
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Tooltip title={dayjs(viewer.lastViewedAt).format('MMMM D, YYYY h:mm A')}>
                          <Text type="secondary">
                            <ClockCircleOutlined /> Last viewed {dayjs(viewer.lastViewedAt).fromNow()}
                          </Text>
                        </Tooltip>
                        <Text type="secondary" className="text-xs">
                          {dayjs(viewer.lastViewedAt).format('MMM D, YYYY h:mm A')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CloseCircleOutlined />
              Not Viewed ({unviewedRecipients.length})
            </span>
          }
          key="unviewed"
        >
          {unviewedRecipients.length === 0 ? (
            <Empty
              description="All recipients have viewed this document"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={unviewedRecipients}
              renderItem={(recipient) => (
                <List.Item className="hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getAvatarColor(recipient.name) }}
                        size={48}
                      >
                        {getInitials(recipient.name)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong>{recipient.name}</Text>
                        <Tag color="orange" icon={<ClockCircleOutlined />}>
                          Pending
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{recipient.email}</Text>
                        <Text type="secondary" className="text-xs">
                          {recipient.department?.departmentName}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <EyeOutlined />
              All Views ({stats?.allViews?.length || 0})
            </span>
          }
          key="all"
        >
          {!stats?.allViews || stats.allViews.length === 0 ? (
            <Empty
              description="No views recorded yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={stats.allViews}
              renderItem={(view) => (
                <List.Item className="hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getAvatarColor(view.user.name) }}
                        size={40}
                      >
                        {getInitials(view.user.name)}
                      </Avatar>
                    }
                    title={<Text>{view.user.name}</Text>}
                    description={
                      <Tooltip title={dayjs(view.viewedAt).format('MMMM D, YYYY h:mm:ss A')}>
                        <Text type="secondary" className="text-xs">
                          {dayjs(view.viewedAt).format('MMM D, YYYY h:mm A')} • {dayjs(view.viewedAt).fromNow()}
                        </Text>
                      </Tooltip>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReadReceipts;
