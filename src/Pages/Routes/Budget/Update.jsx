import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Modal, Skeleton, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { submitBudget, updateBudget } from '../../../http/budget';
import useStore from '../../../store/store';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../Components/axiosInstance';
import { useUser } from '../../CustomHook/useUser';
import { getAllRolePermissions, hasPermission, requiredPermissions } from '../../../../utils/Roles';
import { useGetBudgetById, useGetFinancialYear } from '../../../queryHooks/budget';
import BudgetFormShell from './BudgetFormShell';
import DraftEditorShell from './DraftEditorShell';

const UpdateBudget = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const chosenRecord = useStore((state) => state.chosenRecord);
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDivision, setSelectedDivision] = useState('');
  const handleDivisionChange = (value) => setSelectedDivision(value);
  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);
  const isGlobal = hasPermission(allRolePermissions, [requiredPermissions.READ_BUDGET_GLOBAL]);
  const canSubmit = hasPermission(allRolePermissions, [requiredPermissions.SUBMIT_BUDGET]);
  const { data: budgetRes, isLoading: budgetLoading } = useGetBudgetById(id, {
    enabled: !chosenRecord?.id && !!id,
  });
  const activeBudget = chosenRecord?.id === id ? chosenRecord : budgetRes?.data?.data;
  const isDraftEditor = ['DRAFT', 'RETURNED'].includes(activeBudget?.status);

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
    enabled: isGlobal,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision || activeBudget?.department?.divisionId],
    queryFn: () =>
      axiosInstance.get(
        `/department/${selectedDivision || activeBudget?.department?.divisionId}`,
      ),
    enabled: isGlobal && !!(selectedDivision || activeBudget?.department?.divisionId),
  });
  const { data: financialYears } = useGetFinancialYear({});

  useEffect(() => {
    if (selectedDivision) {
      form.setFieldValue('departmentId', '');
    }
  }, [selectedDivision, form]);

  const { mutate: saveBudgetItem, isPending, mutateAsync: saveBudgetItemAsync } = useMutation({
    mutationKey: ['budget'],
    mutationFn: (data) => updateBudget(activeBudget?.id ?? id, data),
    onSuccess: () => {
      message.success('Budget updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      if (!isDraftEditor) {
        setTimeout(() => navigate('/budget'), 1000);
      }
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || 'Something went wrong');
    },
  });

  const { mutate: submitBudgetItem, isPending: submitting, mutateAsync: submitBudgetItemAsync } = useMutation({
    mutationFn: () => submitBudget(activeBudget?.id ?? id),
    onSuccess: () => {
      message.success('Budget submitted for review.');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      navigate(`/budget/${id}`);
    },
    onError: (err) => message.error(err?.response?.data?.error || 'Submit failed'),
  });

  useEffect(() => {
    if (activeBudget) {
      form.setFieldsValue({
        name: activeBudget.name,
        divisionId: activeBudget?.department?.divisionId,
        departmentId: activeBudget.departmentId,
        budgetItems: activeBudget?.budgetItems?.map((item) => ({
          item: item?.item,
          amount: item?.amount,
          dollarAmount: item?.dollarAmount,
          quantity: item?.quantity ?? 1,
        })),
      });
      setSelectedDivision(activeBudget?.department?.divisionId || '');
    }
  }, [activeBudget, form]);

  const handleFinish = (values) => {
    const { financialYearId, ...rest } = values;
    const payload = isGlobal
      ? rest
      : { ...rest, departmentId: authUser?.departmentId };
    saveBudgetItem(payload);
  };

  const handleSubmitForReview = () => {
    Modal.confirm({
      title: 'Submit budget for review?',
      content:
        'The budget will be locked for editing until committee review begins or a return is issued.',
      okText: 'Submit for Review',
      okButtonProps: { style: { background: '#9D4D01', borderColor: '#9D4D01' } },
      onOk: async () => {
        const values = await form.validateFields();
        const { financialYearId, ...rest } = values;
        const payload = isGlobal ? rest : { ...rest, departmentId: authUser?.departmentId };
        await saveBudgetItemAsync(payload);
        await submitBudgetItemAsync();
        navigate(`/budget/${id}`);
      },
    });
  };

  const sharedProps = {
    mode: 'edit',
    form,
    isGlobal,
    divisions: divisions?.data,
    departments: departments?.data?.data,
    financialYears: financialYears?.data?.data,
    selectedDivision,
    onDivisionChange: handleDivisionChange,
    onFinish: handleFinish,
    onCancel: () => navigate(activeBudget?.id ? `/budget/${activeBudget.id}` : '/budget'),
    isPending: isPending || submitting,
    managerName: authUser?.name,
  };

  if (budgetLoading && !activeBudget) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[28px] border border-[#ead9cb] bg-white p-8 shadow-sm">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  if (isDraftEditor) {
    return (
      <DraftEditorShell
        budget={activeBudget}
        {...sharedProps}
        canSubmit={canSubmit}
        onSubmitForReview={handleSubmitForReview}
      />
    );
  }

  return <BudgetFormShell {...sharedProps} />;
};

export default UpdateBudget;
