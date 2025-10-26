/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
}
export interface AuthResponse {
  user: AuthUser;
  tokens: { accessToken: string; refreshToken: string };
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
    user: {
      id: user.id || user._id || "",
      name: user.name || "",
      email: user.email || "",
      role: user.role || "customer",
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      isVerified: user.isVerified,
    },
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
