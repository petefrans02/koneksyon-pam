// Service Worker KONEKSYON PAM — notifications push.
// Volontairement minimal : pas de cache offline, uniquement la réception des
// notifications (le cache d'une app Next.js demande une stratégie à part).

self.addEventListener("install", () => {
  // Le nouveau worker prend la main sans attendre la fermeture des onglets.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "KONEKSYON PAM", body: event.data.text() }; }

  const title = data.title || "KONEKSYON PAM";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",
    vibrate: [100, 50, 100],
    // `tag` évite d'empiler dix fois la même annonce sur le téléphone.
    tag: data.tag || "kp-notification",
    renotify: true,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  // Si un onglet du site est déjà ouvert, on le réutilise au lieu d'en ouvrir un autre.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
