import React, { useState } from 'react';
import { Alert, Button, Select, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { downloadBudgetTemplate, uploadBudgetFile } from '../../../http/budget';
import axiosInstance from '../../../Components/axiosInstance';

/**
 * Shared Excel budget upload panel — same behaviour as the (now-hidden)
 * Budget Workspace Upload button.
 */
const BudgetUploadPanel = ({
  onSuccess,
  onCancel,
  className = '',
  showCancel = false,
}) => {
  const qClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDivision, setUploadDivision] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState('');

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        return await axiosInstance.get('/division');
      } catch {
        return { data: [] };
      }
    },
  });

  const { data: uploadDepartments, isLoading: uploadDepartmentsLoading } = useQuery({
    queryKey: ['departments', uploadDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${uploadDivision}`);
      } catch {
        return { data: { data: [] } };
      }
    },
    enabled: !!uploadDivision,
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
      qClient.invalidateQueries({ queryKey: ['budget-stats'] });
      setUploadFile(null);
      setUploadDivision('');
      setUploadDeptId('');
      onSuccess?.(res);
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

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <Alert
        type="info"
        showIcon
        className="rounded-xl border-[#fdd9b0] bg-[#fff4e8]"
        message={<span className="font-semibold text-sm text-[#582f08]">Before you upload</span>}
        description={
          <ol className="ml-4 mt-1 list-decimal space-y-1.5 text-xs leading-relaxed text-[#7a6859]">
            <li>
              Download the Excel template, then fill Category Name, Budget Item, Amount (GHS), and
              optional Quantity.
            </li>
            <li>Each row is one budget line. Group rows by the same Category Name.</li>
            <li>Select the division and department — all imported items are assigned to it.</li>
            <li>Select your filled .xlsx / .xls file and click Import Budgets.</li>
          </ol>
        }
      />

      <Button
        icon={<DownloadOutlined />}
        onClick={handleDownloadTemplate}
        className="w-full rounded-xl border-[#9D4D01] text-[#9D4D01]"
        size="large"
      >
        Download Excel Template
      </Button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#ead9cb]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#9D4D01]">
          Assign Department
        </span>
        <div className="h-px flex-1 bg-[#ead9cb]" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#582f08]">
          Division <span className="text-red-500">*</span>
        </label>
        <Select
          placeholder="Select a division"
          className="w-full"
          size="large"
          value={uploadDivision || undefined}
          onChange={(val) => {
            setUploadDivision(val);
            setUploadDeptId('');
          }}
          options={(divisions?.data ?? []).map((d) => ({
            label: d.divisionName,
            value: d.divisionId,
          }))}
          showSearch
          optionFilterProp="label"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#582f08]">
          Department <span className="text-red-500">*</span>
        </label>
        <Select
          placeholder={uploadDivision ? 'Select a department' : 'Select a division first'}
          className="w-full"
          size="large"
          value={uploadDeptId || undefined}
          onChange={setUploadDeptId}
          options={(uploadDepartments?.data?.data ?? []).map((d) => ({
            label: d.departmentName,
            value: d.departmentId,
          }))}
          disabled={!uploadDivision}
          loading={uploadDepartmentsLoading}
          showSearch
          optionFilterProp="label"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#ead9cb]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#9D4D01]">
          Select File
        </span>
        <div className="h-px flex-1 bg-[#ead9cb]" />
      </div>

      <Upload
        accept=".xlsx,.xls"
        maxCount={1}
        beforeUpload={(file) => {
          setUploadFile(file);
          return false;
        }}
        onRemove={() => setUploadFile(null)}
        fileList={uploadFile ? [uploadFile] : []}
      >
        <Button
          icon={<UploadOutlined />}
          size="large"
          className="w-full rounded-xl"
          style={{ borderStyle: 'dashed', borderColor: '#9D4D01', color: '#9D4D01' }}
        >
          Click to select .xlsx / .xls file
        </Button>
      </Upload>

      <div className="flex flex-col gap-3 sm:flex-row">
        {showCancel && (
          <Button size="large" onClick={onCancel} className="rounded-xl border-[#d6c3b7] sm:flex-1">
            Cancel
          </Button>
        )}
        <Button
          size="large"
          className="rounded-xl font-bold tracking-wide sm:flex-1"
          style={{
            background: !uploadFile || !uploadDeptId ? undefined : '#582f08',
            color: !uploadFile || !uploadDeptId ? undefined : '#fff',
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
    </div>
  );
};

export default BudgetUploadPanel;
