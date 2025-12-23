import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Spin,
  Select,
  Divider,
  Empty,
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
import { GiMoneyStack, GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { FaChartBar, FaUsers, FaBuilding } from 'react-icons/fa';
import { useBudgetAnalytics, useAllDivisions } from '../queryHooks/analytics';

const { Title, Text } = Typography;

const COLORS = ['#582f08', '#ce6d11', '#e4c8ad', '#8B4513', '#D2691E', '#DEB887', '#A0522D', '#CD853F'];

const Analytics = () => {
  const [selectedDivision, setSelectedDivision] = React.useState(undefined);

  const { data: divisionsData } = useAllDivisions();
  const { data: analyticsData, isLoading } = useBudgetAnalytics(selectedDivision);

  // Handle both array response and potential error object from backend
  const divisionsResponse = divisionsData?.data;
  const divisions = Array.isArray(divisionsResponse) ? divisionsResponse : [];
  // Backend returns { data: { approvedBudget, totalMoneySpent, balance, spendingPerBudgets, ... } }
  const analytics = analyticsData?.data?.data || analyticsData?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spin size="large" />
        <Text className="mt-4 text-[#582f08] text-lg">Loading analytics...</Text>
      </div>
    );
  }

  // Backend returns spendingPerBudgets with { name, budget, spending }
  const departmentChartData = analytics?.spendingPerBudgets?.slice(0, 10).map((item) => ({
    name: item.name?.substring(0, 15) || 'Unknown',
    budget: item.budget || 0,
    spent: item.spending || 0,
  })) || [];

  const spendingDistribution = analytics?.spending?.slice(0, 8).map((item) => ({
    name: item.name?.substring(0, 20) || 'Unknown',
    value: item.spending || 0,
  })) || [];

  const topSpendersColumns = [
    {
      title: <span className="font-semibold text-[#582f08]">Name</span>,
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ce6d11] to-[#582f08] flex items-center justify-center text-white font-bold">
            <FaBuilding />
          </div>
          <div>
            <div className="font-semibold text-[#582f08]">{record.name}</div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-[#582f08]">Approved Budget</span>,
      dataIndex: 'budget',
      key: 'budget',
      render: (val) => (
        <span className="font-medium text-[#27ae60]">
          GHS {(val || 0).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.budget - b.budget,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Amount Spent</span>,
      dataIndex: 'spending',
      key: 'spending',
      render: (val) => (
        <span className="font-medium text-[#ce6d11]">
          GHS {(val || 0).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.spending - b.spending,
    },
    {
      title: <span className="font-semibold text-[#582f08]">Utilization</span>,
      key: 'utilization',
      render: (_, record) => {
        const utilization = record.budget > 0
          ? ((record.spending / record.budget) * 100).toFixed(1)
          : 0;
        const getColor = () => {
          if (utilization > 90) return '#e74c3c';
          if (utilization > 70) return '#ce6d11';
          return '#27ae60';
        };
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(utilization, 100)}%`,
                  backgroundColor: getColor(),
                }}
              />
            </div>
            <span className="font-bold text-sm" style={{ color: getColor() }}>
              {utilization}%
            </span>
          </div>
        );
      },
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
                Budget Analytics
              </Title>
              <Text className="text-gray-600 text-base">
                Comprehensive overview of budget allocation and spending patterns
              </Text>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border border-[#e4c8ad]">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-[#ce6d11]" />
                <Select
                  placeholder="Select Division"
                  allowClear
                  style={{ width: 220 }}
                  onChange={setSelectedDivision}
                  value={selectedDivision}
                  size="large"
                  options={divisions.map((div) => ({
                    label: div.divisionName,
                    value: div.divisionId,
                  }))}
                />
              </div>
            </div>
          </div>
          <Divider className="my-6 border-[#e4c8ad]" />
        </div>

        {/* Summary Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          {[
            {
              icon: <GiMoneyStack className="text-4xl" />,
              title: 'Approved Budget',
              value: analytics?.approvedBudget || 0,
              prefix: 'GHS',
              color: '#27ae60',
              bgGradient: 'from-green-100 to-green-50',
            },
            {
              icon: <GiPayMoney className="text-4xl" />,
              title: 'Total Spent',
              value: analytics?.totalMoneySpent || 0,
              prefix: 'GHS',
              color: '#ce6d11',
              bgGradient: 'from-[#ce6d11]/10 to-[#ce6d11]/5',
            },
            {
              icon: <GiReceiveMoney className="text-4xl" />,
              title: 'Balance',
              value: analytics?.balance || 0,
              prefix: 'GHS',
              color: '#582f08',
              bgGradient: 'from-[#582f08]/10 to-[#582f08]/5',
            },
          ].map((card, index) => (
            <Col key={index} xs={24} sm={24} lg={8}>
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
                    <Text className="text-gray-500 font-medium">{card.prefix}</Text>
                    <Title
                      level={2}
                      className="m-0"
                      style={{
                        color: card.color,
                        fontSize: '2rem',
                        fontWeight: 700,
                      }}
                    >
                      {card.value.toLocaleString()}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={14}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-[#ce6d11]" />
                  <span className="text-[#582f08] font-bold">Budget vs Spending by Department</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              {departmentChartData.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#27ae60" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#27ae60" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ce6d11" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#ce6d11" stopOpacity={0.6} />
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
                      <YAxis
                        stroke="#582f08"
                        tick={{ fontSize: 12, fill: '#582f08' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip
                        formatter={(value) => [`GHS ${value.toLocaleString()}`, '']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e4c8ad',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar
                        dataKey="budget"
                        fill="url(#budgetGradient)"
                        name="Approved Budget"
                        radius={[8, 8, 0, 0]}
                        barSize={30}
                      />
                      <Bar
                        dataKey="spent"
                        fill="url(#spentGradient)"
                        name="Amount Spent"
                        radius={[8, 8, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty description="No budget data available" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#582f08] to-[#ce6d11] rounded"></div>
                  <span className="text-[#582f08] font-bold">Spending Distribution</span>
                </div>
              }
              className="rounded-xl shadow-lg border-0"
            >
              {spendingDistribution.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={spendingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {spendingDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient${index % COLORS.length})`}
                            stroke="white"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`GHS ${value.toLocaleString()}`, 'Spent']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e4c8ad',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
              ) : (
                <Empty description="No spending data available" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Top Spenders Table */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FaUsers className="text-[#ce6d11]" />
              <span className="text-[#582f08] font-bold">Budget Overview</span>
            </div>
          }
          className="rounded-xl shadow-lg border-0"
        >
          {analytics?.spendingPerBudgets?.length > 0 ? (
            <Table
              columns={topSpendersColumns}
              dataSource={analytics.spendingPerBudgets}
              rowKey="name"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              rowClassName={(_, index) =>
                `${index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'} hover:bg-[#f0ebe5] transition-colors`
              }
            />
          ) : (
            <Empty description="No budget data available" />
          )}
        </Card>
      </div>

      <style jsx global>{`
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
        .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e4c8ad !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: #ce6d11 !important;
          box-shadow: 0 0 0 2px rgba(206, 109, 17, 0.1) !important;
        }
        .ant-select-dropdown .ant-select-item {
          color: #582f08 !important;
        }
        .ant-select-dropdown .ant-select-item-option-content {
          color: #582f08 !important;
        }
        .ant-select-dropdown .ant-select-item-option-active {
          background-color: #f8f3ed !important;
        }
        .ant-select-dropdown .ant-select-item-option-selected {
          background-color: #e4c8ad !important;
          color: #582f08 !important;
        }
      `}</style>
    </div>
  );
};

export default Analytics;
