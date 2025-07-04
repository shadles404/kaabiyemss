import { useAuth } from '../context/AuthContext';

export const useUserEmail = () => {
  const { user } = useAuth();
  return user?.email || '';
};