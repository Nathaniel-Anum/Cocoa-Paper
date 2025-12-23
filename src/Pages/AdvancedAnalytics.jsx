import React, { useState } from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: () => getDashboardData(filters),
    refetchInterval: 60000,
  });

  const analytics = data?.data;

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

  const bottleneckChartData = analytics?.bottlenecks?.topDepartmentBottlenecks?.slice(0, 8).map((dept) => ({
    name: dept.departmentName?.substring(0, 12) || 'Unknown',
    holdTime: parseFloat(dept.avgHoldTimeDays.toFixed(1)),
    documents: dept.documentCount,
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
            {record.metrics.averageResponseTimeDays.toFixed(1)}d
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
            {record.avgHoldTimeDays.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">days</span>
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
            {record.turnaroundDays.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">days</span>
        </div>
      ),
      sorter: (a, b) => a.turnaroundDays - b.turnaroundDays,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Steps</span>,
      dataIndex: 'stepsCount',
      key: 'steps',
      render: (val) => (
        <Badge count={val} style={{ backgroundColor: '#582f08' }} />
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2 px-3 py-1">
          <FaClock className="text-[#ce6d11]" />
          <span className="font-medium">Turnaround Analysis</span>
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-0 mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Average Turnaround</span>}
                    value={analytics?.turnaround?.averageTurnaroundDays?.toFixed(1) || 0}
                    suffix="days"
                    valueStyle={{ color: '#ce6d11', fontWeight: 'bold' }}
                    prefix={<GiSandsOfTime />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Fastest Processing</span>}
                    value={analytics?.turnaround?.fastest?.[0]?.turnaroundDays?.toFixed(1) || 'N/A'}
                    suffix={analytics?.turnaround?.fastest?.[0] ? 'days' : ''}
                    valueStyle={{ color: '#27ae60', fontWeight: 'bold' }}
                    prefix={<AiOutlineRise />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Slowest Processing</span>}
                    value={analytics?.turnaround?.slowest?.[0]?.turnaroundDays?.toFixed(1) || 'N/A'}
                    suffix={analytics?.turnaround?.slowest?.[0] ? 'days' : ''}
                    valueStyle={{ color: '#e74c3c', fontWeight: 'bold' }}
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
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded"></div>
                  <span className="text-[#582f08] font-bold">Fastest Processing</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow"
            >
              {analytics?.turnaround?.fastest?.length > 0 ? (
                <Table
                  columns={turnaroundColumns}
                  dataSource={analytics.turnaround.fastest}
                  rowKey="docID"
                  pagination={false}
                  size="small"
                  rowClassName={(_, index) =>
                    `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                  }
                />
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded"></div>
                  <span className="text-[#582f08] font-bold">Slowest Processing</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow"
            >
              {analytics?.turnaround?.slowest?.length > 0 ? (
                <Table
                  columns={turnaroundColumns}
                  dataSource={analytics.turnaround.slowest}
                  rowKey="docID"
                  pagination={false}
                  size="small"
                  rowClassName={(_, index) =>
                    `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                  }
                />
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
        <span className="flex items-center gap-2 px-3 py-1">
          <FaExclamationTriangle className="text-[#ce6d11]" />
          <span className="font-medium">Bottleneck Analysis</span>
        </span>
      ),
      children: (
        <div>
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-[#ce6d11]" />
                    <span className="text-[#582f08] font-bold">Department Hold Times</span>
                  </div>
                }
                className="rounded-xl shadow-lg border-0"
              >
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bottleneckChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
                        tick={{ fontSize: 11, fill: '#582f08' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#582f08" tick={{ fontSize: 12, fill: '#582f08' }} />
                      <RechartsTooltip
                        formatter={(value, name) => [
                          name === 'holdTime' ? `${value} days` : `${value} docs`,
                          name === 'holdTime' ? 'Hold Time' : 'Documents',
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e4c8ad',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar 
                        dataKey="holdTime" 
                        fill="url(#holdTimeGradient)" 
                        name="Avg Hold (days)" 
                        radius={[8, 8, 0, 0]}
                        barSize={35}
                      />
                      <Bar 
                        dataKey="documents" 
                        fill="url(#docGradient)" 
                        name="Documents" 
                        radius={[8, 8, 0, 0]}
                        barSize={35}
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
                    <span className="text-[#582f08] font-bold">Division Summary</span>
                  </div>
                }
                className="rounded-xl shadow-lg border-0 h-full"
              >
                {analytics?.bottlenecks?.topDivisionBottlenecks?.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.bottlenecks.topDivisionBottlenecks.map((div) => (
                      <div 
                        key={div.divisionId} 
                        className="p-4 rounded-xl bg-gradient-to-r from-[#faf8f5] to-[#f0ebe5] hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-[#582f08] text-base">
                            {div.divisionName}
                          </span>
                          <Badge 
                            count={div.documentCount} 
                            style={{ backgroundColor: '#582f08' }}
                            showZero
                          />
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Hold Time</span>
                            <span className="font-bold text-[#ce6d11]">
                              {div.avgHoldTimeDays.toFixed(1)} days
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
                            strokeWidth={10}
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
                <span className="text-[#582f08] font-bold">Staff Bottlenecks</span>
              </div>
            }
            className="rounded-xl shadow-lg border-0"
          >
            {analytics?.bottlenecks?.topUserBottlenecks?.length > 0 ? (
              <Table
                columns={bottleneckColumns}
                dataSource={analytics.bottlenecks.topUserBottlenecks.slice(0, 10)}
                rowKey="userId"
                pagination={{ pageSize: 5, showSizeChanger: false }}
                rowClassName={(_, index) =>
                  `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                }
              />
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
        <span className="flex items-center gap-2 px-3 py-1">
          <FaTrophy className="text-[#ce6d11]" />
          <span className="font-medium">Staff Productivity</span>
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card className="rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border-0 mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Top Performers</span>}
                    value={analytics?.productivity?.topPerformers?.length || 0}
                    valueStyle={{ color: '#27ae60', fontWeight: 'bold' }}
                    prefix={<FaTrophy />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Avg Documents/Person</span>}
                    value={
                      analytics?.productivity?.allMetrics?.length > 0
                        ? (analytics.productivity.allMetrics.reduce((sum, m) => sum + m.metrics.uniqueDocumentsHandled, 0) / analytics.productivity.allMetrics.length).toFixed(1)
                        : 0
                    }
                    valueStyle={{ color: '#ce6d11', fontWeight: 'bold' }}
                    prefix={<FaFileAlt />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={<span className="text-[#582f08] font-medium">Avg Response Time</span>}
                    value={
                      analytics?.productivity?.allMetrics?.length > 0
                        ? (analytics.productivity.allMetrics.reduce((sum, m) => sum + m.metrics.averageResponseTimeDays, 0) / analytics.productivity.allMetrics.length).toFixed(1)
                        : 0
                    }
                    suffix="days"
                    valueStyle={{ color: '#582f08', fontWeight: 'bold' }}
                    prefix={<FaClock />}
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
                  <span className="text-[#582f08] font-bold">Top Performers</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0 mb-6"
            >
              {analytics?.productivity?.topPerformers?.length > 0 ? (
                <Table
                  columns={productivityColumns}
                  dataSource={analytics.productivity.topPerformers.slice(0, 10)}
                  rowKey="userId"
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  rowClassName={(_, index) =>
                    `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
                  }
                />
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
                  <span className="text-[#582f08] font-bold">Department Performance Overview</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              {analytics?.productivity?.departmentAverages?.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {analytics.productivity.departmentAverages.slice(0, 6).map((dept) => (
                    <Col xs={24} sm={12} lg={8} key={dept.departmentName}>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-white to-[#faf8f5] border border-[#e4c8ad] hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-bold text-[#582f08] text-sm">
                            {dept.departmentName}
                          </span>
                          <Badge 
                            count={dept.userCount} 
                            style={{ backgroundColor: '#582f08' }}
                            title="Staff Count"
                          />
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-4xl font-bold text-[#ce6d11]">
                            {dept.avgProductivityScore.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Productivity Score</div>
                        </div>
                        <Divider className="my-3 border-[#e4c8ad]" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Docs/Person:</span>
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
        <span className="flex items-center gap-2 px-3 py-1">
          <FaFileAlt className="text-[#ce6d11]" />
          <span className="font-medium">Document Status</span>
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#582f08] to-[#ce6d11] rounded"></div>
                  <span className="text-[#582f08] font-bold">Status Distribution</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              <div className="h-96">
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
                      outerRadius={120}
                      innerRadius={75}
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
                            strokeWidth={3}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4c8ad',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px' }}
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
                  <div className="w-2 h-8 bg-gradient-to-b from-[#ce6d11] to-[#582f08] rounded"></div>
                  <span className="text-[#582f08] font-bold">Type Distribution</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              <div className="h-96">
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
                      outerRadius={120}
                      innerRadius={75}
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
                            strokeWidth={3}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4c8ad',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px' }}
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
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Title level={1} className="text-[#582f08] mb-2" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                Performance Dashboard
              </Title>
              <Text className="text-gray-600 text-base">
                Comprehensive insights into document processing and staff productivity
              </Text>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border border-[#e4c8ad]">
              <Space>
                <FaCalendarAlt className="text-[#ce6d11]" />
                <RangePicker
                  defaultValue={[dayjs().subtract(30, 'days'), dayjs()]}
                  onChange={handleDateRangeChange}
                  size="large"
                  className="border-[#e4c8ad]"
                />
              </Space>
            </div>
          </div>
          <Divider className="my-6 border-[#e4c8ad]" />
        </div>

        {/* Summary Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          {[
            {
              icon: <GiSandsOfTime className="text-4xl" />,
              title: 'Avg Turnaround Time',
              value: `${analytics?.turnaround?.averageTurnaroundDays?.toFixed(1) || 0}`,
              suffix: 'days',
              subtitle: `${analytics?.turnaround?.totalDocuments || 0} documents analyzed`,
              color: '#582f08',
              bgGradient: 'from-[#582f08]/10 to-[#582f08]/5',
            },
            {
              icon: <FaExclamationTriangle className="text-4xl" />,
              title: 'Active Bottlenecks',
              value: analytics?.bottlenecks?.topUserBottlenecks?.filter(u => u.avgHoldTimeDays > 3).length || 0,
              suffix: 'staff',
              subtitle: 'Delays exceeding 3 days',
              color: '#e74c3c',
              bgGradient: 'from-red-100 to-red-50',
            },
            {
              icon: <FaTrophy className="text-4xl" />,
              title: 'Top Performers',
              value: analytics?.productivity?.topPerformers?.length || 0,
              suffix: 'staff',
              subtitle: 'Highest productivity scores',
              color: '#27ae60',
              bgGradient: 'from-green-100 to-green-50',
            },
            {
              icon: <FaFileAlt className="text-4xl" />,
              title: 'Total Documents',
              value: analytics?.distribution?.totalDocuments || 0,
              suffix: 'docs',
              subtitle: 'In selected period',
              color: '#ce6d11',
              bgGradient: 'from-[#ce6d11]/10 to-[#ce6d11]/5',
            },
          ].map((card, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card 
                className="rounded-xl shadow-lg border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                bodyStyle={{ padding: 0 }}
              >
                <div className={`bg-gradient-to-br ${card.bgGradient} p-6`}>
                  <div style={{ color: card.color }} className="mb-4">
                    {card.icon}
                  </div>
                  <Text className="text-gray-600 text-sm font-medium block mb-2">
                    {card.title}
                  </Text>
                  <div className="flex items-baseline gap-2">
                    <Title 
                      level={2} 
                      className="m-0" 
                      style={{ 
                        color: card.color,
                        fontSize: '2rem',
                        fontWeight: 700 
                      }}
                    >
                      {card.value}
                    </Title>
                    <Text className="text-gray-500 font-medium">{card.suffix}</Text>
                  </div>
                  <Text className="text-xs text-gray-500 mt-2 block">{card.subtitle}</Text>
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
          padding: 12px 16px;
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
          padding: 16px;
        }
        .ant-table-tbody > tr > td {
          padding: 16px;
          border-bottom: 1px solid #f0ebe5;
        }
        .ant-picker {
          border-radius: 8px;
          border-color: #e4c8ad;
        }
        .ant-picker-focused {
          border-color: #ce6d11;
          box-shadow: 0 0 0 2px rgba(206, 109, 17, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdvancedAnalytics;
