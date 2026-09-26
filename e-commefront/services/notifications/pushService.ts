import { api } from "@/config/config";

type VapidKeyResponse = { public_key: string };
type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function decodeVapidKey(value: string): Uint8Array<ArrayBuffer> {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const decoded = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

function serializeSubscription(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Le navigateur n’a pas fourni les clés de notification.");
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

export const pushService = {
  supported(): boolean {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  },

  async currentSubscription(): Promise<PushSubscription | null> {
    if (!this.supported()) return null;
    const registration = await navigator.serviceWorker.getRegistration("/");
    return registration?.pushManager.getSubscription() ?? null;
  },

  async subscribe(): Promise<void> {
    const { data } = await api.get<VapidKeyResponse>("/notifications/push/vapid-public-key");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Autorisez les notifications dans votre navigateur pour les recevoir.");

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription() ??
      await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(data.public_key) });
    await api.post("/notifications/push/subscriptions", serializeSubscription(subscription));
  },

  async unsubscribe(): Promise<void> {
    const subscription = await this.currentSubscription();
    if (!subscription) return;
    await api.delete("/notifications/push/subscriptions", { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
  },
};
