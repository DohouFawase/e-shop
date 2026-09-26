"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { notificationService } from "@/services/notifications/notificationService";

type CustomerNotification = {
  id: string;
  data: {
    title?: string;
    message?: string;
    body?: string;
    url?: string;
    order_id?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
};

export function CustomerNotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [items, count] = await Promise.all([
        notificationService.list(),
        notificationService.unreadCount(),
      ]);
      setNotifications(items as CustomerNotification[]);
      setUnread(Number(count));
    } catch {
      // Keep the header usable when notifications are temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [items, count] = await Promise.all([
          notificationService.list(),
          notificationService.unreadCount(),
        ]);
        if (!active) return;
        setNotifications(items as CustomerNotification[]);
        setUnread(Number(count));
      } catch {
        // The notification menu remains available and retries on the next poll.
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  async function openNotification(item: CustomerNotification) {
    if (!item.read_at) {
      try {
        await notificationService.markRead(item.id);
        setUnread((count) => Math.max(0, count - 1));
        setNotifications((items) =>
          items.map((notification) =>
            notification.id === item.id
              ? { ...notification, read_at: new Date().toISOString() }
              : notification,
          ),
        );
      } catch {
        // Navigation should still work if marking as read fails.
      }
    }
    setOpen(false);
    router.push(typeof item.data.url === "string" ? item.data.url : "/account/orders");
  }

  async function markAllRead() {
    setLoading(true);
    try {
      await notificationService.markAllRead();
      const now = new Date().toISOString();
      setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at ?? now })));
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} non lue${unread > 1 ? "s" : ""}` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          void refresh();
        }}
        className="relative grid size-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button aria-label="Fermer les notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <section className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">Commandes et paiements</p>
              </div>
              {unread > 0 && (
                <button type="button" disabled={loading} onClick={() => void markAllRead()} className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:underline disabled:opacity-50">
                  <CheckCheck className="size-3.5" /> Tout lire
                </button>
              )}
            </header>
            <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">Aucune notification pour le moment.</p>
              ) : notifications.slice(0, 20).map((item) => (
                <button key={item.id} type="button" onClick={() => void openNotification(item)} className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${item.read_at ? "bg-white" : "bg-teal-50/60"}`}>
                  <span className="flex items-start gap-2">
                    {!item.read_at && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-600" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">{item.data.title ?? "Mise à jour de commande"}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-600">{item.data.message ?? item.data.body ?? "Consultez vos commandes pour voir les détails."}</span>
                      <span className="mt-1 block text-[10px] text-slate-400">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <footer className="border-t border-slate-100 px-4 py-3 text-center">
              <button type="button" onClick={() => { setOpen(false); router.push("/account/orders"); }} className="text-sm font-medium text-teal-800 hover:underline">Voir mes commandes</button>
            </footer>
          </section>
        </>
      )}
    </div>
  );
}

export default CustomerNotificationBell;
