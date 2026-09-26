/** Sélectionne l’URL API adaptée au contexte navigateur ou serveur. */
const browserApiUrl = process.env.NEXT_PUBLIC_API_URL;
const serverApiUrl =
  typeof window === "undefined" ? process.env.API_INTERNAL_URL : undefined;

export const API_BASE_URL =
  serverApiUrl || browserApiUrl || "http://localhost:8000/api";
