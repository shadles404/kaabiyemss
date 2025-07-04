import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

interface UserDataGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireEmail?: boolean;
}

/**
 * Component that ensures user is authenticated before rendering children
 * Provides an additional layer of protection for user data components
 */
const UserDataGuard: React.FC<UserDataGuardProps> = ({ 
  children, 
  requireEmail = true,
  fallback 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please log in to access this data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check email requirement
  if (requireEmail && !user?.email) {
    return fallback || (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Invalid User Session</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Your session is invalid. Please log out and log in again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserDataGuard;