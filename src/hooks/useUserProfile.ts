import { useState, useEffect, useCallback } from "react";
import { userService, type UserProfile, type VerificationStatus } from "@/services/userService";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseClass: string;
  
  // Verification document URLs
  driverLicense?: string;
  idCardFront?: string;
  idCardBack?: string;
  selfiePhoto?: string;
}

export interface UseUserProfileReturn {
  profile: UserProfileData | null;
  verificationStatus: VerificationStatus | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadVerificationImages: (images: {
    idCardFront?: string;
    idCardBack?: string;
    driverLicense?: string;
    selfiePhoto?: string;
  }) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend user to profile format
  const convertUserToProfile = (user: UserProfile): UserProfileData => {
    console.log("🔄 [convertUserToProfile] Input user:", user);
    
    const nameParts = user.name?.split(" ") || ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    console.log("📝 [convertUserToProfile] Name parts:", { nameParts, firstName, lastName });

    const result = {
      firstName,
      lastName,
      email: user.email || "",
      phone: user.phoneNumber || "", // Use real phoneNumber from backend
      dateOfBirth: user.dateOfBirth ? 
        new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      licenseNumber: user.licenseNumber || "", // Use real licenseNumber from backend
      licenseExpiry: user.licenseExpiry ? 
        new Date(user.licenseExpiry).toISOString().split('T')[0] : "", // Use real licenseExpiry from backend
      licenseClass: user.licenseClass || "", // Use real licenseClass from backend
      
      // Verification document URLs
      driverLicense: user.driverLicense,
      idCardFront: user.idCardFront,
      idCardBack: user.idCardBack,
      selfiePhoto: user.selfiePhoto,
    };

    console.log("📤 [convertUserToProfile] Result:", result);
    return result;
  };

  // Load user profile from API
  const loadProfile = useCallback(async () => {
    console.log("🔍 [useUserProfile] Starting to load profile...");
    
    // Check if user is authenticated (support both local and Firebase auth)
    const accessToken = localStorage.getItem("access_token");
    const firebaseToken = localStorage.getItem("firebase_token");
    const token = accessToken || firebaseToken;
    
    console.log("🔑 [useUserProfile] Token status:", {
      accessToken: accessToken ? "exists" : "missing",
      firebaseToken: firebaseToken ? "exists" : "missing",
      hasToken: !!token
    });
    
    if (!token) {
      console.log("❌ [useUserProfile] No authentication token found");
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Load user profile from userService
      let userData: UserProfile | null = null;
      try {
        console.log("🔍 [useUserProfile] Calling userService.getCurrentUser()...");
        userData = await userService.getCurrentUser();
        console.log("✅ [useUserProfile] userService success:", userData);
      } catch (userServiceError) {
        console.error("❌ [useUserProfile] userService failed:", userServiceError);
        
        // Provide more specific error message
        if (userServiceError && typeof userServiceError === 'object' && 'message' in userServiceError) {
          const errorMessage = (userServiceError as { message: string }).message;
          if (errorMessage.includes('Invalid or expired token')) {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else if (errorMessage.includes('Unauthorized')) {
            setError("Không có quyền truy cập. Vui lòng đăng nhập lại.");
          } else {
            setError(`Lỗi tải thông tin: ${errorMessage}`);
          }
        } else {
          setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
        }
        
        setIsLoading(false);
        return;
      }

      if (userData) {
        console.log("🔍 [useUserProfile] Converting userData to profile...");
        const profileData = convertUserToProfile(userData);
        console.log("📝 [useUserProfile] Profile data:", profileData);
        setProfile(profileData);
      } else {
        console.log("❌ [useUserProfile] No userData received");
      }

      // Load verification status
      try {
        console.log("🔍 [useUserProfile] Loading verification status...");
        const verification = await userService.getVerificationStatus();
        console.log("✅ [useUserProfile] Verification status:", verification);
        setVerificationStatus(verification);
      } catch (verifyError) {
        console.warn("⚠️ [useUserProfile] Could not load verification status:", verifyError);
      }

    } catch (err) {
      console.error("💥 [useUserProfile] Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      console.log("🏁 [useUserProfile] Loading complete");
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = async (data: Partial<UserProfileData>) => {
    if (!profile) return;

    try {
      setError(null);
      
      // Prepare update payload for backend
      const updatePayload: {
        name?: string;
        phoneNumber?: string;
        dateOfBirth?: string;
        licenseNumber?: string;
        licenseExpiry?: string;
        licenseClass?: string;
      } = {};
      
      // Combine firstName and lastName if they're being updated
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const firstName = data.firstName ?? profile.firstName;
        const lastName = data.lastName ?? profile.lastName;
        updatePayload.name = `${firstName} ${lastName}`.trim();
      }
      
      if (data.phone !== undefined) {
        updatePayload.phoneNumber = data.phone;
      }
      
      if (data.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = data.dateOfBirth;
      }
      
      if (data.licenseNumber !== undefined) {
        updatePayload.licenseNumber = data.licenseNumber;
      }
      
      if (data.licenseExpiry !== undefined) {
        updatePayload.licenseExpiry = data.licenseExpiry;
      }
      
      if (data.licenseClass !== undefined) {
        updatePayload.licenseClass = data.licenseClass;
      }

      console.log("🔄 [updateProfile] Sending update payload:", updatePayload);
      
      // Call backend API
      const updatedUser = await userService.updateSelf(updatePayload);
      console.log("✅ [updateProfile] Updated user:", updatedUser);
      
      // Convert and update local state
      const updatedProfile = convertUserToProfile(updatedUser);
      setProfile(updatedProfile);
      
    } catch (err) {
      console.error("💥 [updateProfile] Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  // Upload verification images
  const uploadVerificationImages = async (images: {
    idCardFront?: string;
    idCardBack?: string;
    driverLicense?: string;
    selfiePhoto?: string;
  }) => {
    try {
      setError(null);
      
      await userService.uploadVerificationImages(images);
      
      // Refresh verification status
      const verification = await userService.getVerificationStatus();
      setVerificationStatus(verification);
      
    } catch (err) {
      console.error("Error uploading verification images:", err);
      setError(err instanceof Error ? err.message : "Failed to upload images");
      throw err;
    }
  };

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    verificationStatus,
    isLoading,
    error,
    updateProfile,
    refreshProfile: loadProfile,
    uploadVerificationImages,
  };
};