import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../http/analytics';

export const useGetAnalytics = () => {
  return useQuery({ queryKey: 'analytics', queryFn: getAnalytics });
};
