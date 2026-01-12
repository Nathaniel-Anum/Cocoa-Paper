import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Spin,
  DatePicker,
  Tabs,
  Progress,
  Tag,
  Empty,
  Badge,
  Divider,
  Space,
  Statistic,
  Tooltip,
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  FaClock,
  FaExclamationTriangle,
  FaUsers,
  FaFileAlt,
  FaTrophy,
  FaBolt,
  FaChartBar,
  FaCalendarAlt,
} from 'react-icons/fa';
import { GiSandsOfTime, GiProgression } from 'react-icons/gi';
import { AiOutlineRise, AiOutlineFall } from 'react-icons/ai';
import { getDashboardData } from '../http/advancedAnalytics';
import { useUser } from './CustomHook/useUser';
import Trail from '../Components/Trail/Trail';
import axiosInstance from '../Components/axiosInstance';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const COLORS = ['#582f08', '#ce6d11', '#e4c8ad', '#8B4513', '#D2691E', '#DEB887'];

const AdvancedAnalytics = () => {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    divisionId: undefined,
    departmentId: undefined,
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const [trailModalOpen, setTrailModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Set division filter based on user's division when user is loaded
  useEffect(() => {
    if (user?.division?.divisionId) {
      setFilters((prev) => ({
        ...prev,
        divisionId: user.division.divisionId,
      }));
    }
  }, [user?.division?.divisionId]);

  const { data, isLoading } = useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: () => getDashboardData(filters),
    refetchInterval: 60000,
    enabled: !!filters.divisionId, // Only fetch when division is set
  });

  // Query to fetch trail data for selected document
  const { data: trailData, isLoading: isTrailLoading } = useQuery({
    queryKey: ['trailData', selectedDocId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${selectedDocId}`);
    },
    enabled: !!selectedDocId,
  });

  const analytics = data?.data;

  const handleViewTrail = (docId) => {
    setSelectedDocId(docId);
    setTrailModalOpen(true);
  };

  const handleCloseTrailModal = () => {
    setTrailModalOpen(false);
    // Reset docId after a short delay to avoid flashing empty content
    setTimeout(() => setSelectedDocId(null), 300);
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spin size="large" />
        <Text className="mt-4 text-[#582f08] text-lg">Loading analytics dashboard...</Text>
      </div>
    );
  }

  // Helper function to format decimal days as "Xd Yh" format
  const formatDaysAndHours = (decimalDays) => {
    const days = Math.floor(decimalDays);
    const hours = Math.round((decimalDays - days) * 24);
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days}d`;
    return `${days}d ${hours}h`;
  };

  const bottleneckChartData = analytics?.bottlenecks?.topDepartmentBottlenecks?.slice(0, 8).map((dept) => ({
    name: dept.departmentName?.substring(0, 12) || 'Unknown',
    holdTime: parseFloat(dept.avgHoldTimeDays.toFixed(2)),
    holdTimeFormatted: formatDaysAndHours(dept.avgHoldTimeDays),
    documents: Math.round(dept.documentCount),
  })) || [];

  const statusChartData = analytics?.distribution?.byStatus || [];
  const typeChartData = analytics?.distribution?.byType || [];

  const productivityColumns = [
    {
      title: <span className="font-semibold text-[#582f08]">Staff Member</span>,
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ce6d11] to-[#582f08] flex items-center justify-center text-white font-bold">
            {record.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#582f08]">{record.name}</div>
            <div className="text-xs text-gray-500">{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Created</span>,
      dataIndex: ['metrics', 'documentsCreated'],
      key: 'created',
      render: (val) => (
        <Badge count={val} style={{ backgroundColor: '#582f08' }} showZero />
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Forwarded</span>,
      dataIndex: ['metrics', 'documentsForwarded'],
      key: 'forwarded',
      render: (val) => (
        <Badge count={val} style={{ backgroundColor: '#ce6d11' }} showZero />
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Response Time</span>,
      key: 'response',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <FaClock className="text-[#ce6d11]" />
          <span className="text-[#582f08] font-medium">
            {formatDaysAndHours(record.metrics.averageResponseTimeDays)}
          </span>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Performance Score</span>,
      dataIndex: ['metrics', 'productivityScore'],
      key: 'score',
      render: (score) => {
        const getColor = () => {
          if (score > 50) return '#27ae60';
          if (score > 20) return '#ce6d11';
          return '#e74c3c';
        };
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(score, 100)}%`,
                  backgroundColor: getColor()
                }}
              />
            </div>
            <span className="font-bold" style={{ color: getColor() }}>
              {score}
            </span>
          </div>
        );
      },
      sorter: (a, b) => a.metrics.productivityScore - b.metrics.productivityScore,
    },
  ];

  const bottleneckColumns = [
    {
      title: <span className="font-semibold text-[#582f08]">Staff Member</span>,
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
            {record.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#582f08]">{record.name}</div>
            <div className="text-xs text-gray-500">{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Avg Hold Time</span>,
      key: 'holdTime',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <GiSandsOfTime className="text-[#ce6d11] text-lg" />
          <span className="text-[#ce6d11] font-bold text-lg">
            {formatDaysAndHours(record.avgHoldTimeDays)}
          </span>
        </div>
      ),
      sorter: (a, b) => a.avgHoldTimeDays - b.avgHoldTimeDays,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Documents</span>,
      dataIndex: 'documentCount',
      key: 'documents',
      render: (val) => (
        <Badge count={val} style={{ backgroundColor: '#582f08' }} showZero />
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Status</span>,
      key: 'status',
      render: (_, record) => {
        const days = record.avgHoldTimeDays;
        if (days > 7) return <Tag color="error" className="font-medium">Critical</Tag>;
        if (days > 3) return <Tag color="warning" className="font-medium">Warning</Tag>;
        return <Tag color="success" className="font-medium">Normal</Tag>;
      },
    },
  ];

  const turnaroundColumns = [
    {
      title: <span className="font-semibold text-[#582f08]">Document</span>,
      key: 'doc',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[#582f08] mb-1">
            {record.subject?.substring(0, 40)}...
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Tag color="#e4c8ad" className="text-[#582f08]">{record.ref}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Department</span>,
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <span className="text-[#582f08]">{dept}</span>,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Processing Time</span>,
      key: 'turnaround',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <FaBolt className="text-[#ce6d11]" />
          <span className="text-[#ce6d11] font-bold">
            {formatDaysAndHours(record.turnaroundDays)}
          </span>
        </div>
      ),
      sorter: (a, b) => a.turnaroundDays - b.turnaroundDays,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Steps</span>,
      dataIndex: 'stepsCount',
      key: 'steps',
      render: (val, record) => (
        <Tooltip title="Click to view document trail">
          <div 
            onClick={() => handleViewTrail(record.docID)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <Badge 
              count={val} 
              style={{ backgroundColor: '#582f08', cursor: 'pointer' }} 
            />
          </div>
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-1 md:gap-2 px-1 md:px-3 py-1">
          <FaClock className="text-[#ce6d11] text-sm md:text-base" />
          <span className="font-medium text-xs md:text-sm">Turnaround</span>
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-0 mb-4 md:mb-6">
              <Row gutter={[8, 16]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Average Turnaround</span>}
                    value={analytics?.turnaround?.averageTurnaroundDays ? formatDaysAndHours(analytics.turnaround.averageTurnaroundDays) : '0'}
                    valueStyle={{ color: '#ce6d11', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<GiSandsOfTime />}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Fastest</span>}
                    value={analytics?.turnaround?.fastest?.[0]?.turnaroundDays ? formatDaysAndHours(analytics.turnaround.fastest[0].turnaroundDays) : 'N/A'}
                    valueStyle={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<AiOutlineRise />}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Slowest</span>}
                    value={analytics?.turnaround?.slowest?.[0]?.turnaroundDays ? formatDaysAndHours(analytics.turnaround.slowest[0].turnaroundDays) : 'N/A'}
                    valueStyle={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<AiOutlineFall />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 md:h-8 bg-gradient-to-b from-green-500 to-green-600 rounded"></div>
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Fastest Processing</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow"
            >
              {analytics?.turnaround?.fastest?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    columns={turnaroundColumns}
                    dataSource={analytics.turnaround.fastest}
                    rowKey="docID"
                    pagination={false}
                    size="small"
                    scroll={{ x: 500 }}
                    rowClassName={(_, index) =>
                      `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                    }
                  />
                </div>
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 md:h-8 bg-gradient-to-b from-red-500 to-red-600 rounded"></div>
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Slowest Processing</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow"
            >
              {analytics?.turnaround?.slowest?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    columns={turnaroundColumns}
                    dataSource={analytics.turnaround.slowest}
                    rowKey="docID"
                    pagination={false}
                    size="small"
                    scroll={{ x: 500 }}
                    rowClassName={(_, index) =>
                      `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                    }
                  />
                </div>
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-1 md:gap-2 px-1 md:px-3 py-1">
          <FaExclamationTriangle className="text-[#ce6d11] text-sm md:text-base" />
          <span className="font-medium text-xs md:text-sm">Bottlenecks</span>
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} className="mb-4 md:mb-6">
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-[#ce6d11]" />
                    <span className="text-[#582f08] font-bold text-sm md:text-base">Department Hold Times</span>
                  </div>
                }
                className="rounded-xl shadow-lg border-0"
              >
                <div className="h-64 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bottleneckChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient id="holdTimeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ce6d11" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#ce6d11" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#582f08" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#582f08" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4c8ad" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#582f08" 
                        tick={{ fontSize: 9, fill: '#582f08' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#582f08" tick={{ fontSize: 10, fill: '#582f08' }} width={30} />
                      <RechartsTooltip
                        formatter={(value, name, props) => {
                          if (name === 'holdTime') {
                            return [props.payload.holdTimeFormatted, 'Hold Time'];
                          }
                          return [`${Math.round(value)} docs`, 'Documents'];
                        }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e4c8ad',
                          borderRadius: '12px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                      <Bar 
                        dataKey="holdTime" 
                        fill="url(#holdTimeGradient)" 
                        name="Avg Hold Time" 
                        radius={[8, 8, 0, 0]}
                        barSize={25}
                      />
                      <Bar 
                        dataKey="documents" 
                        fill="url(#docGradient)" 
                        name="Documents" 
                        radius={[8, 8, 0, 0]}
                        barSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <GiProgression className="text-[#ce6d11]" />
                    <span className="text-[#582f08] font-bold text-sm md:text-base">Division Summary</span>
                  </div>
                }
                className="rounded-xl shadow-lg border-0 h-full"
              >
                {analytics?.bottlenecks?.topDivisionBottlenecks?.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {analytics.bottlenecks.topDivisionBottlenecks.map((div) => (
                      <div 
                        key={div.divisionId} 
                        className="p-3 md:p-4 rounded-xl bg-gradient-to-r from-[#faf8f5] to-[#f0ebe5] hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                          <span className="font-bold text-[#582f08] text-sm md:text-base">
                            {div.divisionName}
                          </span>
                          <Badge 
                            count={div.documentCount} 
                            style={{ backgroundColor: '#582f08' }}
                            showZero
                          />
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs md:text-sm mb-1">
                            <span className="text-gray-600">Hold Time</span>
                            <span className="font-bold text-[#ce6d11]">
                              {formatDaysAndHours(div.avgHoldTimeDays)}
                            </span>
                          </div>
                          <Progress
                            percent={Math.min((div.avgHoldTimeDays / 10) * 100, 100)}
                            strokeColor={{
                              '0%': div.avgHoldTimeDays > 7 ? '#e74c3c' : '#ce6d11',
                              '100%': div.avgHoldTimeDays > 7 ? '#c0392b' : '#582f08',
                            }}
                            trailColor="#e4c8ad"
                            showInfo={false}
                            strokeWidth={8}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No data" />
                )}
              </Card>
            </Col>
          </Row>
          <Card
            title={
              <div className="flex items-center gap-2">
                <FaUsers className="text-[#ce6d11]" />
                <span className="text-[#582f08] font-bold text-sm md:text-base">Staff Bottlenecks</span>
              </div>
            }
            className="rounded-xl shadow-lg border-0"
          >
            {analytics?.bottlenecks?.topUserBottlenecks?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  columns={bottleneckColumns}
                  dataSource={analytics.bottlenecks.topUserBottlenecks.slice(0, 10)}
                  rowKey="userId"
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  size="small"
                  scroll={{ x: 600 }}
                  rowClassName={(_, index) =>
                    `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                  }
                />
              </div>
            ) : (
              <Empty description="No bottlenecks detected" />
            )}
          </Card>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-1 md:gap-2 px-1 md:px-3 py-1">
          <FaTrophy className="text-[#ce6d11] text-sm md:text-base" />
          <span className="font-medium text-xs md:text-sm">Productivity</span>
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card className="rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border-0 mb-4 md:mb-6">
              <Row gutter={[8, 16]}>
                <Col xs={8} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Top Performers</span>}
                    value={analytics?.productivity?.topPerformers?.length || 0}
                    valueStyle={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<FaTrophy className="hidden md:inline" />}
                  />
                </Col>
                <Col xs={8} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Avg Docs/Person</span>}
                    value={
                      analytics?.productivity?.allMetrics?.length > 0
                        ? (analytics.productivity.allMetrics.reduce((sum, m) => sum + m.metrics.uniqueDocumentsHandled, 0) / analytics.productivity.allMetrics.length).toFixed(1)
                        : 0
                    }
                    valueStyle={{ color: '#ce6d11', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<FaFileAlt className="hidden md:inline" />}
                  />
                </Col>
                <Col xs={8} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium text-xs md:text-sm">Avg Response</span>}
                    value={
                      analytics?.productivity?.allMetrics?.length > 0
                        ? (analytics.productivity.allMetrics.reduce((sum, m) => sum + m.metrics.averageResponseTimeDays, 0) / analytics.productivity.allMetrics.length).toFixed(1)
                        : 0
                    }
                    suffix="days"
                    valueStyle={{ color: '#582f08', fontWeight: 'bold', fontSize: '1.2rem' }}
                    prefix={<FaClock className="hidden md:inline" />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-[#ce6d11]" />
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Top Performers</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 mb-4 md:mb-6"
            >
              {analytics?.productivity?.topPerformers?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    columns={productivityColumns}
                    dataSource={analytics.productivity.topPerformers.slice(0, 10)}
                    rowKey="userId"
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    size="small"
                    scroll={{ x: 600 }}
                    rowClassName={(_, index) =>
                      `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                    }
                  />
                </div>
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-[#ce6d11]" />
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Department Performance</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              {analytics?.productivity?.departmentAverages?.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {analytics.productivity.departmentAverages.slice(0, 6).map((dept) => (
                    <Col xs={12} sm={12} lg={8} key={dept.departmentName}>
                      <div className="p-3 md:p-5 rounded-xl bg-gradient-to-br from-white to-[#faf8f5] border border-[#e4c8ad] hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                          <span className="font-bold text-[#582f08] text-xs md:text-sm">
                            {dept.departmentName}
                          </span>
                          <Badge 
                            count={dept.userCount} 
                            style={{ backgroundColor: '#582f08' }}
                            title="Staff Count"
                          />
                        </div>
                        <div className="text-center mb-2 md:mb-3">
                          <div className="text-2xl md:text-4xl font-bold text-[#ce6d11]">
                            {dept.avgProductivityScore.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Score</div>
                        </div>
                        <Divider className="my-2 md:my-3 border-[#e4c8ad]" />
                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Docs:</span>
                            <span className="font-semibold text-[#582f08]">
                              {dept.avgDocumentsHandled.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Response:</span>
                            <span className="font-semibold text-[#582f08]">
                              {dept.avgResponseTimeHours.toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-1 md:gap-2 px-1 md:px-3 py-1">
          <FaFileAlt className="text-[#ce6d11] text-sm md:text-base" />
          <span className="font-medium text-xs md:text-sm">Status</span>
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 md:h-8 bg-gradient-to-b from-[#582f08] to-[#ce6d11] rounded"></div>
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Status Distribution</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              <div className="h-64 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={index} id={`statusGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={statusChartData.length > 0 ? statusChartData : [{ status: 'No Data', count: 1 }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) =>
                        `${status} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(statusChartData.length > 0 ? statusChartData : [{ status: 'No Data', count: 1 }]).map(
                        (entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#statusGradient${index % COLORS.length})`}
                            stroke="white"
                            strokeWidth={2}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4c8ad',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 md:h-8 bg-gradient-to-b from-[#ce6d11] to-[#582f08] rounded"></div>
                  <span className="text-[#582f08] font-bold text-sm md:text-base">Type Distribution</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              <div className="h-64 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={index} id={`typeGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={typeChartData.length > 0 ? typeChartData : [{ type: 'No Data', count: 1 }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="type"
                      label={({ type, percent }) =>
                        `${type} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(typeChartData.length > 0 ? typeChartData : [{ type: 'No Data', count: 1 }]).map(
                        (entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#typeGradient${index % COLORS.length})`}
                            stroke="white"
                            strokeWidth={2}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4c8ad',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 md:mb-6">
            <div>
              <Title level={1} className="text-[#582f08] mb-2 text-xl md:text-2xl lg:text-[2.5rem]" style={{ fontWeight: 700 }}>
                Performance Dashboard
              </Title>
              <Text className="text-gray-600 text-sm md:text-base">
                {user?.division?.divisionName 
                  ? `Division: ${user.division.divisionName} • Comprehensive insights into document processing and staff productivity`
                  : 'Comprehensive insights into document processing and staff productivity'
                }
              </Text>
            </div>
            <div className="bg-white rounded-xl shadow-md p-3 md:p-4 border border-[#e4c8ad] w-full md:w-auto">
              <Space className="flex-wrap">
                <FaCalendarAlt className="text-[#ce6d11]" />
                <RangePicker
                  defaultValue={[dayjs().subtract(30, 'days'), dayjs()]}
                  onChange={handleDateRangeChange}
                  size="middle"
                  className="border-[#e4c8ad] w-full md:w-auto"
                />
              </Space>
            </div>
          </div>
          <Divider className="my-4 md:my-6 border-[#e4c8ad]" />
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-4 md:mb-8">
          {[
            {
              icon: <GiSandsOfTime className="text-2xl md:text-4xl" />,
              title: 'Avg Turnaround Time',
              value: analytics?.turnaround?.averageTurnaroundDays ? formatDaysAndHours(analytics.turnaround.averageTurnaroundDays) : '0',
              suffix: '',
              subtitle: `${analytics?.turnaround?.totalDocuments || 0} documents analyzed`,
              color: '#582f08',
              bgGradient: 'from-[#582f08]/10 to-[#582f08]/5',
            },
            {
              icon: <FaExclamationTriangle className="text-2xl md:text-4xl" />,
              title: 'Active Bottlenecks',
              value: analytics?.bottlenecks?.topUserBottlenecks?.filter(u => u.avgHoldTimeDays > 3).length || 0,
              suffix: 'staff',
              subtitle: 'Delays exceeding 3 days',
              color: '#e74c3c',
              bgGradient: 'from-red-100 to-red-50',
            },
            {
              icon: <FaTrophy className="text-2xl md:text-4xl" />,
              title: 'Top Performers',
              value: analytics?.productivity?.topPerformers?.length || 0,
              suffix: 'staff',
              subtitle: 'Highest productivity scores',
              color: '#27ae60',
              bgGradient: 'from-green-100 to-green-50',
            },
            {
              icon: <FaFileAlt className="text-2xl md:text-4xl" />,
              title: 'Total Documents',
              value: analytics?.distribution?.totalDocuments || 0,
              suffix: 'docs',
              subtitle: 'In selected period',
              color: '#ce6d11',
              bgGradient: 'from-[#ce6d11]/10 to-[#ce6d11]/5',
            },
          ].map((card, index) => (
            <Col key={index} xs={12} sm={12} lg={6}>
              <Card 
                className="rounded-xl shadow-lg border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                bodyStyle={{ padding: 0 }}
              >
                <div className={`bg-gradient-to-br ${card.bgGradient} p-4 md:p-6`}>
                  <div style={{ color: card.color }} className="mb-2 md:mb-4">
                    {card.icon}
                  </div>
                  <Text className="text-gray-600 text-xs md:text-sm font-medium block mb-1 md:mb-2">
                    {card.title}
                  </Text>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <Title 
                      level={2} 
                      className="m-0 text-lg md:text-2xl lg:text-[2rem]" 
                      style={{ 
                        color: card.color,
                        fontWeight: 700 
                      }}
                    >
                      {card.value}
                    </Title>
                    <Text className="text-gray-500 font-medium text-xs md:text-sm">{card.suffix}</Text>
                  </div>
                  <Text className="text-xs text-gray-500 mt-1 md:mt-2 block hidden md:inline">{card.subtitle}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tabs */}
        <Card className="rounded-xl shadow-lg border-0">
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            size="large"
            tabBarStyle={{
              borderBottom: '2px solid #e4c8ad',
              marginBottom: 24,
              fontWeight: 600,
            }}
          />
        </Card>
      </div>

      <style jsx global>{`
        .ant-tabs-tab {
          padding: 8px 12px;
          transition: all 0.3s;
        }
        .ant-tabs-tab:hover {
          color: #ce6d11 !important;
        }
        .ant-tabs-tab-active {
          background: linear-gradient(135deg, #f8f3ed 0%, #f0ebe5 100%);
          border-radius: 8px 8px 0 0;
        }
        .ant-tabs-ink-bar {
          background: linear-gradient(90deg, #582f08 0%, #ce6d11 100%);
          height: 3px !important;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f3ed 0%, #f0ebe5 100%);
          color: #582f08;
          font-weight: 600;
          border-bottom: 2px solid #e4c8ad;
          padding: 10px 8px;
          font-size: 11px;
        }
        .ant-table-tbody > tr > td {
          padding: 10px 8px;
          border-bottom: 1px solid #f0ebe5;
          font-size: 12px;
        }
        .ant-picker {
          border-radius: 8px;
          border-color: #e4c8ad;
        }
        .ant-picker-focused {
          border-color: #ce6d11;
          box-shadow: 0 0 0 2px rgba(206, 109, 17, 0.1);
        }
        @media (min-width: 768px) {
          .ant-tabs-tab {
            padding: 12px 16px;
          }
          .ant-table-thead > tr > th {
            padding: 16px;
            font-size: 14px;
          }
          .ant-table-tbody > tr > td {
            padding: 16px;
            font-size: 14px;
          }
        }
        @media (max-width: 640px) {
          .ant-tabs-nav-list {
            flex-wrap: wrap;
          }
          .ant-tabs-tab {
            padding: 6px 8px;
            margin: 0 4px 4px 0 !important;
          }
        }
      `}</style>

      {/* Trail Modal */}
      <Trail
        trails={trailData?.data?.trails}
        open={trailModalOpen}
        handleCancel={handleCloseTrailModal}
        loading={isTrailLoading}
      />
    </div>
  );
};

export default AdvancedAnalytics;
