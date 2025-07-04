import { useAuth } from '../context/AuthContext';

export const useUserEmail = () => {
  const { user } = useAuth();
  
  if (!user?.email) {
    console.warn('useUserEmail: No authenticated user found');
    return '';
  }
  
  return user.email;
};

// Helper function to validate user email before data operations
export const validateUserEmail = (userEmail: string | null): boolean => {
  if (!userEmail) {
    console.error('User email is required for data operations');
    return false;
  }
  return true;
};

// Helper to ensure user email is provided for all data operations
export const requireUserEmail = (userEmail: string | null): string => {
  if (!userEmail) {
    throw new Error('User authentication required. Please log in again.');
  }
  return userEmail;
};