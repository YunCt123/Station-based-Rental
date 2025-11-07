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
  if (raw && typeof raw === "object" && "data" in raw && raw.data) return raw.data;
  return raw;
}

function normalize(raw: any, opts: { requireTokens?: boolean } = {}): AuthResponse {
  const { requireTokens = true } = opts;
  const unwrapped = unwrap(raw);
  console.debug("[authService] raw:", raw);
  console.debug("[authService] unwrapped:", unwrapped);
  console.debug("[authService] unwrapped.data:", unwrapped?.data);

  const user = unwrapped?.user || unwrapped?.data || unwrapped || {};
  console.debug("[authService] extracted user:", user);
  
  const tokensObj = unwrapped?.tokens || {};

  const accessToken =
    tokensObj.accessToken ||
    tokensObj.token ||
    tokensObj.access?.token ||
    unwrapped.accessToken ||
    unwrapped.token ||
    "";
  const refreshToken =
    tokensObj.refreshToken ||
    tokensObj.refresh?.token ||
    unwrapped.refreshToken ||
    "";

  if (requireTokens && !accessToken) {
    console.error("[authService] Could not extract accessToken from keys:", Object.keys(unwrapped || {}));
    throw new Error("Missing access token in server response");
  }

  const normalizedUser = {
    id: user.id || user._id || "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    isVerified: user.isVerified,
  };
  
  console.debug("[authService] normalizedUser:", normalizedUser);

  return {
    user: normalizedUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return normalize(data, { requireTokens: true });
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

    // 3. Normalize response
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

    // 4. Store Firebase token for API calls
    localStorage.setItem("firebase_token", idToken);
    
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
    const token = localStorage.getItem("firebase_token");
    if (!token) {
      throw new Error("No Firebase token found");
    }

    const { data } = await api.get("/auth/firebase/me", {
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
