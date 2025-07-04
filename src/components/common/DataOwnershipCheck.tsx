import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateDataOwnership } from '../../utils/dataValidation';
import { AlertCircle } from 'lucide-react';

interface DataOwnershipCheckProps {
  dataUserEmail: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that verifies data ownership before rendering children
 * Ensures users can only access their own data
 */
const DataOwnershipCheck: React.FC<DataOwnershipCheckProps> = ({
  dataUserEmail,
  children,
  fallback
}) => {
  const { user } = useAuth();

  if (!user?.email || !validateDataOwnership(dataUserEmail, user.email)) {
    return fallback || (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>You do not have permission to access this data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataOwnershipCheck;