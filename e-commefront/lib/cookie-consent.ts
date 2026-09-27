export const ANALYTICS_CONSENT_KEY = "naya-analytics-consent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}
