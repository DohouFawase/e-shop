"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock3, Mail, Search, Sun, BellRing } from "lucide-react";
import { toast } from "sonner";

import { fetchContactInbox } from "@/store/contactInboxSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushService } from "@/services/notifications/pushService";
import { getAccessToken } from "@/config/config";
import { API_BASE_URL } from "@/lib/api-url";
import {
  notificationService,
  type AdminNotification,
} from "@/services/notifications/notificationService";

type DashboardTopbarProps = {
  title?: string;
  avatarUrl?: string;
  avatarAlt?: string;
};

const notificationDate = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

/** Compact dashboard toolbar matching the supplied reference image. */
export function DashboardTopbar({
  title = "Dashboard",
  avatarUrl,
  avatarAlt = "Profil",
}: DashboardTopbarProps) {
  const [lightMode, setLightMode] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [clockTimestamp, setClockTimestamp] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const authUser = useAppSelector((state) => state.auth.user);
  const isAdmin = authUser?.is_admin === true;
  const profileTimezone = useAppSelector((state) => state.profile.profile?.timezone);
  const localTimezone = profileTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const unreadMessages = useAppSelector((state) => state.contactInbox.unreadCount);
  const totalMessages = useAppSelector((state) => state.contactInbox.total);
  const pushSupported = isAdmin && pushService.supported();

  const pageTitle = (() => {
    if (pathname === "/dashboard") return "Tableau de bord";
    if (pathname === "/dashboard/orders") return "Commandes";
    if (pathname === "/dashboard/contact-messages") return "Messages de contact";
    if (pathname === "/dashboard/profile") return "Mon profil";
    if (pathname.startsWith("/dashboard/orders/")) return "Détail de la commande";
    if (pathname === "/dashboard/customers") return "Clients";
    if (pathname.startsWith("/dashboard/customers/")) return "Fiche client";
    if (pathname === "/dashboard/categories/new") return "Ajouter une catégorie";
    if (pathname.match(/^\/dashboard\/categories\/[^/]+\/edit$/)) return "Modifier la catégorie";
    if (pathname === "/dashboard/categories" || pathname.match(/^\/dashboard\/categories\/[^/]+$/)) return "Catégories";
    if (pathname === "/dashboard/products/new") return "Ajouter un produit";
    if (pathname.match(/^\/dashboard\/products\/[^/]+\/edit$/)) return "Modifier le produit";
    if (pathname.match(/^\/dashboard\/products\/[^/]+$/)) return "Détail du produit";
    if (pathname === "/dashboard/products") return "Produits";
    if (pathname === "/dashboard/reviews") return "Avis produits";
    return title;
  })();

  useEffect(() => {
    if (!isAdmin) return;
    const updateClock = () => setClockTimestamp(Date.now());
    updateClock();
    const interval = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(interval);
  }, [isAdmin]);

  const refreshNotifications = useCallback(async () => {
    if (!isAdmin) return;
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const [items, count] = await Promise.all([
        notificationService.list(),
        notificationService.unreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch {
      setNotificationsError("Impossible de charger les notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!pushService.supported()) return;
    void pushService.currentSubscription().then((subscription) => {
      setPushEnabled(Boolean(subscription) && Notification.permission === "granted");
    });
  }, [isAdmin]);

  async function togglePushNotifications() {
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await pushService.unsubscribe();
        setPushEnabled(false);
        toast.success("Notifications système désactivées.");
      } else {
        await pushService.subscribe();
        setPushEnabled(true);
        toast.success("Vous recevrez les notifications de commandes même lorsque le site est fermé.");
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Impossible de configurer les notifications système.");
    } finally {
      setPushBusy(false);
    }
  }

  useEffect(() => {
    const token = getAccessToken();
    const host = process.env.NEXT_PUBLIC_REVERB_HOST;
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!isAdmin || !authUser?.id || !token || !host || !key) return;

    let echo: import("laravel-echo").default<"reverb"> | undefined;
    let cancelled = false;
    const channelName = `App.Models.User.${authUser.id}`;

    void Promise.all([import("laravel-echo"), import("pusher-js")]).then(([echoModule, pusherModule]) => {
      if (cancelled) return;
      const Pusher = pusherModule.default;
      (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;
      const Echo = echoModule.default;
      const secure = process.env.NEXT_PUBLIC_REVERB_SCHEME !== "http";
      const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || (secure ? 443 : 80));
      echo = new Echo({
        broadcaster: "reverb",
        key,
        wsHost: host,
        wsPort: port,
        wssPort: port,
        forceTLS: secure,
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${API_BASE_URL.replace(/\/+$/, "")}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      });
      echo.private(channelName).notification((notification: Record<string, unknown>) => {
        void refreshNotifications();
        const message = typeof notification.message === "string"
          ? notification.message
          : "Nouvelle notification reçue.";
        const customer = typeof notification.customer_name === "string"
          ? notification.customer_name
          : undefined;
        const orderId = notification.order_id;
        const orderUrl = orderId !== undefined
          ? `/dashboard/orders/${encodeURIComponent(String(orderId))}`
          : undefined;

        toast(message, {
          description: customer ? `Commande de ${customer}` : undefined,
          duration: 8000,
          action: orderUrl
            ? { label: "Voir la commande", onClick: () => routerRef.current.push(orderUrl) }
            : undefined,
        });
      });
    }).catch(() => {
      // L’interface garde les notifications consultables via le chargement périodique.
    });

    return () => {
      cancelled = true;
      if (echo) {
        echo.leave(channelName);
        echo.disconnect();
      }
    };
  }, [authUser?.id, isAdmin, refreshNotifications]);

  useEffect(() => {
    if (!isAdmin) return;
    const initialLoad = window.setTimeout(() => {
      void refreshNotifications();
    }, 0);
    const interval = window.setInterval(() => {
      void refreshNotifications();
    }, 30_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [isAdmin, refreshNotifications]);

  useEffect(() => {
    if (!isAdmin) return;
    void dispatch(fetchContactInbox());
    const interval = window.setInterval(() => {
      void dispatch(fetchContactInbox());
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [dispatch, isAdmin]);

  async function openNotification(notification: AdminNotification) {
    if (!notification.read_at) {
      try {
        await notificationService.markRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        toast.error("Impossible de marquer la notification comme lue.");
      }
    }
    setNotificationsOpen(false);
    if (notification.data.url) {
      router.push(notification.data.url);
    } else if (notification.data.order_id) {
      router.push(
        `/dashboard/orders/${encodeURIComponent(notification.data.order_id)}`,
      );
    }
  }

  async function markAllAsRead() {
    try {
      await notificationService.markAllRead();
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
      );
      setUnreadCount(0);
      toast.success("Toutes les notifications sont marquées comme lues.");
    } catch {
      toast.error("Impossible de mettre les notifications à jour.");
    }
  }

  return (
    <header className="fixed left-[260px] right-0 top-0 z-40 h-25 border-b border-slate-100 bg-white">
      <div className="site-container flex h-full items-center justify-between text-[#173b3c]">
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-semibold leading-7">{pageTitle}</h1>
          {clockTimestamp !== null && (
            <time
              dateTime={new Date(clockTimestamp).toISOString()}
              title={`Heure locale · ${localTimezone}`}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-500"
            >
              <Clock3 aria-hidden="true" className="size-3.5" />
              {new Intl.DateTimeFormat("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
                timeZone: localTimezone,
              }).format(clockTimestamp)}
              <span aria-hidden="true">·</span>
              {new Intl.DateTimeFormat("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                timeZone: localTimezone,
              }).format(clockTimestamp)}
            </time>
          )}
        </div>
  
        <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-6">
          <label className="relative hidden w-[min(32vw,405px)] xl:block">
            <span className="sr-only">Rechercher</span>
            <input
              type="search"
              placeholder="Rechercher des données, clients ou commandes"
              className="h-12 w-full rounded-full border-0 bg-[#f7f8f9] pl-8 pr-12 text-[14px] text-[#344054] outline-none placeholder:text-[#686868] focus:ring-2 focus:ring-[#d8e5e2]"
            />
            <Search
              aria-hidden="true"
              className="absolute right-4.75 top-1/2 size-5.25 -translate-y-1/2 text-[#667085]"
              strokeWidth={2}
            />
          </label>
  
          <div className="relative">
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : ""}`}
              aria-expanded={notificationsOpen}
              onClick={() => {
                const opening = !notificationsOpen;
                setNotificationsOpen(opening);
                if (opening) void refreshNotifications();
              }}
              className="relative grid size-9 place-items-center rounded-full text-[#485467] transition hover:bg-slate-100"
            >
              <Bell className="size-5" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
  
            {notificationsOpen && (
              <section
                aria-label="Liste des notifications"
                className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="font-semibold">Notifications</h2>
                    <p className="text-xs text-slate-500">
                      {unreadCount} non lue{unreadCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => void markAllAsRead()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-800 hover:underline"
                    >
                      <CheckCheck className="size-4" /> Tout lire
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700">Notifications sur cet appareil</p>
                    <p className="text-[11px] text-slate-500">Même lorsque le site est fermé</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePushNotifications()}
                    disabled={!pushSupported || pushBusy}
                    aria-pressed={pushEnabled}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${pushEnabled ? "bg-emerald-50 text-emerald-800" : "bg-teal-700 text-white hover:bg-teal-800"}`}
                  >
                    <BellRing className="size-3.5" />
                    {!pushSupported ? "Non disponible" : pushBusy ? "Activation…" : pushEnabled ? "Activées" : "Activer"}
                  </button>
                </div>
                {notificationsLoading && notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">
                    Chargement des notifications…
                  </p>
                ) : notificationsError ? (
                  <p role="alert" className="p-5 text-sm text-rose-700">
                    {notificationsError}
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">
                    Aucune notification pour le moment.
                  </p>
                ) : (
                  <ul className="max-h-[min(65vh,28rem)] overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => void openNotification(notification)}
                          className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${notification.read_at ? "bg-white" : "bg-teal-50/60"}`}
                        >
                          <span className="flex items-start gap-2">
                            {!notification.read_at && (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-700" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">
                                {notification.data.message ?? "Nouvelle notification"}
                              </span>
                              {notification.data.customer_name && (
                                <span className="mt-1 block text-xs text-slate-600">
                                  {notification.data.customer_name}
                                  {notification.data.total != null
                                    ? ` · ${new Intl.NumberFormat("fr-FR").format(Number(notification.data.total))} FCFA`
                                    : ""}
                                </span>
                              )}
                              <time
                                dateTime={notification.created_at}
                                className="mt-1 block text-[11px] text-slate-400"
                              >
                                {notificationDate.format(new Date(notification.created_at))}
                              </time>
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
  
          <Link
            href="/dashboard/contact-messages"
            aria-label={`Messages de contact, ${totalMessages} reçu${totalMessages > 1 ? "s" : ""}${unreadMessages ? `, ${unreadMessages} non lu${unreadMessages > 1 ? "s" : ""}` : ""}`}
            title={`${totalMessages} message${totalMessages > 1 ? "s" : ""} reçu${totalMessages > 1 ? "s" : ""}${unreadMessages ? ` · ${unreadMessages} non lu${unreadMessages > 1 ? "s" : ""}` : ""}`}
            className="relative grid size-9 place-items-center rounded-full text-[#485467] transition hover:bg-slate-100"
          >
            <Mail className="size-5" strokeWidth={1.8} />
            {totalMessages > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">
                {totalMessages > 99 ? "99+" : totalMessages}
              </span>
            )}
          </Link>
  
          <button
            type="button"
            role="switch"
            aria-checked={lightMode}
            aria-label="Basculer le thème"
            onClick={() => setLightMode((value) => !value)}
            className={`relative h-8 w-14.5 rounded-full transition-colors ${
              lightMode ? "bg-[#eaf6e9]" : "bg-[#dce2e7]"
            }`}
          >
            <span className="absolute left-1 top-0.75 grid size-6.5 place-items-center rounded-full bg-white text-[#283b35] shadow-[0_1px_4px_rgba(16,24,40,0.18)]">
              <Sun className="size-3.75" strokeWidth={1.8} />
            </span>
          </button>
  
          <Link
            href="/dashboard/profile"
            aria-label={avatarAlt}
            title="Mon profil"
            className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#d8e0e4] text-[13px] font-semibold text-[#344054] ring-1 ring-[#e4e7ec]"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={avatarAlt} className="size-full object-cover" />
            ) : (
              <span aria-hidden="true">D</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
