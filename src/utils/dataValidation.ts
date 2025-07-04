// Utility functions for multi-user data validation and security

/**
 * Validates that user email is present for data operations
 */
export const validateUserAccess = (userEmail: string | null): boolean => {
  return !!userEmail && userEmail.trim().length > 0;
};

/**
 * Validates that data belongs to the current user
 */
export const validateDataOwnership = (dataUserEmail: string, currentUserEmail: string): boolean => {
  if (!dataUserEmail || !currentUserEmail) {
    return false;
  }
  return dataUserEmail.toLowerCase() === currentUserEmail.toLowerCase();
};

/**
 * Ensures user email is attached to data before database operations
 */
export const attachUserEmail = <T extends Record<string, any>>(
  data: T, 
  userEmail: string
): T & { user_email: string } => {
  if (!validateUserAccess(userEmail)) {
    throw new Error('Valid user email is required for data operations');
  }
  
  return {
    ...data,
    user_email: userEmail
  };
};

/**
 * Validates that all required fields are present for user-scoped operations
 */
export const validateUserScopedData = (
  data: Record<string, any>, 
  requiredFields: string[] = []
): boolean => {
  // Check user_email is present
  if (!data.user_email) {
    console.error('user_email is required for all data operations');
    return false;
  }

  // Check other required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Required field '${field}' is missing`);
      return false;
    }
  }

  return true;
};

/**
 * Creates a user-scoped query filter for Supabase
 */
export const createUserFilter = (userEmail: string) => {
  if (!validateUserAccess(userEmail)) {
    throw new Error('Valid user email is required for queries');
  }
  
  return { user_email: userEmail };
};

/**
 * Error messages for common validation failures
 */
export const ValidationErrors = {
  NO_USER_EMAIL: 'User authentication required. Please log in again.',
  INVALID_OWNERSHIP: 'You do not have permission to access this data.',
  MISSING_REQUIRED_FIELD: (field: string) => `Required field '${field}' is missing.`,
  INVALID_USER_ACCESS: 'Invalid user access. Please check your authentication.',
} as const;