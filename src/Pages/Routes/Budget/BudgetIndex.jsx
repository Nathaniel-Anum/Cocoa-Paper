import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tooltip,
} from 'antd';

import React, { useState } from 'react';
import { formatMoney } from '../../../../utils/typography';
import { EditOutlined } from '@ant-design/icons';
import { BiTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import useStore from '../../../store/store';
import { LuFilter, LuFuel } from 'react-icons/lu';

const BudgetIndex = () => {
  const navigate = useNavigate();
  const setChosenRecord = useStore((state) => state.setChosenRecord);
  const [showModal, setShowModal] = useState(false);
  const budgetColumns = [
    {
      title: 'Budgetary Item',
      dataIndex: 'name',
      key: 'name',
      width: '50%',
      render: (value) => <span className={'font-bold'}>{value}</span>,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      //   width: '50%',
      render: (value) => <span className={'font-bold'}>{value}</span>,
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'action',
      render: (value, record) => (
        <div className="flex gap-2">
          <EditOutlined
            className="text-blue-400 cursor-pointer"
            size={22}
            onClick={() => {
              setChosenRecord(record);
              navigate(`/update-budget-item/${value}`);
            }}
          />
          <BiTrash className="text-red-400" size={22} />
        </div>
      ),
    },
  ];

  const budgetData = [
    {
      title: 'Budgetary Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Budget Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => <span>{formatMoney(value)}</span>,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value) => <span>{formatMoney(value)}</span>,
    },
  ];

  const data = [
    {
      name: 'Software License Renewals',
      budgetData: [
        {
          name: 'Sage Accpac license renewal',
          quantity: 1,
          amount: 16430.0,
          balance: 500.0,
        },
        {
          name: 'Persol Payroll & HR Maintenance renewal',
          quantity: 1,
          amount: 3700.0,
          balance: 0.0,
        },
        {
          name: 'Zoom Subscription (Online Conferencing)',
          quantity: 12,
          amount: 624.0,
          balance: 124.0,
        },
        {
          name: 'Convene (Paperless Governing Board Meeting)',
          quantity: 1,
          amount: 2170.0,
          balance: 170.0,
        },
      ],
    },
    {
      name: 'Internet Subscription',
      budgetData: [
        {
          name: 'MAINONE (HO, CMC, QCC, SPD, CMC)',
          quantity: 5,
          amount: 12096.0,
          balance: 200.0,
        },
        {
          name: 'TELECELL (DATA CENTER)',
          quantity: 1,
          amount: 7056.0,
          balance: 56.0,
        },
        { name: 'MTN (TURBO NET)', quantity: 1, amount: 200.0, balance: 0.0 },
      ],
    },
    {
      name: 'Cloud Services',
      budgetData: [
        {
          name: 'Root Domain Renewal (COCOBOD.gh domain payement)',
          quantity: 1,
          amount: 100.0,
          balance: 0.0,
        },
        {
          name: 'Secured Socket Layer (SSL)',
          quantity: 1,
          amount: 744.0,
          balance: 44.0,
        },
      ],
    },
    {
      name: 'Business Continuity',
      budgetData: [
        {
          name: 'Business Continuity Plan Audit',
          quantity: 1,
          amount: 5000.0,
          balance: 1000.0,
        },
        {
          name: 'DR Site Maintenance',
          quantity: 2,
          amount: 12000.0,
          balance: 2000.0,
        },
      ],
    },
    {
      name: 'Backup software',
      budgetData: [
        {
          name: 'Cloud Storage (GOOGLE)',
          quantity: 1,
          amount: 310000.0,
          balance: 10000.0,
        },
      ],
    },
    {
      name: 'Data Center - Services Renewal',
      budgetData: [
        {
          name: 'Data Center Cooling Unit Renewal',
          quantity: 2,
          amount: 15000.0,
          balance: 500.0,
        },
      ],
    },
    {
      name: 'Vmware',
      budgetData: [
        {
          name: 'VMware License Renewal',
          quantity: 3,
          amount: 18000.0,
          balance: 800.0,
        },
      ],
    },
    {
      name: 'Data Centre Infrastructure Management',
      budgetData: [
        {
          name: 'Rack Monitoring System',
          quantity: 1,
          amount: 6000.0,
          balance: 0.0,
        },
      ],
    },
    {
      name: 'Staff Cost (ISU & CMS-U)',
      budgetData: [
        {
          name: 'Out of Station Allowance & Transport Claims',
          quantity: 20,
          amount: 13000.0,
          balance: 3000.0,
        },
        {
          name: 'Intermediate Training',
          quantity: 5,
          amount: 7000.0,
          balance: 1000.0,
        },
        {
          name: 'Advance Training',
          quantity: 4,
          amount: 9000.0,
          balance: 2000.0,
        },
        {
          name: 'Overseas Conference',
          quantity: 2,
          amount: 15000.0,
          balance: 0.0,
        },
      ],
    },
    {
      name: 'Cybersecurity',
      budgetData: [
        {
          name: 'CloudFlare (HO, CMC, QCC, SPD, CRIG)',
          quantity: 1,
          amount: 1550.0,
          balance: 0.0,
        },
        {
          name: 'Firewall license renewal (Palo)',
          quantity: 1,
          amount: 19530.0,
          balance: 530.0,
        },
        {
          name: 'Endpoint License renewal',
          quantity: 50,
          amount: 12090.0,
          balance: 90.0,
        },
      ],
    },
    {
      name: 'Capital Expenditure',
      budgetData: [
        {
          name: 'Network Switches',
          quantity: 5,
          amount: 20000.0,
          balance: 0.0,
        },
        {
          name: 'Security Equipment',
          quantity: 10,
          amount: 5040.0,
          balance: 40.0,
        },
        {
          name: 'Hardware Maintenance & Repairs',
          quantity: 3,
          amount: 1100.0,
          balance: 100.0,
        },
        {
          name: 'Virtual Video Conferencing Equipment',
          quantity: 1,
          amount: 5270.0,
          balance: 270.0,
        },
        {
          name: 'Industrial Scanner',
          quantity: 1,
          amount: 431.2,
          balance: 31.2,
        },
      ],
    },
    {
      name: 'Consumables',
      budgetData: [
        {
          name: 'Computer Consumables',
          quantity: 30,
          amount: 1806.0,
          balance: 106.0,
        },
        {
          name: 'Tonners and Cartridges',
          quantity: 25,
          amount: 2150.0,
          balance: 150.0,
        },
      ],
    },
    {
      name: 'CCTV',
      budgetData: [
        {
          name: 'CCTV - Sefwi Wiaso',
          quantity: 1,
          amount: 8316.0,
          balance: 316.0,
        },
      ],
    },
    {
      name: 'Rebuilding of LAN Cocoa House',
      budgetData: [
        { name: 'LAN Upgrade', quantity: 1, amount: 26000.0, balance: 1000.0 },
      ],
    },
    {
      name: 'CMS Operations',
      budgetData: [
        {
          name: 'Tonners and Cartridges',
          quantity: 10,
          amount: 6000.0,
          balance: 0.0,
        },
        { name: 'Stationery', quantity: 20, amount: 2000.0, balance: 200.0 },
        {
          name: 'Laminator Machines',
          quantity: 2,
          amount: 915.6,
          balance: 15.6,
        },
        {
          name: 'Laminator Film (Pouch)',
          quantity: 100,
          amount: 1200.0,
          balance: 100.0,
        },
        { name: 'ID Card Base', quantity: 200, amount: 1831.2, balance: 31.2 },
        {
          name: 'Manual A3 Guillotine Cutter',
          quantity: 1,
          amount: 2243.22,
          balance: 243.22,
        },
        {
          name: 'Office Furniture & Equipment',
          quantity: 5,
          amount: 4000.0,
          balance: 500.0,
        },
        {
          name: 'Smart Mobile Devices',
          quantity: 10,
          amount: 19600.0,
          balance: 600.0,
        },
      ],
    },
  ];

  const _data = data.map((item, index) => ({
    ...item,
    key: `main-${index}`, // Unique key for parent
    budgetData: item.budgetData.map((subItem, subIndex) => ({
      ...subItem,
      key: `sub-${index}-${subIndex}`, // Unique key for child rows
    })),
  }));

  return (
    <div>
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title="FILTER BUDGET"
      >
        <div className="mt-10">
          <Form name="budget-filter" layout="vertical">
            <Form.Item name="budgetItem" label="Budget Item">
              <Select
                placeholder="Select Budget Item"
                className="w-full"
                options={[{ label: 'Some Label', value: 'Some Value' }]}
              />
            </Form.Item>
            <Form.Item name="year" label="Year">
              <Select
                className="w-full"
                options={[{ label: 'Some Label', value: 'Some Value' }]}
                placeholder="Select Year"
              />
            </Form.Item>

            <Button
              className="bg-[#9D4D01] w-full text-white"
              htmlType="submit"
            >
              Submit
            </Button>
          </Form>
        </div>
      </Modal>

      <div className="flex justify-end gap-2 items-center">
        <Input.Search placeholder="Search...." className="w-[20rem]" />
        <Button
          className=" bg-[#9D4D01] text-white"
          onClick={() => navigate('/add-budget-item')}
        >
          Add Budgetary Item
        </Button>
        <Tooltip text="Filter">
          <LuFilter
            className="text-2xl text-[#9D4D01] cursor-pointer"
            onClick={() => setShowModal(true)}
          />
        </Tooltip>
      </div>
      <Table
        columns={budgetColumns}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              showHeader={false}
              columns={budgetData}
              dataSource={record.budgetData}
              pagination={false}
            />
          ),
          onExpand: () => {
            setBold(true);
          },
        }}
        dataSource={_data}
      />
    </div>
  );
};

export default BudgetIndex;
