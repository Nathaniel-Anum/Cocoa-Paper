import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../http/users';
import { getRoles } from '../http/staff';
import { getDivisions } from '../http/department';
import { getUserGroups } from '../http/userGroups';

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
};
export const useGetAllUserGroups = () => {
  return useQuery({
    queryKey: ['user-groups'],
    queryFn: () => getUserGroups(),
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
