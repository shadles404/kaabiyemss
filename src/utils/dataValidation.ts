import { useAuth } from '../context/AuthContext';

// Utility to ensure user email is attached to all data operations
export const validateUserAccess = (userEmail: string | null): boolean => {
  return !!userEmail;
};

// Helper to get current user email for data operations
export const getCurrentUserEmail = (): string => {
  // This should be used within components that have access to auth context
  throw new Error('Use useUserEmail hook instead');
};

// Validate that data belongs to current user
export const validateDataOwnership = (dataUserEmail: string, currentUserEmail: string): boolean => {
  return dataUserEmail === currentUserEmail;
};