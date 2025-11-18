import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessRoute, type User } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import AccessDenied from './AccessDenied';

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
  const { toast } = useToast();

  // Kiểm tra quyền truy cập
  const hasAccess = canAccessRoute(user, requireAuth, allowedRoles);
  const isLoggedIn = !!user;

  // Hiển thị toast khi người dùng chưa đăng nhập và cần đăng nhập
  useEffect(() => {
    if (!hasAccess && !isLoggedIn && requireAuth) {
      toast({
        title: "Authentication Required",
        description: "You need to log in to access this page.",
        variant: "destructive",
      });
    }
  }, [hasAccess, isLoggedIn, requireAuth, toast]);

  // Sử dụng utility function để kiểm tra quyền truy cập
  if (!hasAccess) {
    // Nếu chưa đăng nhập thì redirect về login
    if (!user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // Nếu đã đăng nhập nhưng không có quyền thì hiển thị AccessDenied
    return <AccessDenied user={user} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;