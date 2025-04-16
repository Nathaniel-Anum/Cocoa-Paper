import React from 'react';
import { Layout, Card, Row, Col, Typography, Table } from 'antd';
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
} from 'recharts';
import { FaDollarSign, FaChartBar, FaBalanceScale } from 'react-icons/fa';

const { Header, Content } = Layout;
const { Title } = Typography;

// Mock data - replace with real data
const budgetData = {
  approved: 1000000,
  spent: 750000,
  balance: 250000,
};

const departmentSpending = [
  { name: 'BOD', spent: 200000, budget: 250000 },
  { name: 'CHED', spent: 180000, budget: 200000 },
  { name: 'SPD', spent: 220000, budget: 300000 },
  { name: 'CRIG', spent: 150000, budget: 250000 },
];

const topSpenders = [
  { department: 'Finance', amount: 200000, percentage: 26.67 },
  { department: 'IT', amount: 180000, percentage: 24 },
  { department: 'Research', amount: 220000, percentage: 29.33 },
  { department: 'Public Affairs', amount: 150000, percentage: 20 },
];

const COLORS = ['#e4c8ad', '#ce6d11', '#582f08', '#ce6d11'];

function Analytics() {
  const columns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Amount Spent',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Percentage of Total',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#e4c8ad]/10">
      {/* <Header className="bg-[#582f08] shadow-md">
        <Title level={2} className="text-center py-4 text-white">Budget Analytics Dashboard</Title>
      </Header> */}
      <Content className="p-6">
        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}>
            <Card className="shadow-sm">
              <div className="flex items-center">
                <FaDollarSign className="text-2xl text-[#ce6d11] mr-2" />
                <div>
                  <p className="text-[#582f08]">Approved Budget</p>
                  <Title level={3} className="text-[#582f08]">
                    ¢{budgetData.approved.toLocaleString()}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="shadow-sm">
              <div className="flex items-center">
                <FaChartBar className="text-2xl text-[#ce6d11] mr-2" />
                <div>
                  <p className="text-[#582f08]">Total Spent</p>
                  <Title level={3} className="text-[#582f08]">
                    ¢{budgetData.spent.toLocaleString()}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="shadow-sm">
              <div className="flex items-center">
                <FaBalanceScale className="text-2xl text-[#ce6d11] mr-2" />
                <div>
                  <p className="text-[#582f08]">Balance</p>
                  <Title level={3} className="text-[#582f08]">
                    ¢{budgetData.balance.toLocaleString()}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={16}>
            <Card
              title="Budget vs Spending by Department"
              className="shadow-sm"
              headStyle={{ color: '#582f08' }}
            >
              <BarChart
                width={700}
                height={300}
                data={departmentSpending}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4c8ad" />
                <XAxis dataKey="name" stroke="#582f08" />
                <YAxis stroke="#582f08" />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#582f08" name="Budget" />
                <Bar dataKey="spent" fill="#ce6d11" name="Spent" />
              </BarChart>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Spending Distribution"
              className="shadow-sm"
              headStyle={{ color: '#582f08' }}
            >
              <PieChart width={300} height={300}>
                <Pie
                  data={topSpenders}
                  cx={150}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {topSpenders.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </Col>
        </Row>

        {/* Top Spenders Table */}
        <Card
          title="Top Spenders by Department"
          className="mb-6 shadow-sm"
          headStyle={{ color: '#582f08' }}
        >
          <Table
            columns={columns}
            dataSource={topSpenders}
            pagination={false}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default Analytics;
