self.addEventListener('push', (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : '' };
  }

  const data = message.data || {};
  event.waitUntil(
    self.registration.showNotification(message.title || 'E-commerce', {
      body: message.body || 'Nouvelle notification',
      icon: message.icon || '/favicon.ico',
      badge: message.badge || '/favicon.ico',
      tag: message.tag,
      data: { ...data, url: data.url || (data.order_id ? `/dashboard/orders/${encodeURIComponent(data.order_id)}` : '/dashboard') },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = event.notification.data?.url || '/dashboard';
  const destination = new URL(path, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing) {
        existing.navigate(destination);
        return existing.focus();
      }
      return clients.openWindow(destination);
    }),
  );
});
