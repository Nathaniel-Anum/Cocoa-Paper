// import React, { useEffect, useState } from 'react';
// import { Layout, Card, Row, Col, Typography, Table, Select, Form } from 'antd';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import { FaDollarSign, FaChartBar, FaBalanceScale } from 'react-icons/fa';
// import { GiCash, GiMoneyStack } from 'react-icons/gi';
// import { useGetAnalytics } from '../queryHooks/analytics';

// import { useGetDivisions } from '../queryHooks/user';

// const { Header, Content } = Layout;
// const { Title } = Typography;

// const COLORS = ['#e4c8ad', '#ce6d11', '#582f08', '#ce6d11'];

// function Analytics() {
//   const { data: divisions } = useGetDivisions();

//   const bod = divisions?.data.find(
//     (division) => division.divisionName === 'COCOBOD'
//   );

//   const [selectedDivision, setSelectedDivision] = useState('');
//   const { data: analytics, refetch } = useGetAnalytics({
//     divisionId: selectedDivision || bod?.divisionId,
//   });

//   // const [topSpendersFilter, setTopSpendersFilter] = useState('');

//   useEffect(() => {
//     if (selectedDivision) {
//       refetch();
//     }
//   }, [refetch, selectedDivision]);

//   const columns = [
//     {
//       title: 'Department',
//       dataIndex: 'name',
//       key: 'department',
//     },
//     {
//       title: 'Amount Spent',
//       dataIndex: 'spending',
//       key: 'amount',
//       render: (spending) => `¢${spending.toLocaleString()}`,
//     },
//     {
//       title: 'Percentage of Total',
//       dataIndex: 'percentage',
//       key: 'percentage',
//       render: (percentage) => `${percentage}%`,
//     },
//   ];

//   return (
//     <Layout className="min-h-screen bg-[#e4c8ad]/10">
//       <Content className="p-6">
//         {/* Summary Cards */}
//         <div className="flex justify-end mb-2">
//           <Select
//             placeholder="Filter by division"
//             allowClear
//             style={{ width: 200 }}
//             options={divisions?.data.map((division) => ({
//               label: division.divisionName,
//               value: division.divisionId,
//             }))}
//             onChange={(value) => setSelectedDivision(value)}
//             onClear={() => setSelectedDivision('')}
//           />
//         </div>
//         <Row gutter={[16, 16]} className="mb-6">
//           <Col span={8}>
//             <Card className="shadow-sm">
//               <div className="flex items-center">
//                 <GiMoneyStack className="text-2xl text-[#ce6d11] mr-2" />
//                 <div>
//                   <p className="text-[#582f08]">Approved Budget</p>
//                   <Title level={3} className="text-[#582f08]">
//                     ¢
//                     {analytics &&
//                       analytics?.data?.data?.approvedBudget.toLocaleString()}
//                   </Title>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//           <Col span={8}>
//             <Card className="shadow-sm">
//               <div className="flex items-center">
//                 <div className="flex justify-between">
//                   <FaChartBar className="text-2xl text-[#ce6d11] mr-2" />
//                 </div>
//                 <div>
//                   <p className="text-[#582f08]">Total Spent</p>
//                   <Title level={3} className="text-[#582f08]">
//                     ¢
//                     {analytics &&
//                       analytics?.data?.data?.totalMoneySpent.toLocaleString()}
//                   </Title>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//           <Col span={8}>
//             <Card className="shadow-sm">
//               <div className="flex items-center">
//                 <FaBalanceScale className="text-2xl text-[#ce6d11] mr-2" />
//                 <div>
//                   <p className="text-[#582f08]">Balance</p>
//                   <Title level={3} className="text-[#582f08]">
//                     ¢
//                     {analytics &&
//                       analytics?.data?.data?.balance.toLocaleString()}
//                   </Title>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//         </Row>

//         {/* Charts Row */}
//         <Row gutter={[16, 16]} className="mb-6">
//           <Col span={16}>
//             <Card
//               title="Budget vs Spending by Department"
//               className="shadow-sm"
//               headStyle={{ color: '#582f08' }}
//             >
//               {/* <div className="flex justify-between "> */}
//               <BarChart
//                 width={700}
//                 height={300}
//                 data={analytics && analytics?.data?.data?.spendingPerBudgets}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e4c8ad" />
//                 <XAxis dataKey="name" stroke="#582f08" />
//                 <YAxis stroke="#582f08" />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="budget" fill="#582f08" name="Budget" />
//                 <Bar dataKey="spending" fill="#ce6d11" name="Spent" />
//               </BarChart>
//               {/* <Select placeholder="Search" className="w-[10rem]" /> */}
//               {/* </div> */}
//             </Card>
//           </Col>
//           <Col span={8}>
//             <Card
//               title="Spending Distribution"
//               className="shadow-sm"
//               headStyle={{ color: '#582f08' }}
//             >
//               <PieChart width={300} height={300}>
//                 <Pie
//                   data={analytics && analytics?.data?.data?.spending}
//                   cx={150}
//                   cy={150}
//                   labelLine={false}
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="spending"
//                 >
//                   {analytics &&
//                     analytics?.data?.data?.spending.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[index % COLORS.length]}
//                       />
//                     ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </Card>
//           </Col>
//         </Row>

//         {/* Top Spenders Table */}
//         <Card
//           title="Top Spenders by Department"
//           className="mb-6 shadow-sm"
//           headStyle={{ color: '#582f08' }}
//         >
//           {/* <div className="flex mb-1 justify-end">
//             <Select placeholder="Filter" className="w-[10rem] " />
//           </div> */}
//           <Table
//             columns={columns}
//             dataSource={
//               analytics &&
//               analytics?.data?.data?.topSpenders.map((item) => ({
//                 ...item,
//                 key: item._id,
//               }))
//             }
//             pagination={false}
//           />
//         </Card>
//       </Content>
//     </Layout>
//   );
// }

// export default Analytics;

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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.data?.data?.spending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="spending"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {analytics?.data?.data?.spending?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
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
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
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
