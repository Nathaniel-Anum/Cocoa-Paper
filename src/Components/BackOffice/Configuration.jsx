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
      <div className="w-[80%] mx-auto">
        <div className=" px-[240px] pt-[50px] ">
          <div className="flex justify-end mb-2">
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

export default Configuration;
