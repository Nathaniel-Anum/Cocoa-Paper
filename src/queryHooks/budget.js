import { useQuery } from '@tanstack/react-query';
import { getAllBudgets, getFinancialYears } from '../http/budget';

export const useGetFinancialYear = () => {
  return useQuery({
    queryKey: ['financialYears'],
    queryFn: () => getFinancialYears(),
  });
};

export const useGetAllBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => getAllBudgets(),
  });
};
