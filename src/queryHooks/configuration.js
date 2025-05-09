import { useQuery } from '@tanstack/react-query';
import { getConfiguration } from '../http/configuration';

export const useGetAllConfigurations = () => {
  return useQuery({
    queryKey: ['configurations'],
    queryFn: () => getConfiguration(),
  });
};
