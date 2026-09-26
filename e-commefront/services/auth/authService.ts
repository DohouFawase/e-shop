import axios from "axios";

import { api } from "@/config/config";

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  location?: string;
  timezone?: string;
}

export interface PasswordResetPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface MessageResponse {
  message: string;
}

export type ResetPasswordResponse = MessageResponse;

function parseJsonText(value: unknown): unknown {
  let parsed = value;
  for (let depth = 0; depth < 3 && typeof parsed === "string"; depth += 1) {
    const original = parsed.trim().replace(/^\uFEFF/, "");
    const candidates = [
      original,
      original.replace(/\\(["'])/g, "$1"),
      original.replace(/&quot;/gi, '"').replace(/&#0*34;/gi, '"'),
    ];
    let decoded: unknown = original;
    let succeeded = false;
    for (const candidate of candidates) {
      try {
        decoded = JSON.parse(candidate) as unknown;
        succeeded = true;
        break;
      } catch {
        // Essaie les formes de JSON échappées courantes avant de déclarer le texte invalide.
      }
    }
    if (!succeeded) return parsed;
    parsed = decoded;
  }
  return parsed;
}

function findAccessToken(value: unknown, depth = 0): string | undefined {
  if (typeof value === "string") {
    // Secours aux réponses marquées JSON mais contenant du texte imparfaitement sérialisé.
    const unescaped = value.replace(/\\(["'])/g, "$1");
    const tokenMatch = unescaped.match(/(?:["']?access\?_token["']?|accessToken)\s*[:=]\s*["']?([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/i);
    if (tokenMatch?.[1]) return tokenMatch[1];
  }
  const parsed = parseJsonText(value);
  if (!parsed || typeof parsed !== "object" || depth > 5) return undefined;
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const token = findAccessToken(item, depth + 1);
      if (token) return token;
    }
    return undefined;
  }

  const record = parsed as Record<string, unknown>;
  for (const key of ["access_token", "accessToken"]) {
    const token = record[key];
    if (typeof token === "string" && token.trim() !== "") return token;
  }
  for (const nested of Object.values(record)) {
    const token = findAccessToken(nested, depth + 1);
    if (token) return token;
  }
  return undefined;
}

function normalizeAuthResponse(response: unknown, context: "connexion" | "inscription", contentType?: string): AuthResponse {
  const token = findAccessToken(response);
  if (!token) {
    const payload = parseJsonText(response);
    const keys = payload && typeof payload === "object" && !Array.isArray(payload)
      ? Object.keys(payload).join(", ")
      : typeof payload === "string"
        ? `texte de ${payload.length} caractères, premier caractère ${JSON.stringify(payload.trimStart().slice(0, 1))}`
        : typeof payload;
    throw new Error(`Réponse de ${context} sans jeton (${keys || "aucun"}${contentType ? `, Content-Type : ${contentType}` : ""}).`);
  }

  const parsed = parseJsonText(response);
  const body = parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {};
  return { ...body, access_token: token } as AuthResponse;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<unknown>("/login", credentials);
    return normalizeAuthResponse(response.data, "connexion", String(response.headers["content-type"] ?? ""));
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<unknown>("/register", payload);
    return normalizeAuthResponse(response.data, "inscription", String(response.headers["content-type"] ?? ""));
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<{ user: AuthUser }>("/me");
    return data.user;
  },

  async checkAdminAccess(): Promise<boolean> {
    try {
      await api.get("/orders", { params: { per_page: 1 } });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      throw error;
    }
  },

  async currentUserWithRole(): Promise<AuthUser> {
    const user = await this.me();
    const isAdmin =
      typeof user.is_admin === "boolean"
        ? user.is_admin
        : await this.checkAdminAccess();

    return { ...user, is_admin: isAdmin };
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/forgot-password", {
      email,
    });
    return data;
  },

  async resetPassword(
    payload: PasswordResetPayload,
  ): Promise<ResetPasswordResponse> {
    const { data } = await api.post<ResetPasswordResponse>(
      "/reset-password",
      payload,
    );
    return data;
  },

  async logout(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/logout");
    return data;
  },

  async refresh(): Promise<Pick<AuthResponse, "access_token" | "token_type" | "expires_in">> {
    const { data } = await api.post<
      Pick<AuthResponse, "access_token" | "token_type" | "expires_in">
    >("/refresh");
    return data;
  },

  async verifyEmail(
    id: string,
    hash: string,
    signedQuery: string,
  ): Promise<MessageResponse> {
    const query = signedQuery.startsWith("?")
      ? signedQuery
      : `?${signedQuery}`;
    const path = `/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}${query}`;
    const { data } = await api.get<MessageResponse>(path);
    return data;
  },

  async resendVerification(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/email/verification-notification",
    );
    return data;
  },
};
