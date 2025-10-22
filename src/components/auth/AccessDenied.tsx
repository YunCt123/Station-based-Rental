import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
}

interface AccessDeniedProps {
  user?: User | null;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ user }) => {
  const getHomeRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'customer':
      default:
        return '/';
    }
  };

  const getRoleName = () => {
    if (!user) return 'Guest';
    
    switch (user.role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      case 'customer':
        return 'Customer';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md w-full">
        <div className="text-center">
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-1 text-xs text-gray-500">
              Current role: {getRoleName()}
            </p>
          )}
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              This page requires different permissions than your current role.
            </p>
            
            <div className="space-y-3">
              <Link
                to={getHomeRoute()}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
              
              {!user && (
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;