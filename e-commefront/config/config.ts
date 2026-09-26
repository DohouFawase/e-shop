import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "@/lib/api-url";

const ACCESS_TOKEN_COOKIE = "accessToken";
const EXPIRATION_BUFFER_SECONDS = 30;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

/** Stocke le access_token retourné par les endpoints /login et /register. */
export function setAccessToken(token: unknown): void {
  if (typeof document === "undefined") return;
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Le serveur n’a pas renvoyé de jeton d’accès valide.");
  }

  const { exp } = jwtDecode<{ exp?: number }>(token);
  const expires = typeof exp === "number" ? new Date(exp * 1000) : undefined;

  Cookies.set(ACCESS_TOKEN_COOKIE, token, {
    expires,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getAccessToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(ACCESS_TOKEN_COOKIE);
}

export function clearAccessToken(): void {
  if (typeof document === "undefined") return;
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
}

api.interceptors.request.use((config) => {
  // Les composants serveur Next.js n'ont pas accès aux cookies du navigateur.
  if (typeof document === "undefined") return config;

  const token = Cookies.get(ACCESS_TOKEN_COOKIE);
  if (!token) return config;

  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    const expired =
      typeof exp === "number" &&
      exp <= Date.now() / 1000 + EXPIRATION_BUFFER_SECONDS;

    if (expired) {
      clearAccessToken();
      delete config.headers.Authorization;
      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Une valeur invalide ne doit pas empêcher les appels publics (login/register).
    clearAccessToken();
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
