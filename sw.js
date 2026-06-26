/* ═══ Service Worker — PWA 离线缓存 ═══════════════════════════════ */
const CACHE_NAME = 'yaq-ai-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon.svg',
  './robots.txt',
  './404.html',
  './ai-vs-traditional-comparison.html',
  './special-inspection-prototype.html',
  './css/style.css',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/blocks.css',
  './css/detail.css',
  './css/modal.css',
  './css/work-items.css',
  './css/assistant.css',
  './css/mobile.css',
  './css/utilities.css',
  './css/agent-init.css',
  './css/inspection.css',
  './js/app.js',
  './js/track-store.js',
  './js/rules.js',
  './js/agent-init.js'
];

/* ─── 安装：预缓存静态资源 ────────────────────────────────────── */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ─── 激活：清理旧缓存 ────────────────────────────────────────── */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

/* ─── 请求拦截：Cache-First 策略 ──────────────────────────────── */
self.addEventListener('fetch', function (e) {
  /* 只缓存同源 GET 请求 */
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;

      return fetch(e.request).then(function (response) {
        /* 只缓存成功的响应 */
        if (!response || response.status !== 200) return response;

        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function () {
        /* 离线回退：返回 index.html（SPA 路由） */
        if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
