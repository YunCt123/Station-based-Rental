import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessRoute, getDefaultRouteForRole, type User } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  requireAuth?: boolean;
  allowedRoles?: Array<"customer" | "staff" | "admin">;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();

  // Sử dụng utility function để kiểm tra quyền truy cập
  if (!canAccessRoute(user, requireAuth, allowedRoles)) {
    // Nếu chưa đăng nhập thì redirect về login
    if (!user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // Nếu đã đăng nhập nhưng không có quyền thì redirect về trang chính của role
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;