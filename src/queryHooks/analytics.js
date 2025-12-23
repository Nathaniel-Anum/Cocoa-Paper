import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../http/analytics';
import { getDivisions } from '../http/department';

export const useGetAnalytics = ({ divisionId }) => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(divisionId),
  });
};

export const useBudgetAnalytics = (divisionId) => {
  return useQuery({
    queryKey: ['budgetAnalytics', divisionId],
    queryFn: () => getAnalytics(divisionId),
  });
};

export const useAllDivisions = () => {
  return useQuery({
    queryKey: ['allDivisions'],
    queryFn: () => getDivisions(),
  });
};
