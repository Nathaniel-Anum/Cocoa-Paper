import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Typography, Table, Select, Form } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { FaDollarSign, FaChartBar, FaBalanceScale } from 'react-icons/fa';
import { GiCash, GiMoneyStack } from 'react-icons/gi';
import { useGetAnalytics } from '../queryHooks/analytics';
import { useGetDivisions } from '../queryHooks/user';

const { Header, Content } = Layout;
const { Title } = Typography;

const COLORS = ['#e4c8ad', '#ce6d11', '#582f08', '#ce6d11'];

// Currency formatter for the Y-axis
const currencyFormatter = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('$', '¢');
};

function Analytics() {
  const { data: divisions } = useGetDivisions();
  const bod = divisions?.data.find(
    (division) => division.divisionName === 'COCOBOD'
  );

  const [selectedDivision, setSelectedDivision] = useState('');
  const { data: analytics, refetch } = useGetAnalytics({
    divisionId: selectedDivision || bod?.divisionId,
  });

  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [refetch, selectedDivision]);

  const columns = [
    {
      title: 'Department',
      dataIndex: 'name',
      key: 'department',
    },
    {
      title: 'Amount Spent',
      dataIndex: 'spending',
      key: 'amount',
      render: (spending) => `¢${spending.toLocaleString('en-US')}`,
    },
    {
      title: 'Percentage of Total',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
    },
  ];

  return (
    <div className="min-h-screen ">
      <Content className="p-6  mx-auto">
        {/* Summary Cards */}
        <div className="flex justify-end mb-6">
          <Select
            placeholder="Filter by division"
            allowClear
            className="w-48"
            options={divisions?.data?.map((division) => ({
              label: division.divisionName,
              value: division.divisionId,
            }))}
            onChange={(value) => setSelectedDivision(value)}
            onClear={() => setSelectedDivision('')}
          />
        </div>

        <Row gutter={[24, 24]} className="mb-8">
          {[
            {
              icon: <GiMoneyStack className="text-2xl text-[#ce6d11] mr-3" />,
              title: 'Approved Budget',
              value: analytics?.data?.data?.approvedBudget,
            },
            {
              icon: <FaChartBar className="text-2xl text-[#ce6d11] mr-3" />,
              title: 'Total Spent',
              value: analytics?.data?.data?.totalMoneySpent,
            },
            {
              icon: <FaBalanceScale className="text-2xl text-[#ce6d11] mr-3" />,
              title: 'Balance',
              value: analytics?.data?.data?.balance,
            },
          ].map((card, index) => (
            <Col key={index} xs={24} sm={12} lg={8}>
              <Card className="shadow-sm border-0 bg-white rounded-lg h-full">
                <div className="flex items-center h-full">
                  {card.icon}
                  <div>
                    <p className="text-[#582f08] text-sm font-medium mb-1">
                      {card.title}
                    </p>
                    <Title level={3} className="text-[#582f08] m-0">
                      ¢{card.value?.toLocaleString('en-US') || '0'}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={16}>
            <Card
              title="Budget vs Spending by Department"
              className="shadow-sm border-0 bg-white"
              headStyle={{
                color: '#582f08',
                borderBottom: '1px solid #e4c8ad',
                fontWeight: 500,
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.data?.data?.spendingPerBudgets}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e4c8ad"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#582f08"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#582f08"
                      tickFormatter={currencyFormatter}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `¢${value.toLocaleString('en-US')}`,
                        '',
                      ]}
                      labelStyle={{ color: '#582f08' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="budget"
                      fill="#582f08"
                      name="Budget"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="spending"
                      fill="#ce6d11"
                      name="Spent"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="Spending Distribution"
              className="shadow-sm border-0 bg-white"
              headStyle={{
                color: '#582f08',
                borderBottom: '1px solid #e4c8ad',
                fontWeight: 500,
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div className="h-80 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={
                        analytics?.data?.data?.spending?.length
                          ? analytics.data.data.spending
                          : [{ name: 'No Data', spending: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={3}
                      dataKey="spending"
                      isAnimationActive={true}
                      label={({ name, percent }) =>
                        name === 'No Data'
                          ? name
                          : `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(analytics?.data?.data?.spending?.length
                        ? analytics.data.data.spending
                        : [{ name: 'No Data', spending: 1 }]
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length] || '#e4c8ad'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `¢${value.toLocaleString('en-US')}`,
                        '',
                      ]}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Top Spenders Table */}
        <Card
          title="Top Spenders by Department"
          className="shadow-sm border-0 bg-white"
          headStyle={{
            color: '#582f08',
            borderBottom: '1px solid #e4c8ad',
            fontWeight: 500,
          }}
        >
          <Table
            columns={columns}
            dataSource={
              analytics?.data?.data?.topSpenders?.map((item) => ({
                ...item,
                key: item._id,
              })) || []
            }
            pagination={false}
            className="ant-table-striped"
            rowClassName={(record, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#f8f3ed]'
            }
          />
        </Card>
      </Content>
    </div>
  );
}

export default Analytics;
