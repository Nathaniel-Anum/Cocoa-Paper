import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { addBudgetItem } from '../../../http/budget';
import axiosInstance from '../../../Components/axiosInstance';
import { useUser } from '../../CustomHook/useUser';
import { hasPermission, requiredPermissions, getAllRolePermissions } from '../../../../utils/Roles';
import { useNavigate } from 'react-router-dom';
import { useGetFinancialYear } from '../../../queryHooks/budget';
import BudgetFormShell from './BudgetFormShell';

const AddBudget = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedDivision, setSelectedDivision] = useState('');
  const handleDivisionChange = (value) => setSelectedDivision(value);

  const qClient = useQueryClient();
  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);
  const isGlobal = hasPermission(allRolePermissions, [requiredPermissions.READ_BUDGET_GLOBAL]);

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
    enabled: isGlobal,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: isGlobal && !!selectedDivision,
  });
  const { data: financialYears } = useGetFinancialYear({});

  useEffect(() => {
    if (selectedDivision) {
      form.setFieldValue('departmentId', '');
    }
  }, [selectedDivision]);

  const { mutate: saveBudgetItem, isPending } = useMutation({
    mutationKey: ['budget'],
    mutationFn: (data) => addBudgetItem(data),
    onSuccess: () => {
      message.success('Budget submitted successfully!');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
      navigate('/budget');
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || 'Something went wrong');
    },
  });

  const handleFinish = (values) => {
    const { financialYearId, ...rest } = values;
    const payload = isGlobal
      ? rest
      : { ...rest, departmentId: authUser?.departmentId };
    saveBudgetItem(payload);
  };

  return (
    <BudgetFormShell
      mode="create"
      form={form}
      isGlobal={isGlobal}
      divisions={divisions?.data}
      departments={departments?.data?.data}
      financialYears={financialYears?.data?.data}
      selectedDivision={selectedDivision}
      onDivisionChange={handleDivisionChange}
      onFinish={handleFinish}
      onCancel={() => navigate('/budget')}
      isPending={isPending}
      managerName={authUser?.name}
      contextDivision={
        authUser?.department?.division?.divisionName ||
        authUser?.division?.divisionName ||
        authUser?.divisionName
      }
      contextDepartment={
        authUser?.department?.departmentName || authUser?.departmentName
      }
    />
  );
};

export default AddBudget;
