import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
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
import { useGetAllBudgets } from '../../../queryHooks/budget';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBudget } from '../../../http/budget';

const BudgetIndex = () => {
  const navigate = useNavigate();
  const setChosenRecord = useStore((state) => state.setChosenRecord);
  const [showModal, setShowModal] = useState(false);
  const budgetColumns = [
    {
      title: 'Budgetary Item',
      dataIndex: 'name',
      key: 'name',
      // width: '50%',
      render: (value) => <span className={'font-bold'}>{value}</span>,
    },
    {
      title: 'Department',
      key: 'department',
      dataIndex: ['department', 'departmentName'],
    },
    {
      title: 'Division',
      key: 'division',
      dataIndex: ['department', 'division', 'divisionName'],
    },
    {
      title: 'Year',
      dataIndex: 'financialYear',
      key: 'financialYear',
      //   width: '50%',
      render: (value, record) => (
        <span className={'font-bold'}>{`${new Date(
          value.startDate
        ).getFullYear()} - ${new Date(value.endDate).getFullYear()}`}</span>
      ),
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
          <Popconfirm
            onConfirm={() => removeBudget(value)}
            title="Delete Budget. Action is irreversible!!!"
          >
            <BiTrash className="text-red-400 cursor-pointer" size={22} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const budgetData = [
    {
      title: 'Budgetary Item',
      dataIndex: 'item',
      key: 'item',
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
      dataIndex: 'amountRemaining',
      key: 'amountRemaining',
      render: (value) => <span>{formatMoney(value)}</span>,
    },
  ];

  const { data: budgets, isLoading } = useGetAllBudgets();

  const data = budgets?.data?.data?.map((s) => ({
    ...s,
    key: s?.id,
  }));

  const qClient = useQueryClient();

  const { mutate: removeBudget } = useMutation({
    mutationKey: ['deleteBudget'],
    mutationFn: (id) => deleteBudget(id),
    onSuccess: () => {
      message.success('Budget Deleted Successfully');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (err) => message.error(err?.response?.data?.error),
  });

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
              columns={budgetData}
              dataSource={record.budgetItems}
              pagination={false}
              bordered={false}
              className="custom-inner-table"
            />
          ),
          rowExpandable: (record) => record?.budgetItems?.length > 0,
        }}
        dataSource={data}
      />
    </div>
  );
};

export default BudgetIndex;
