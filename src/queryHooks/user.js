import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../http/users';

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
};
