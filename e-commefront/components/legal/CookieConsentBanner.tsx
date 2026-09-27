"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ANALYTICS_CONSENT_KEY } from "@/lib/cookie-consent";

function clearVisitorCookie() {
  document.cookie = "naya_visitor_id=; Max-Age=0; Path=/; SameSite=Lax";
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === null);
    } catch {
      setVisible(true);
    }
    const openSettings = () => setVisible(true);
    window.addEventListener("naya:open-cookie-settings", openSettings);
    return () => window.removeEventListener("naya:open-cookie-settings", openSettings);
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      // Le choix reste appliqué pour la session si le stockage local est indisponible.
    }
    if (value === "rejected") clearVisitorCookie();
    setVisible(false);
    window.dispatchEvent(new Event("naya:analytics-consent-updated"));
  }

  if (!visible) return null;

  return <aside role="dialog" aria-label="Préférences de cookies" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-4xl border border-zinc-300 bg-white p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-serif text-xl text-zinc-950">Vos préférences de cookies</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">Les cookies nécessaires assurent le fonctionnement de la boutique. Avec votre accord, nous utilisons aussi un identifiant pour mesurer les pages consultées. Vous pouvez accepter ou refuser cette mesure sans bloquer vos achats. <Link href="/cookies" className="underline underline-offset-4">En savoir plus</Link>.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={() => choose("rejected")} className="min-h-11 border border-zinc-300 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-800 hover:bg-zinc-50">Refuser</button>
        <button type="button" onClick={() => choose("accepted")} className="min-h-11 bg-zinc-950 px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-zinc-700">Accepter la mesure</button>
      </div>
    </div>
  </aside>;
}
