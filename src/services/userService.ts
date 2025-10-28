import api from "./api";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: "customer" | "admin" | "staff";
  isVerified: boolean;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  
  // Driver's License Information
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  
  // Verification images
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
  
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStatus {
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  hasImages: {
    idCardFront: boolean;
    idCardBack: boolean;
    driverLicense: boolean;
    selfiePhoto: boolean;
  };
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
}

export interface UploadVerificationImagesPayload {
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
}

export const userService = {
  // Get current user profile using /users/me endpoint
  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get("/users/me");
    return response.data.data;
  },

  // Get user by ID (admin only)
  async getUserById(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  },

  // Update user profile (admin only for now)
  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserProfile> {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data.data;
  },

  // Update current user's own profile
  async updateSelf(payload: UpdateUserPayload): Promise<UserProfile> {
    const response = await api.patch("/users/profile", payload);
    return response.data.data;
  },

  // Get verification status
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get("/users/verification/status");
    return response.data.data;
  },

  // Upload verification images
  async uploadVerificationImages(payload: UploadVerificationImagesPayload): Promise<UserProfile> {
    console.log('🚀 Starting uploadVerificationImages with payload:', {
      payloadKeys: Object.keys(payload),
      payloadSizes: Object.entries(payload).map(([key, value]) => ({
        [key]: value ? `${value.length} chars` : 'null'
      }))
    });
    
    const response = await api.post("/users/verification/upload", payload);
    console.log('✅ Upload response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    return response.data.data;
  },

  // List all users (admin only)
  async listUsers(query?: { page?: number; limit?: number }): Promise<{
    data: UserProfile[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data.data;
  }
};

export default userService;

// User interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}

/**
 * Get all users (admin/staff only)
 * GET /v1/users
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<UsersResponse>('/users');
  return response.data.data;
};


const userCache = new Map<string, User>();

/**
 * Preload all users into cache
 * Call this when loading the document verification page
 */
export const preloadUsersCache = async (): Promise<void> => {
  try {
    const users = await getAllUsers();
    users.forEach(user => {
      userCache.set(user._id, user);
    });
  } catch (error) {
    console.error('Error preloading users cache:', error);
  }
};

/**
 * Helper function to get user name and email from user object or ID
 * This is synchronous and works with populated user objects
 */
export const getUserInfo = (user: any): { name: string; email: string } => {
  if (!user) {
    return { name: 'Unknown User', email: 'No email' };
  }
  
  // If user is a string (ID), check cache
  if (typeof user === 'string') {
    if (userCache.has(user)) {
      const cachedUser = userCache.get(user)!;
      return { name: cachedUser.name, email: cachedUser.email };
    }
    return { name: 'Unknown User', email: 'No email' };
  }
  
  // If user is an object with _id
  return {
    name: user.name || 'Unknown User',
    email: user.email || 'No email',
  };
};
