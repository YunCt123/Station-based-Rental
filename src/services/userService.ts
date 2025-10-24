import api from "./api";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  role: "customer" | "admin" | "staff";
  isVerified: boolean;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
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
  dateOfBirth?: string;
}

export interface UploadVerificationImagesPayload {
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
}

export const userService = {
  // Get current user profile - use auth service since backend doesn't have /users/me
  async getCurrentUser(): Promise<UserProfile> {
    // Since backend doesn't have /users/me endpoint, we'll throw error
    // and let the hook fallback to authService
    throw new Error("Use authService getCurrentUser instead");
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

  // Get verification status
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get("/users/verification/status");
    return response.data.data;
  },

  // Upload verification images
  async uploadVerificationImages(payload: UploadVerificationImagesPayload): Promise<UserProfile> {
    const response = await api.post("/users/verification/upload", payload);
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