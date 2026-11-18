const CACHE_NAME = "miritmo-shell-v45";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=45",
  "./styles-base.css?v=45",
  "./styles-components.css?v=45",
  "./styles-features.css?v=45",
  "./app-state.js?v=45",
  "./app-data.js?v=45",
  "./app-storage.js?v=45",
  "./app-diary-storage.js?v=45",
  "./app-diary-forms.js?v=45",
  "./app-diary-actions.js?v=45",
  "./app-render-core.js?v=45",
  "./app-render-finance.js?v=45",
  "./app-render-diary.js?v=45",
  "./app-render-focus.js?v=45",
  "./app-navigation.js?v=45",
  "./app-reminders.js?v=45",
  "./app-timer.js?v=45",
  "./app-forms.js?v=45",
  "./app-mutations.js?v=45",
  "./app-actions.js?v=45",
  "./app-events.js?v=45",
  "./app.js?v=45",
  "./auth-profile.js?v=45",
  "./auth-state.js?v=45",
  "./auth-cloud.js?v=45",
  "./auth-session.js?v=45",
  "./auth-submit.js?v=45",
  "./auth-account.js?v=45",
  "./auth-events.js?v=45",
  "./auth-form-events.js?v=45",
  "./auth.js?v=45",
  "./auth-config.js?v=45",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    await Promise.all(APP_SHELL.map(async (path) => {
      const url = new URL(path, self.registration.scope);
      const freshUrl = new URL(url);
      freshUrl.searchParams.set("__miritmo_cache", CACHE_NAME);
      const response = await fetch(freshUrl, { cache: "reload" });
      if (!response.ok) throw new Error(`No se pudo guardar ${path} para uso sin conexión.`);
      await cache.put(url, response);
    }));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});