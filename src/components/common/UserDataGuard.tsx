import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface UserDataGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that ensures user is authenticated before rendering children
 * Provides an additional layer of protection for user data components
 */
const UserDataGuard: React.FC<UserDataGuardProps> = ({ 
  children, 
  fallback = (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="text-sm text-yellow-700">
        Please log in to access this data.
      </div>
    </div>
  )
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.email) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default UserDataGuard;