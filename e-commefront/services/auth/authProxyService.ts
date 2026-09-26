import { API_BASE_URL } from "@/lib/api-url";

export type AdminAuthorization = "allowed" | "unauthenticated" | "forbidden" | "unavailable";

/** Vérifie côté serveur le JWT et le rôle avec la route Laravel protégée. */
export async function verifyAdminAccess(token: string): Promise<AdminAuthorization> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?per_page=1`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) return "allowed";
    if (response.status === 401) return "unauthenticated";
    if (response.status === 403) return "forbidden";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
