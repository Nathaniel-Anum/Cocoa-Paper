import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../Components/axiosInstance';

export const useTrail = (type) => {
  const shouldUseTypedList = ['incoming', 'outgoing', 'physical'].includes(type);

  const { data, isLoading } = useQuery({
    queryKey: shouldUseTypedList ? ['trail', type] : ['trail'],
    queryFn: async () => {
      if (shouldUseTypedList) {
        const response = await axiosInstance.get(`/trail-list?type=${type}`);
        return response.data;
      }

      const response = await axiosInstance.get('/all-Trails');
      return response.data;
    },
  });

  const trails = shouldUseTypedList ? data || [] : [];
  const allTrails = shouldUseTypedList ? [] : data || [];

  return {
    trails,
    isLoading,
    allTrails,
  };
};
