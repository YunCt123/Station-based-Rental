// Authentication and role-based utilities

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean; // Legacy field - deprecated
  avatar?: string;
  firebase_uid?: string;
  auth_provider?: "local" | "firebase_google";
  
  // New verification fields from BE
  licenseNumber?: string;
  licenseExpiry?: Date;
  licenseClass?: string;
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
}

// Kiểm tra xem user có đăng nhập không
export const isAuthenticated = (): boolean => {
  const localToken = localStorage.getItem("access_token");
  const firebaseToken = localStorage.getItem("firebase_token");
  const user = localStorage.getItem("user") || localStorage.getItem("userInfo");
  
  // User đăng nhập nếu có token (local hoặc firebase) và user info
  return !!(user && (localToken || firebaseToken));
};

// Kiểm tra auth provider
export const getAuthProvider = (): "local" | "firebase_google" | null => {
  const firebaseToken = localStorage.getItem("firebase_token");
  const localToken = localStorage.getItem("access_token");
  
  if (firebaseToken) return "firebase_google";
  if (localToken) return "local";
  return null;
};

// Lấy user từ localStorage
export const getCurrentUser = (): User | null => {
  try {
    // Ưu tiên userInfo (Firebase) trước, sau đó user (local auth)
    const userStr = localStorage.getItem("userInfo") || localStorage.getItem("user");
    if (!userStr) return null;
    
    const userData = JSON.parse(userStr);
    
    // Determine auth provider
    const provider = getAuthProvider();
    if (provider) {
      userData.auth_provider = provider;
    }
    
    return userData;
  } catch {
    return null;
  }
};

// Kiểm tra role của user
export const hasRole = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

// Kiểm tra user đã được verify chưa (theo BE schema mới)
export const isUserVerified = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check new verification status field first
  if (user.verificationStatus) {
    return user.verificationStatus === "APPROVED";
  }
  
  // Fallback to legacy isVerified field
  return user.isVerified === true;
};

// Lấy verification status message
export const getVerificationStatusMessage = (user: User | null): string => {
  if (!user) return "Not logged in";
  
  switch (user.verificationStatus) {
    case "APPROVED":
      return "Account verified";
    case "REJECTED":
      return user.rejectionReason || "Account verification rejected";
    case "PENDING":
    default:
      return "Account verification pending";
  }
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
  localStorage.removeItem("userInfo");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("firebase_token");
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