/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import { signInWithGoogle, signOutFirebase } from "@/config/firebase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  avatar?: string;
  firebase_uid?: string;
  auth_provider?: "local" | "firebase_google";
}

export interface AuthResponse {
  user: AuthUser;
  tokens: { accessToken: string; refreshToken: string };
}

export interface FirebaseAuthResponse {
  user: AuthUser;
  auth_provider: "firebase_google";
}

function unwrap(raw: any) {
  console.debug("[authService] unwrap input:", raw);
  
  if (raw && typeof raw === "object") {
    // If it has a data property, use that
    if ("data" in raw && raw.data) {
      console.debug("[authService] unwrap using raw.data");
      return raw.data;
    }
    // If it has status and other properties but no data, it might be the actual response
    if ("status" in raw || "user" in raw || "tokens" in raw) {
      console.debug("[authService] unwrap using raw directly");
      return raw;
    }
  }
  
  console.debug("[authService] unwrap fallback to raw");
  return raw;
}

function normalize(raw: any, opts: { requireTokens?: boolean } = {}): AuthResponse {
  const { requireTokens = true } = opts;
  const unwrapped = unwrap(raw);
  console.debug("[authService] raw:", raw);
  console.debug("[authService] unwrapped:", unwrapped);

  // For login response: data.user and data.tokens
  // For other responses: might be different structure
  const user = unwrapped?.user || unwrapped?.data?.user || unwrapped?.data || unwrapped || {};
  const tokensObj = unwrapped?.tokens || unwrapped?.data?.tokens || {};
  
  console.debug("[authService] extracted user:", user);
  console.debug("[authService] user keys:", Object.keys(user));
  console.debug("[authService] extracted tokens:", tokensObj);

  const accessToken =
    tokensObj.accessToken ||
    tokensObj.token ||
    tokensObj.access?.token ||
    unwrapped.accessToken ||
    unwrapped.token ||
    unwrapped?.data?.accessToken ||
    unwrapped?.data?.token ||
    "";
  const refreshToken =
    tokensObj.refreshToken ||
    tokensObj.refresh?.token ||
    unwrapped.refreshToken ||
    unwrapped?.data?.refreshToken ||
    "";

  if (requireTokens && !accessToken) {
    console.error("[authService] Could not extract accessToken from keys:", Object.keys(unwrapped || {}));
    throw new Error("Missing access token in server response");
  }

  // Handle email_verified field from backend
  const normalizedUser = {
    id: user.id || user._id || "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "customer",
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    // Priority: email_verified from BE > isVerified > fallback to true
    isVerified: user.email_verified ?? user.isVerified ?? true,
    status: user.status, // Include status if BE provides it
  };
  
  console.debug("[authService] normalizedUser:", normalizedUser);

  return {
    user: normalizedUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  console.log("🔍 [authService] Raw login response from API:", data);
  console.log("🔍 [authService] typeof data:", typeof data);
  console.log("🔍 [authService] Object.keys(data):", Object.keys(data || {}));
  
  // Let's also try to log the full structure
  console.log("🔍 [authService] JSON.stringify(data):", JSON.stringify(data, null, 2));
  
  const normalized = normalize(data, { requireTokens: true });
  console.log("🔍 [authService] Normalized login response:", normalized);
  console.log("🔍 [authService] Normalized user.isVerified:", normalized.user.isVerified);
  
  return normalized;
}

export async function register(payload: {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
}) {
  const { data } = await api.post("/auth/register", payload);
  return normalize(data, { requireTokens: false });
}

export async function getCurrentUser() {
  try {
    // Backend doesn't have /auth/me, so we'll need to get user from JWT or use a different approach
    // For now, let's try to get from localStorage if available
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return { user: userData, tokens: { accessToken: "", refreshToken: "" } };
    }
    
    // If no cached user, throw error to let hook fallback
    throw new Error("No current user available");
  } catch (error) {
    console.error("💥 [authService] getCurrentUser error:", error);
    throw error;
  }
}

// Google Authentication Functions
export async function loginWithGoogle(additionalInfo?: {
  phoneNumber?: string;
  dateOfBirth?: string;
}) {
  try {
    // 1. Sign in with Google popup
    const result = await signInWithGoogle();
    const idToken = await result.user.getIdToken();
    
    console.log("🔥 [authService] Google login result:", {
      user: result.user.email,
      uid: result.user.uid
    });

    // 2. Send token to backend
    const { data } = await api.post("/auth/firebase/google", {
      idToken,
      additionalInfo: additionalInfo || {}
    });

    console.log("🔥 [authService] Backend response:", data);

    // 3. Store tokens
    // Store Firebase token for Firebase-specific API calls
    localStorage.setItem("firebase_token", idToken);
    
    // Also store access_token if backend provides it (for regular API calls)
    if (data.tokens?.accessToken || data.accessToken) {
      const accessToken = data.tokens?.accessToken || data.accessToken;
      localStorage.setItem("access_token", accessToken);
      console.log("✅ [authService] Stored access_token from backend");
    }
    
    if (data.tokens?.refreshToken || data.refreshToken) {
      const refreshToken = data.tokens?.refreshToken || data.refreshToken;
      localStorage.setItem("refresh_token", refreshToken);
    }

    // 4. Normalize response
    // 4. Normalize response
    const normalizedResponse: FirebaseAuthResponse = {
      user: {
        id: data.user.id || data.user._id || "",
        name: data.user.name || result.user.displayName || "",
        email: data.user.email || result.user.email || "",
        role: data.user.role || "customer",
        phoneNumber: data.user.phoneNumber,
        dateOfBirth: data.user.dateOfBirth,
        isVerified: data.user.email_verified || result.user.emailVerified,
        avatar: data.user.avatar || result.user.photoURL || undefined,
        firebase_uid: data.user.firebase_uid || result.user.uid,
        auth_provider: "firebase_google"
      },
      auth_provider: "firebase_google"
    };
    
    return normalizedResponse;
  } catch (error) {
    console.error("💥 [authService] Google login error:", error);
    throw error;
  }
}

export async function logoutGoogle() {
  try {
    // 1. Sign out from Firebase
    await signOutFirebase();
    
    // 2. Clear tokens
    localStorage.removeItem("firebase_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    
    console.log("✅ [authService] Google logout successful");
  } catch (error) {
    console.error("💥 [authService] Google logout error:", error);
    throw error;
  }
}

export async function getCurrentFirebaseUser() {
  try {
    // Try access_token first (if backend provided it), then firebase_token
    const accessToken = localStorage.getItem("access_token");
    const firebaseToken = localStorage.getItem("firebase_token");
    const token = accessToken || firebaseToken;
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔍 [authService] Getting current user with token type:", accessToken ? 'access_token' : 'firebase_token');

    // Use the Firebase-specific endpoint if we have firebase token
    const endpoint = accessToken ? "/auth/me" : "/auth/firebase/me";
    
    const { data } = await api.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      user: {
        id: data.user.id || data.user._id || "",
        name: data.user.name || "",
        email: data.user.email || "",
        role: data.user.role || "customer",
        phoneNumber: data.user.phoneNumber,
        dateOfBirth: data.user.dateOfBirth,
        isVerified: data.user.email_verified,
        avatar: data.user.avatar,
        firebase_uid: data.user.firebase_uid,
        auth_provider: "firebase_google"
      }
    };
  } catch (error) {
    console.error("💥 [authService] getCurrentFirebaseUser error:", error);
    throw error;
  }
}

// Email Verification Functions
export const verifyEmail = async (payload: { code?: string; token?: string }): Promise<{ user: AuthUser }> => {
  try {
    const { data } = await api.post("/auth/verify-email", payload);
    console.log("✅ [authService] verifyEmail response:", data);
    console.log("✅ [authService] verifyEmail data.user:", data?.user);
    
    // Handle case where user might be in different location in response
    const user = data?.user || data?.data?.user || data || {};
    console.log("✅ [authService] extracted user for verify:", user);
    
    if (!user || typeof user !== 'object') {
      console.error("💥 [authService] No user data in verify response:", data);
      throw new Error("Invalid response format from server");
    }
    
    return {
      user: {
        id: user.id || user._id || "",
        name: user.name || "",
        email: user.email || "",
        role: user.role || "customer",
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.email_verified || user.isVerified || true,
        avatar: user.avatar,
        auth_provider: user.auth_provider || "local"
      }
    };
  } catch (error: any) {
    console.error("💥 [authService] verifyEmail error:", error);
    console.error("💥 [authService] verifyEmail error response:", error?.response?.data);
    throw new Error(error?.response?.data?.message || error.message || "Email verification failed");
  }
};

export const resendVerification = async (payload: { email: string }): Promise<{ message: string }> => {
  try {
    const { data } = await api.post("/auth/resend-verification", payload);
    return data;
  } catch (error: any) {
    console.error("💥 [authService] resendVerification error:", error);
    throw new Error(error?.response?.data?.message || error.message || "Resend verification failed");
  }
};

export const checkVerificationStatus = async (email: string): Promise<{
  isVerified: boolean;
  hasPendingVerification: boolean;
  pendingExpiresAt?: string;
}> => {
  try {
    const { data } = await api.get(`/auth/verification-status/${encodeURIComponent(email)}`);
    return data;
  } catch (error: any) {
    console.error("💥 [authService] checkVerificationStatus error:", error);
    throw new Error(error?.response?.data?.message || error.message || "Check verification status failed");
  }
};
