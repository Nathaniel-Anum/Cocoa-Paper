import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../http/users';
import { getRoles } from '../http/staff';

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
};

export const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
  });
};
