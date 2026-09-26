"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";

import { pushService } from "@/services/notifications/pushService";

export function PushNotificationsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const browserSupportsPush = pushService.supported();
    queueMicrotask(() => setSupported(browserSupportsPush));
    if (!browserSupportsPush) return;
    void pushService.currentSubscription().then((subscription) => {
      setEnabled(Boolean(subscription) && Notification.permission === "granted");
    });
  }, []);

  if (!supported) return null;

  async function toggle() {
    setBusy(true);
    try {
      if (enabled) {
        await pushService.unsubscribe();
        setEnabled(false);
        toast.success("Notifications de commande désactivées.");
      } else {
        await pushService.subscribe();
        setEnabled(true);
        toast.success("Vous serez informé des changements de vos commandes.");
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Impossible de configurer les notifications.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={enabled}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-800 disabled:opacity-60"
    >
      <BellRing size={16} />
      {busy ? "Configuration…" : enabled ? "Désactiver les notifications" : "Activer les notifications"}
    </button>
  );
}
