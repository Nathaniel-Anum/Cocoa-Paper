import { useQuery } from '@tanstack/react-query';
import { getAuditTrail } from '../http/trails';

export const useGetAuditTrail = () => {
  return useQuery({
    queryKey: ['audit-trail'],
    queryFn: () => getAuditTrail(),
  });
};
