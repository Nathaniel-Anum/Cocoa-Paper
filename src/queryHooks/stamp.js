import { useQuery } from '@tanstack/react-query';
import { getStamps } from '../http/stamp';

export const useGetStamps = () => {
  return useQuery({
    queryKey: ['stamps'],
    queryFn: () => getStamps(),
  });
};
