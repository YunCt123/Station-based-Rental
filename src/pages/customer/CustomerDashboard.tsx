import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    // If user is customer, redirect to rentals
    if (currentUser?.role === 'customer') {
      navigate('/my-rentals', { replace: true });
    } else {
      // If not customer, go to role switcher
      navigate('/role-switcher', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default CustomerDashboard;