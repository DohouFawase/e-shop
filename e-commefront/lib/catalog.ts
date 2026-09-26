import { API_BASE_URL } from "@/lib/api-url";

export function formatPrice(value: number | string | null | undefined): string {
  const price = Number(value ?? 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(price) ? price : 0);
}

export function getImagePaths(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Le backend peut aussi renvoyer un seul chemin d'image.
  }

  return [value];
}

export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  const cleanPath = path.replace(/^\/?storage\//, "").replace(/^\//, "");
  return `${origin}/storage/${cleanPath}`;
}
