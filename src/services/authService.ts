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

  const user = unwrapped?.user || {};
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

  return {
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
