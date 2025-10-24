import { useState, useEffect, useCallback } from "react";
import { userService, type UserProfile, type VerificationStatus } from "@/services/userService";
import { getCurrentUser } from "@/services/authService";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseExpiry: string;
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
      phone: "", // Backend doesn't have phone field yet
      dateOfBirth: user.dateOfBirth ? 
        new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      licenseNumber: "", // We'll need to add this to backend
      licenseExpiry: "", // We'll need to add this to backend
    };

    console.log("📤 [convertUserToProfile] Result:", result);
    return result;
  };

  // Load user profile from API
  const loadProfile = useCallback(async () => {
    console.log("🔍 [useUserProfile] Starting to load profile...");
    
    // Check if user is authenticated
    const accessToken = localStorage.getItem("access_token");
    console.log("🔑 [useUserProfile] Access token:", accessToken ? "exists" : "missing");
    
    if (!accessToken) {
      console.log("❌ [useUserProfile] No access token found");
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Try userService first, fallback to authService
      let userData: UserProfile | null = null;
      try {
        console.log("🔍 [useUserProfile] Trying userService.getCurrentUser()...");
        userData = await userService.getCurrentUser();
        console.log("✅ [useUserProfile] userService success:", userData);
      } catch (userServiceError) {
        console.log("❌ [useUserProfile] userService failed:", userServiceError);
        console.log("🔍 [useUserProfile] Falling back to authService...");
        
        // Fallback to auth service if userService fails
        const authData = await getCurrentUser();
        console.log("📋 [useUserProfile] authData:", authData);
        
        // Convert AuthUser to UserProfile format
        const authUser = authData.user;
        console.log("👤 [useUserProfile] authUser:", authUser);
        
        userData = {
          _id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role as "customer" | "admin" | "staff",
          isVerified: authUser.isVerified || false,
          verificationStatus: "PENDING",
          dateOfBirth: authUser.dateOfBirth,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log("🔄 [useUserProfile] Converted userData:", userData);
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
      
      // Combine firstName and lastName if they're being updated
      const updatePayload: {
        name?: string;
        dateOfBirth?: string;
      } = {};
      
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const firstName = data.firstName ?? profile.firstName;
        const lastName = data.lastName ?? profile.lastName;
        updatePayload.name = `${firstName} ${lastName}`.trim();
      }
      
      if (data.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = data.dateOfBirth;
      }

      // Note: Backend currently requires admin role to update user
      // For now, we'll just update local state
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);

      // TODO: When backend allows user self-update, uncomment:
      // await userService.updateUser(userId, updatePayload);
      
    } catch (err) {
      console.error("Error updating profile:", err);
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