import { useQuery } from '@tanstack/react-query';
import { getAllBudgets, getArchivedBudgets, getFinancialYears } from '../http/budget';

export const useGetFinancialYear = (options) => {
  return useQuery({
    queryKey: ['financialYears'],
    queryFn: () => getFinancialYears(),
    ...options,
  });
};

export const useGetAllBudgets = (params) => {
  return useQuery({
    queryKey: ['budgets', params],
    queryFn: () => getAllBudgets(params),
  });
};

export const useGetArchivedBudgets = (params) => {
  return useQuery({
    queryKey: ['budgets-archived'],
    queryFn: () => getArchivedBudgets(params),
  });
};
