import {
  Button,
  DatePicker,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
} from 'antd';
import Form from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';

// import { useMutation, useQueryClient } from 'react-query';

import dayjs from 'dayjs';

import { addFinancialYear, updateFinancialYear } from '../../http/budget';

import { EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useGetFinancialYear } from '../../queryHooks/budget';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const FinancialYear = () => {
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: financialYears, isLoading } = useGetFinancialYear();

  console.log(financialYears && financialYears);

  useEffect(() => {
    if (selectedRecord) {
      console.log(selectedRecord);

      form.setFieldsValue({
        startDate: dayjs(selectedRecord.startDate),
        endDate: dayjs(selectedRecord.endDate),
      });
    }
  }, [selectedRecord]);

  const { mutate: saveFinancialYear } = useMutation({
    mutationKey: 'addFinancialYear',
    mutationFn: (data) =>
      selectedRecord
        ? updateFinancialYear(selectedRecord.id, {
            ...data,
            startDate: dayjs(data.startDate).toISOString(),
            endDate: dayjs(data.endDate).toISOString(),
          })
        : addFinancialYear({
            ...data,
            startDate: dayjs(data.startDate).toISOString(),
            endDate: dayjs(data.endDate).toISOString(),
          }),
    onSuccess: () => {
      setOpenModal(false);
      qClient.invalidateQueries({ queryKey: ['financialYears'] });
      message.success(
        `Financial Year ${selectedRecord ? 'updated' : 'added'} successfully`
      );
      form.resetFields();
    },
    onError: (err) => {
      message.error(err);
    },
  });

  const _data =
    financialYears &&
    financialYears?.data?.data?.map((year) => ({
      ...year,
      key: year.id,
    }));

  const { mutate: lockFinancialYear } = useMutation({
    mutationKey: 'removeFinancialYear',
    mutationFn: (id) => updateFinancialYear(id, { closed: true }),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ['financialYears'] });
      message.success('Financial Year closed successfully');
    },
    onError: (err) => {
      message.error(err.message);
    },
  });

  const columns = [
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const startDate = new Date(record.startDate).toLocaleDateString().toLowerCase();
        const endDate = new Date(record.endDate).toLocaleDateString().toLowerCase();
        return (
          startDate.includes(search) ||
          endDate.includes(search)
        );
      },
      render: (value) => <span>{new Date(value).toLocaleDateString()}</span>,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value) => <span>{new Date(value).toLocaleDateString()}</span>,
    },

    {
      title: 'Actions',
      key: 'id',
      dataIndex: 'id',
      render: (value, record) => (
        <div className={'flex gap-2'}>
          <EditOutlined
            onClick={() => {
              setOpenModal(true);
              setSelectedRecord(record);
            }}
          />

          <Popconfirm
            disabled={record.closed}
            title="Confirm Closing the year"
            onConfirm={() => {
              !record.closed
                ? lockFinancialYear(value)
                : message.error('Financial Year is already closed');
            }}
          >
            {!record.closed ? (
              <UnlockOutlined
                className="text-red-500 cursor-pointer text-xl"
                size={22}
              />
            ) : (
              <LockOutlined
                className="text-gray-400 cursor-pointer text-xl"
                disabled={true}
              />
            )}
          </Popconfirm>
        </div>
      ),
    },
  ];

  const qClient = useQueryClient();

  const handleSubmit = (values) => {
    saveFinancialYear(values);
  };

  return (
    <>
      <Modal
        open={openModal}
        maskClosable={false}
        onCancel={() => setOpenModal(false)}
        footer={false}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            handleSubmit(values);
          }}
          requiredMark
          form={form}
        >
          <Form.Item name="startDate" label="Start Date" required>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" required>
            <DatePicker className="w-full" />
          </Form.Item>

          <Button htmlType="submit" className="w-full bg-[#694421] text-white">
            Submit
          </Button>
        </Form>
      </Modal>
      <div className="w-[80%] mx-auto">
        <div className=" px-[240px] pt-[50px] ">
          <div className="flex justify-end gap-4 mb-2">
            <Input.Search
              placeholder="Search by date..."
              className="w-[20rem]"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              className="bg-[#694421] text-white"
              onClick={() => setOpenModal(true)}
            >
              Add
            </Button>
          </div>
          <Table columns={columns} dataSource={_data} loading={isLoading} />
        </div>
      </div>
    </>
  );
};

export default FinancialYear;
