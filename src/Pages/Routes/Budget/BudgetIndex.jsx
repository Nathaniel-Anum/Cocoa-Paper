import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  Upload,
} from 'antd';

import React, { useEffect, useState } from 'react';
import { capitalize, formatMoney } from '../../../../utils/typography';
import { EditOutlined, DownloadOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { BiTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import useStore from '../../../store/store';
import { LuFilter, LuFuel } from 'react-icons/lu';
import {
  useGetAllBudgets,
  useGetArchivedBudgets,
  useGetFinancialYear,
} from '../../../queryHooks/budget';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteBudget, downloadBudgetTemplate, uploadBudgetFile } from '../../../http/budget';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../../../utils/Roles';
import { useUser } from '../../CustomHook/useUser';
import axiosInstance from '../../../Components/axiosInstance';

const BudgetIndex = () => {
  const navigate = useNavigate();
  const setChosenRecord = useStore((state) => state.setChosenRecord);
  const [showModal, setShowModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [reportFilters, setReportFilters] = useState({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDivision, setUploadDivision] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState('');
  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);
  const budgetColumns = [
    {
      title: 'Budgetary Item',
      dataIndex: 'name',
      key: 'name',
      // width: '50%',
      render: (value) => (
        <span className="font-bold">{value && capitalize(value)}</span>
      ),
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_BUDGET_GLOBAL,
    ]) && {
      title: 'Department',
      key: 'department',
      dataIndex: ['department', 'departmentName'],
      render: (value) => <span>{value && capitalize(value)}</span>,
    },
    hasPermission(allRolePermissions, [
      requiredPermissions.READ_BUDGET_GLOBAL,
    ]) && {
      title: 'Division',
      key: 'division',
      dataIndex: ['department', 'division', 'divisionName'],
      render: (value) => <span>{value && capitalize(value)}</span>,
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
    hasPermission(allRolePermissions, [requiredPermissions.UPDATE_BUDGET]) && {
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
  ].filter(Boolean);

  const budgetData = [
    {
      title: 'Budgetary Item',
      dataIndex: 'item',
      key: 'item',
      render: (value) => <span>{value && capitalize(value)}</span>,
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
    // {
    //   title: 'Dollar Amount',
    //   dataIndex: 'dollarAmount',
    //   key: 'amount',
    //   render: (value) => <span>{value ? formatMoney(value) : '--'}</span>,
    // },
    {
      title: 'Balance',
      dataIndex: 'budgetAllocation',
      key: 'amountRemaining',
      render: (value, record) => (
        <span>
          {value && value.length
            ? formatMoney(value[value.length - 1].balance)
            : formatMoney(record.amount)}
        </span>
      ),
    },
  ];

  const { data: budgets, isLoading, refetch } = useGetAllBudgets(reportFilters);
  const { data: archivedBudgets, isLoading: archivedLoading } = useGetArchivedBudgets();
  const { data: financialYear, isLoading: FinancialYearLoading } =
    useGetFinancialYear({
      enabled: showModal,
    });

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

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadBudgetTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'budget_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Failed to download template');
    }
  };

  const { mutate: submitUpload, isPending: uploading } = useMutation({
    mutationFn: ({ file, departmentId }) => uploadBudgetFile(file, departmentId),
    onSuccess: (res) => {
      message.success(res?.data?.message || 'Budgets uploaded successfully');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadDivision('');
      setUploadDeptId('');
    },
    onError: (err) => {
      const errData = err?.response?.data;
      if (Array.isArray(errData?.errors)) {
        errData.errors.forEach((e) => message.error(e));
      } else {
        message.error(errData?.error || 'Upload failed');
      }
    },
  });

  const [form] = Form.useForm();

  const handleDivisionChange = (value) => {
    setSelectedDivision(value);
    setSelectedDepartment('');
    form.setFieldsValue({
      departmentId: undefined,
      userId: undefined,
    });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    form.setFieldsValue({
      userId: undefined,
    });
  };

  const { data: divisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        return await axiosInstance.get('/division');
      } catch (error) {
        message.error('Failed to Load Divisions', error);
        return { data: [] };
      }
    },
  });

  // Fetch departments based on selected division
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${selectedDivision}`);
      } catch (error) {
        message.error('Failed to Load Departments', error);
        return { data: { data: [] } };
      }
    },
    enabled: !!selectedDivision,
  });

  // Separate departments query for the upload modal
  const { data: uploadDepartments, isLoading: uploadDepartmentsLoading } = useQuery({
    queryKey: ['departments', uploadDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${uploadDivision}`);
      } catch (error) {
        return { data: { data: [] } };
      }
    },
    enabled: !!uploadDivision,
  });

  useEffect(() => {
    if (reportFilters) {
      refetch();
    }
  }, [reportFilters]);

  return (
    <div className="space-y-4">
      {/* ══ Upload Modal ═══════════════════════════════════════════════════ */}
      <Modal
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setUploadFile(null);
          setUploadDivision('');
          setUploadDeptId('');
        }}
        footer={null}
        width={520}
        title={
          <div className="pb-3 border-b border-[#f0e6db]">
            <p className="text-lg font-bold text-[#582f08] tracking-wide m-0">Upload Budget Template</p>
            <p className="text-xs text-[#9D4D01] font-medium mt-0.5 m-0">Import multiple budget items at once using an Excel file</p>
          </div>
        }
        styles={{ body: { padding: '24px 24px 20px' } }}
      >
        <div className="flex flex-col gap-5">

          {/* Instructions */}
          <Alert
            type="info"
            showIcon
            className="rounded-lg"
            message={<span className="font-semibold text-sm">Before you upload</span>}
            description={
              <ol className="list-decimal ml-4 mt-1 space-y-1.5 text-xs leading-relaxed text-gray-700">
                <li>Download the Excel template from the <strong>Budget page toolbar</strong>.</li>
                <li>Each row = one budget line item. Group rows by the same <em>Category Name</em>.</li>
                <li>Fill in: <strong>Category Name</strong>, <strong>Budget Item</strong>, <strong>Amount (GHS)</strong>, and optional <strong>Quantity</strong>.</li>
                <li>Select the department below — all items will be assigned to it.</li>
                <li>Select your filled file and click <strong>Import Budgets</strong>.</li>
              </ol>
            }
          />

          {/* Divider label */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#f0e6db]" />
            <span className="text-xs font-semibold text-[#9D4D01] uppercase tracking-widest">Assign Department</span>
            <div className="flex-1 h-px bg-[#f0e6db]" />
          </div>

          {/* Division */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#582f08]">
              Division <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Select a division"
              className="w-full"
              size="large"
              value={uploadDivision || undefined}
              onChange={(val) => { setUploadDivision(val); setUploadDeptId(''); }}
              options={
                divisions?.data?.map((d) => ({
                  label: d.divisionName,
                  value: d.divisionId,
                })) || []
              }
              showSearch
              optionFilterProp="label"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#582f08]">
              Department <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder={uploadDivision ? 'Select a department' : 'Select a division first'}
              className="w-full"
              size="large"
              value={uploadDeptId || undefined}
              onChange={(val) => setUploadDeptId(val)}
              options={
                uploadDepartments?.data?.data?.map((d) => ({
                  label: d.departmentName,
                  value: d.departmentId,
                })) || []
              }
              disabled={!uploadDivision}
              loading={uploadDepartmentsLoading}
              showSearch
              optionFilterProp="label"
            />
          </div>

          {/* Divider label */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#f0e6db]" />
            <span className="text-xs font-semibold text-[#9D4D01] uppercase tracking-widest">Select File</span>
            <div className="flex-1 h-px bg-[#f0e6db]" />
          </div>

          {/* File picker */}
          <Upload
            accept=".xlsx,.xls"
            maxCount={1}
            beforeUpload={(file) => { setUploadFile(file); return false; }}
            onRemove={() => setUploadFile(null)}
            fileList={uploadFile ? [uploadFile] : []}
          >
            <Button
              icon={<UploadOutlined />}
              size="large"
              className="w-full"
              style={{ borderStyle: 'dashed', borderColor: '#9D4D01', color: '#9D4D01' }}
            >
              Click to select .xlsx / .xls file
            </Button>
          </Upload>

          {/* Submit */}
          <Button
            size="large"
            className="w-full font-bold tracking-wide rounded-lg mt-1"
            style={{
              background: (!uploadFile || !uploadDeptId) ? undefined : '#582f08',
              color: (!uploadFile || !uploadDeptId) ? undefined : '#fff',
              border: 'none',
              height: 48,
            }}
            disabled={!uploadFile || !uploadDeptId}
            loading={uploading}
            onClick={() => submitUpload({ file: uploadFile, departmentId: uploadDeptId })}
          >
            Import Budgets
          </Button>

        </div>
      </Modal>

      {/* ══ Filter Modal ═══════════════════════════════════════════════════ */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title={
          <span className="font-semibold text-[#582f08] text-base tracking-wide">
            Filter Budgets
          </span>
        }
      >
        <div className="mt-6">
          <Form
            name="budget-filter"
            layout="vertical"
            onFinish={(values) => {
              setReportFilters(values);
              setShowModal(false);
            }}
          >
            <Form.Item name="divisionId" label="Division">
              <Select
                placeholder="Select Division"
                onChange={handleDivisionChange}
                options={
                  divisions?.data?.map((division) => ({
                    label: division?.divisionName,
                    value: division?.divisionId,
                  })) || []
                }
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="departmentId" label="Department">
              <Select
                placeholder="Select Department"
                onChange={handleDepartmentChange}
                options={
                  departments?.data?.data?.map((department) => ({
                    label: department?.departmentName,
                    value: department?.departmentId,
                  })) || []
                }
                disabled={!selectedDivision}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="budgetItem" label="Budget Item">
              <Select
                placeholder="Select Budget Item"
                className="w-full"
                options={budgets?.data?.data?.map((budget) => ({
                  label: budget?.name,
                  value: budget?.id,
                }))}
              />
            </Form.Item>

            <Form.Item name="financialYearId" label="Financial Year">
              <Select
                className="w-full"
                options={financialYear?.data?.data?.map((year) => ({
                  label: `${new Date(year.startDate).getFullYear()} – ${new Date(year.endDate).getFullYear()}`,
                  value: year.id,
                }))}
                placeholder="Select Year"
              />
            </Form.Item>

            <Button
              htmlType="submit"
              className="w-full font-semibold"
              style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
            >
              Apply Filter
            </Button>
          </Form>
        </div>
      </Modal>

      {/* ══ Page Header ════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#582f08] tracking-wide m-0">Budget Management</h2>
        </div>

        {/* Instructions banner */}
        <Collapse
          ghost
          size="small"
          items={[
            {
              key: '1',
              label: (
                <span className="text-[#9D4D01] font-semibold text-sm flex items-center gap-1">
                  <InfoCircleOutlined /> How to bulk-upload budgets
                </span>
              ),
              children: (
                <Alert
                  type="info"
                  showIcon={false}
                  className="rounded-lg"
                  message={
                    <ol className="list-decimal ml-4 space-y-1 text-sm leading-relaxed">
                      <li>Click <strong>Download Template</strong> to get the Excel file.</li>
                      <li>Fill each row: Category Name, Budget Item, Amount (GHS), and optional Quantity.</li>
                      <li>Group related items under the same <em>Category Name</em>.</li>
                      <li>Click <strong>Upload Template</strong>, choose your Division &amp; Department, select the file and click <strong>Import</strong>.</li>
                      <li>Duplicate category names for the same department are skipped automatically.</li>
                    </ol>
                  }
                />
              ),
            },
          ]}
        />

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 items-stretch sm:items-center">
          <Input.Search
            placeholder="Search budgets..."
            className="w-full sm:w-72"
            allowClear
          />

          <div className="flex flex-wrap gap-2 justify-end items-center">
            {hasPermission(allRolePermissions, [requiredPermissions.CREATE_BUDGET]) && (
              <>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                >
                  Download Template
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload Template
                </Button>
                <Button
                  style={{ background: '#9D4D01', color: '#fff', border: 'none' }}
                  className="font-semibold"
                  onClick={() => navigate('/add-budget-item')}
                >
                  + Add Budgetary Item
                </Button>
              </>
            )}
            <Tooltip title="Filter">
              <Button
                icon={<LuFilter />}
                onClick={() => setShowModal(true)}
                className="flex items-center"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ══ Table ══════════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto rounded-xl shadow-sm">
        <Table
          columns={budgetColumns}
          expandable={{
            expandedRowRender: (record) => (
              <div className="overflow-x-auto px-2 py-1">
                <Table
                  columns={budgetData}
                  dataSource={record.budgetItems}
                  pagination={false}
                  bordered={false}
                  className="custom-inner-table"
                  scroll={{ x: 400 }}
                  size="small"
                />
              </div>
            ),
            rowExpandable: (record) => record?.budgetItems?.length > 0,
          }}
          dataSource={data}
          loading={isLoading}
          scroll={{ x: 700 }}
          size="middle"
        />
      </div>

      {/* ══ Archived Budgets ═══════════════════════════════════════════════ */}
      <Collapse
        ghost
        items={[
          {
            key: 'archived',
            label: (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#582f08]">Archived Budgets</span>
                <Tag color="orange">
                  {archivedBudgets?.data?.length ?? 0}
                </Tag>
              </div>
            ),
            children: (
              <div className="overflow-x-auto rounded-xl shadow-sm">
                <Table
                  columns={[
                    {
                      title: 'Budgetary Item',
                      dataIndex: 'name',
                      key: 'name',
                      render: (value) => (
                        <span className="font-bold">{value && capitalize(value)}</span>
                      ),
                    },
                    hasPermission(allRolePermissions, [
                      requiredPermissions.READ_BUDGET_GLOBAL,
                    ]) && {
                      title: 'Department',
                      key: 'department',
                      dataIndex: ['department', 'departmentName'],
                      render: (value) => <span>{value && capitalize(value)}</span>,
                    },
                    hasPermission(allRolePermissions, [
                      requiredPermissions.READ_BUDGET_GLOBAL,
                    ]) && {
                      title: 'Division',
                      key: 'division',
                      dataIndex: ['department', 'division', 'divisionName'],
                      render: (value) => <span>{value && capitalize(value)}</span>,
                    },
                    {
                      title: 'Financial Year',
                      dataIndex: 'financialYear',
                      key: 'financialYear',
                      render: (value) => (
                        <span className="font-bold">{`${new Date(
                          value.startDate
                        ).getFullYear()} – ${new Date(value.endDate).getFullYear()}`}</span>
                      ),
                    },
                    {
                      title: 'Status',
                      key: 'status',
                      render: () => <Tag color="orange">Archived</Tag>,
                    },
                  ].filter(Boolean)}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="overflow-x-auto px-2 py-1">
                        <Table
                          columns={budgetData}
                          dataSource={record.budgetItems}
                          pagination={false}
                          bordered={false}
                          className="custom-inner-table"
                          scroll={{ x: 400 }}
                          size="small"
                        />
                      </div>
                    ),
                    rowExpandable: (record) => record?.budgetItems?.length > 0,
                  }}
                  dataSource={
                    archivedBudgets?.data?.map((b) => ({ ...b, key: b.id })) ?? []
                  }
                  loading={archivedLoading}
                  scroll={{ x: 700 }}
                  size="middle"
                />
              </div>
            ),
          },
        ]}
        className="border border-[#f0e6da] rounded-xl bg-white shadow-sm"
      />
    </div>
  );
};

export default BudgetIndex;
