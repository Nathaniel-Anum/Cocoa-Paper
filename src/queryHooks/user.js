import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../http/users';
import { getRoles } from '../http/staff';
import { getDivisions } from '../http/department';

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

export const useGetDivisions = () => {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: () => getDivisions(),
  });
};
