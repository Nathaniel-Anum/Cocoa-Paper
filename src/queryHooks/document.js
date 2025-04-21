import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../http/addDocument';

export const useViewDocument = (id) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id),
  });
};
