import {
  Button,
  DatePicker,
  Input,
  message,
  Modal,
  Popconfirm,
  Table,
  Tag,
} from 'antd';
import Form from 'antd/es/form/Form';
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { addFinancialYear, updateFinancialYear } from '../../http/budget';
import {
  CalendarOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { useGetFinancialYear } from '../../queryHooks/budget';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SummaryTile } from '../../Pages/Routes/Budget/BudgetDesignShared';

function fmtYearRange(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return `FY ${start.format('YYYY')}-${end.format('YY')}`;
}

function fmtDuration(startDate, endDate) {
  return `${dayjs(startDate).format('MMM DD, YYYY')} — ${dayjs(endDate).format('MMM DD, YYYY')}`;
}

const FinancialYear = () => {
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { data: financialYears, isLoading } = useGetFinancialYear();
  const qClient = useQueryClient();

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue({
        startDate: dayjs(selectedRecord.startDate),
        endDate: dayjs(selectedRecord.endDate),
      });
    }
  }, [selectedRecord, form]);

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
        `Financial Year ${selectedRecord ? 'updated' : 'added'} successfully`,
      );
      form.resetFields();
      setSelectedRecord(null);
    },
    onError: (err) => {
      message.error(err?.message || 'Unable to save financial year');
    },
  });

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

  const rows = useMemo(
    () =>
      (financialYears?.data?.data ?? []).map((year) => ({
        ...year,
        key: year.id,
      })),
    [financialYears],
  );

  const activeYear = useMemo(() => {
    const now = dayjs();
    return rows.find(
      (year) =>
        !year.closed &&
        now.isAfter(dayjs(year.startDate)) &&
        now.isBefore(dayjs(year.endDate)),
    );
  }, [rows]);

  const upcomingYear = useMemo(() => {
    const now = dayjs();
    return rows.find((year) => !year.closed && dayjs(year.startDate).isAfter(now));
  }, [rows]);

  const filteredRows = rows.filter((record) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    const label = fmtYearRange(record.startDate, record.endDate).toLowerCase();
    const duration = fmtDuration(record.startDate, record.endDate).toLowerCase();
    return label.includes(search) || duration.includes(search);
  });

  const columns = [
    {
      title: 'Fiscal Year',
      key: 'label',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <CalendarOutlined className="text-[#9D4D01]" />
          <div>
            <p className="m-0 text-base font-bold text-[#582f08]">
              {fmtYearRange(record.startDate, record.endDate)}
            </p>
            {record.id === activeYear?.id && (
              <span className="mt-1 inline-block rounded bg-[#582f08] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Live
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <p className="m-0 text-sm font-semibold text-[#582f08]">
            {fmtDuration(record.startDate, record.endDate)}
          </p>
          <p className="m-0 text-[11px] text-[#7a6859]">Standard 12-month cycle</p>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) =>
        record.closed ? (
          <Tag className="rounded-full border-[#d6c3b7] bg-[#ece0da] px-3 py-0.5 text-[11px] font-bold uppercase text-[#51443b]">
            Closed
          </Tag>
        ) : record.id === activeYear?.id ? (
          <Tag className="rounded-full border-[#A5D6A7] bg-[#E8F5E9] px-3 py-0.5 text-[11px] font-bold uppercase text-[#2E7D32]">
            Open
          </Tag>
        ) : (
          <Tag className="rounded-full border-[#ffb787] bg-[#ffdcc7] px-3 py-0.5 text-[11px] font-bold uppercase text-[#723600]">
            Upcoming
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setOpenModal(true);
            }}
          />
          <Popconfirm
            disabled={record.closed}
            title="Close this financial year?"
            description="Closed years cannot accept new budget submissions."
            onConfirm={() => lockFinancialYear(record.id)}
          >
            {!record.closed ? (
              <Button type="text" icon={<UnlockOutlined className="text-[#ba1a1a]" />} />
            ) : (
              <Button type="text" disabled icon={<LockOutlined />} />
            )}
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={openModal}
        maskClosable={false}
        onCancel={() => {
          setOpenModal(false);
          setSelectedRecord(null);
          form.resetFields();
        }}
        footer={null}
        title={
          <span className="font-bold text-[#582f08]">
            {selectedRecord ? 'Update Financial Year' : 'Create Financial Year'}
          </span>
        }
      >
        <Form
          layout="vertical"
          onFinish={(values) => saveFinancialYear(values)}
          requiredMark
          form={form}
          className="mt-4"
        >
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" size="large" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" size="large" />
          </Form.Item>
          <Button
            htmlType="submit"
            block
            size="large"
            className="rounded-xl font-bold"
            style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
          >
            {selectedRecord ? 'Save Changes' : 'Create Financial Year'}
          </Button>
        </Form>
      </Modal>

      <div className="page-shell">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
                Administration
              </p>
              <h1 className="m-0 mt-2 text-3xl font-extrabold tracking-tight text-[#582f08]">
                Financial Year Administration
              </h1>
              <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-[#7a6859]">
                Manage institutional fiscal cycles, compliance deadlines, and operational status.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedRecord(null);
                form.resetFields();
                setOpenModal(true);
              }}
              className="rounded-xl px-6 font-bold"
              style={{ background: '#9D4D01', borderColor: '#9D4D01' }}
            >
              Create Financial Year
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryTile
              label="Current Active Year"
              value={activeYear ? fmtYearRange(activeYear.startDate, activeYear.endDate) : '—'}
              caption={activeYear ? 'Open for submissions' : 'No active year configured'}
              tone={activeYear ? 'success' : 'default'}
            />
            <SummaryTile
              label="Next Planning Cycle"
              value={
                upcomingYear
                  ? fmtYearRange(upcomingYear.startDate, upcomingYear.endDate)
                  : '—'
              }
              caption={
                upcomingYear
                  ? `Starts ${dayjs(upcomingYear.startDate).format('MMM DD, YYYY')}`
                  : 'No upcoming cycle scheduled'
              }
            />
            <SummaryTile
              label="Configured Years"
              value={String(rows.length)}
              caption={`${rows.filter((year) => year.closed).length} closed · ${rows.filter((year) => !year.closed).length} open/upcoming`}
            />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#ead9cb] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6db] px-6 py-4">
              <h2 className="m-0 text-lg font-bold text-[#582f08]">Fiscal Year Registry</h2>
              <Input.Search
                placeholder="Search fiscal years..."
                className="w-72"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredRows}
              loading={isLoading}
              pagination={{ pageSize: 8, hideOnSinglePage: true }}
              rowClassName={(_, index) => (index % 2 !== 0 ? 'bg-[#fdf5ef]' : 'bg-[#fffaf7]')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialYear;
