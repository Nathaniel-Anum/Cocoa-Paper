import {
  Button,
  DatePicker,
  Input,
  InputNumber,
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
import { GiTrashCan } from 'react-icons/gi';
import { HiTrash } from 'react-icons/hi2';
import { LuTrash, LuTrash2 } from 'react-icons/lu';
import { useGetAllConfigurations } from '../../queryHooks/configuration';
import {
  addConfiguration,
  deleteConfiguration,
  updateConfiguration,
} from '../../http/configuration';
import { CONFIGS } from '../../../utils/constants';

const Configuration = () => {
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: configurations, isLoading } = useGetAllConfigurations();

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue({
        name: selectedRecord.name,
        value: selectedRecord.value,
      });
    }
  }, [selectedRecord]);

  const { mutate: saveConfiguration } = useMutation({
    mutationKey: 'addConfiguration',
    mutationFn: (data) =>
      selectedRecord
        ? updateConfiguration(selectedRecord.id, data)
        : addConfiguration(data),
    onSuccess: () => {
      setOpenModal(false);
      qClient.invalidateQueries({ queryKey: ['configurations'] });
      message.success(
        `Configuration ${selectedRecord ? 'updated' : 'added'} successfully`
      );
      form.resetFields();
    },
    onError: (err) => {
      message.error(err);
    },
  });

  const _data =
    configurations &&
    configurations?.data?.data?.map((year) => ({
      ...year,
      key: year.id,
    }));

  const { mutate: removeConfiguration } = useMutation({
    mutationKey: 'removeConfiguration',
    mutationFn: (id) => deleteConfiguration(id),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ['configurations'] });
      message.success('Configuration closed successfully');
    },
    onError: (err) => {
      message.error(err.message);
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const configName = CONFIGS[record.name] || record.name || '';
        return (
          configName.toLowerCase().includes(search) ||
          record.value?.toString().toLowerCase().includes(search)
        );
      },
      render: (value) => <span>{CONFIGS[value]}</span>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
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
              removeConfiguration(value);
            }}
          >
            <LuTrash2
              className="text-red-500 cursor-pointer text-xl"
              //   size={22}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const qClient = useQueryClient();

  const handleSubmit = (values) => {
    saveConfiguration(values);
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
          <Form.Item name="name" label="Name" required>
            <Select
              placeholder="Select Config Name"
              options={[
                { label: 'F & A Threshold', value: 'F_AND_A_THRESHOLD' },
                {
                  label: 'Director Finance Threshold',
                  value: 'DIRECTOR_THRESHOLD',
                },
                { label: 'Chief Executive Threshold', value: 'CE_THRESHOLD' },
              ]}
            />
          </Form.Item>

          <Form.Item name="value" label="Value" required>
            <Input
              placeholder="Enter Amount"
              className="w-full"
              formatter={(value) =>
                `₵ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value?.replace(/₵\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Button htmlType="submit" className="w-full bg-[#694421] text-white">
            Submit
          </Button>
        </Form>
      </Modal>
      <div className="pl-[236px] pr-8 pt-6 pb-8 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e6da]">
            <h2 className="text-lg font-bold text-[#582F08]">Configuration</h2>
            <div className="flex gap-3 items-center">
              <Input.Search
                placeholder="Search by name or value..."
                className="w-72"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                onClick={() => setOpenModal(true)}
                style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="p-4">
            <Table
              columns={columns}
              dataSource={_data}
              loading={isLoading}
              className="backoffice-table"
              rowClassName={(_, i) => (i % 2 !== 0 ? 'backoffice-row-alt' : '')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Configuration;
