import { api } from "@/config/config";

const VISITOR_COOKIE = "naya_visitor_id";
const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 3) | 8).toString(16);
  });
}

export function getVisitorId() {
  if (typeof document === "undefined") return null;
  const existing = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${VISITOR_COOKIE}=`))?.split("=").slice(1).join("=");
  if (existing && visitorIdPattern.test(existing)) return existing;

  const visitorId = createUuid();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${VISITOR_COOKIE}=${visitorId}; Max-Age=2592000; Path=/; SameSite=Lax${secure}`;
  return visitorId;
}

export const visitorTrackingService = {
  async trackPageView(visitorId: string, pagePath: string) {
    await api.post("/analytics/visits", { visitor_id: visitorId, page_path: pagePath });
  },
};
