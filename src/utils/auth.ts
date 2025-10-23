// Authentication and role-based utilities

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
}

// Kiểm tra xem user có đăng nhập không
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

// Lấy user từ localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Kiểm tra role của user
export const hasRole = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

// Kiểm tra quyền truy cập route
export const canAccessRoute = (
  user: User | null, 
  requireAuth: boolean = true, 
  allowedRoles: string[] = []
): boolean => {
  // Nếu không cần đăng nhập thì cho phép
  if (!requireAuth) return true;
  
  // Nếu cần đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !user) return false;
  
  // Nếu không có role requirement thì cho phép (đã đăng nhập)
  if (allowedRoles.length === 0) return true;
  
  // Kiểm tra role
  return hasRole(user, allowedRoles);
};

// Lấy route mặc định cho từng role
export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'customer':
    default:
      return '/';
  }
};

// Xóa tất cả dữ liệu authentication
export const clearAuthData = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// Route permissions configuration
export const ROUTE_PERMISSIONS = {
  // Public routes (no auth required)
  PUBLIC: {
    requireAuth: false,
    allowedRoles: []
  },
  
  // Customer routes (require auth but any role)
  CUSTOMER: {
    requireAuth: true,
    allowedRoles: ['customer', 'staff', 'admin']
  },
  
  // Staff routes (staff and admin)
  STAFF: {
    requireAuth: true,
    allowedRoles: ['staff', 'admin']
  },
  
  // Admin only routes
  ADMIN: {
    requireAuth: true,
    allowedRoles: ['admin']
  },
  
  // Any authenticated user
  AUTHENTICATED: {
    requireAuth: true,
    allowedRoles: []
  }
} as const;