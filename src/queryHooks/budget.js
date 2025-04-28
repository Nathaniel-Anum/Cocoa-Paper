import { useQuery } from '@tanstack/react-query';
import { getAllBudgets, getFinancialYears } from '../http/budget';

export const useGetFinancialYear = (options) => {
  return useQuery({
    queryKey: ['financialYears'],
    queryFn: () => getFinancialYears(),
    ...options,
  });
};

export const useGetAllBudgets = (params) => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => getAllBudgets(params),
  });
};
