"use client";

export function CookiePreferencesButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event("naya:open-cookie-settings"))} className="text-left transition hover:text-[#a45a3d]">Préférences cookies</button>;
}
