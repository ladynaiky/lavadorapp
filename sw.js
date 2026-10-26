// Service worker de Lavadorapp
// Guarda la app en el móvil para que funcione sin internet.
// ⚠️ Cada vez que cambies algún archivo, sube el número de VERSION
//    para que el móvil descargue la versión nueva.

const VERSION = "lavadorapp-v13";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png",
  "./icono-maskable-512.png",
];

// 1. Al instalar: guarda todos los archivos
self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// 2. Al activarse: borra las versiones antiguas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// 3. Cada vez que la app pide un archivo: primero intenta internet
//    (para tener siempre lo último) y, si no hay conexión, usa lo guardado.
self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;
  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(VERSION).then((cache) => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request).then((r) => r || caches.match("./index.html")))
  );
});
