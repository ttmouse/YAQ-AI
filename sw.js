/* ═══ Service Worker — PWA 离线缓存（Network-First 策略）═══════════ */
/* 管理后台数据动态变化，使用 Network-First 确保数据新鲜，
   离线时回退到缓存保障基本可用。 */
var CACHE_NAME = 'yaq-ai-v10';
var STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon.svg',
  './robots.txt',
  './404.html',
  './ai-vs-traditional-comparison.html',
  './special-inspection-prototype.html',
  './css/app.css',
  './css/mobile.css',
  './css/mobile-additions.css',
  './js/app.js',
  './js/track-store.js',
  './js/rules.js',
  './js/agent-init.js',
  './js/data/mock-data.js',
  './js/lucide.min.js',
  './js/components/bottom-input-bar.js',
  './js/components/card-primitives.js',
  './js/components/quick-chip.js',
  './pwa-icon-192.png',
  './pwa-icon-512.png'
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

/* ─── 消息：接收 skip-waiting 指令 ──────────────────────────────── */
self.addEventListener('message', function (e) {
  if (e.data === 'skip-waiting') {
    self.skipWaiting();
  }
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

/* ─── 请求拦截：Network-First 策略 ──────────────────────────────── */
/* - HTML 页面（含根路径）：Network-First，离线时回退缓存
   - 静态资源（CSS/JS/图片/字体）：Cache-First
   - 外部 CDN 请求：Network-Only（不缓存） */
self.addEventListener('fetch', function (e) {
  /* 只处理同源 GET 请求 */
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  var url = new URL(e.request.url);
  var ext = url.pathname.split('.').pop().toLowerCase();

  // ─── 外部 CDN：不缓存 ──────────────────────────────────────────
  if (url.hostname !== self.location.hostname) return;

  // ─── 静态资源（CSS/JS/图片/字体等）：Stale-While-Revalidate ────
  /* 先返回缓存（快速），同时后台更新缓存，下次访问即为最新版本 */
  var staticExts = ['css', 'js', 'png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'woff', 'woff2', 'ttf', 'ico'];
  if (staticExts.indexOf(ext) !== -1) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        // 立即返回缓存，同时发起网络请求更新缓存
        var fetchPromise = fetch(e.request).then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, clone);
            });
          }
          return response;
        }).catch(function () {
          return null;
        });
        // 有缓存则先返回，后台静默更新；无缓存则等网络
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ─── HTML 页面 & 根路径：Network-First ──────────────────────────
  e.respondWith(
    fetch(e.request).then(function (response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function () {
      // 离线 → 回退缓存
      return caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        // SPA 路由回退到 index.html
        if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
        return new Response(
          '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"><title>离线模式 — 小安工作台</title><style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#f8f9fc;color:#1e1e2e;text-align:center;padding:24px}@media(prefers-color-scheme:dark){body{background:#1a1a2e;color:#e8e8ee}}.offline-icon{width:72px;height:72px;border-radius:50%;background:#e8e8ee;display:flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:32px;color:#8e8ea0}@media(prefers-color-scheme:dark){.offline-icon{background:#2a2a3e;color:#6e6e80}}h1{font-size:20px;font-weight:650;margin:0 0 8px}.desc{font-size:14px;color:#8e8ea0;margin:0 0 8px;line-height:1.6;max-width:300px}.hint{font-size:12px;color:#b0b0b8;margin-bottom:28px}.retry-btn{padding:14px 36px;border:none;border-radius:12px;background:#6366f1;color:#fff;font-size:15px;font-weight:600;cursor:pointer;min-height:48px;transition:opacity .15s}.retry-btn:active{opacity:.8}.retry-btn:disabled{opacity:.5}.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}.status-dot.offline{background:#ef4444}.status-dot.checking{background:#f59e0b;animation:pulse 1s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}</style></head><body><div class="offline-icon">📡</div><h1>网络已断开</h1><p class="desc">已缓存的内容仍可正常查阅<br>新数据将在恢复连接后自动加载</p><p class="hint"><span class="status-dot offline"></span>当前处于离线模式</p><button class="retry-btn" onclick="this.disabled=true;this.textContent='正在重连…';this.querySelector('.status-dot')?.classList.replace('offline','checking');fetch(window.location.href,{method:'HEAD',cache:'no-cache'}).then(function(){location.reload()}).catch(function(){this.disabled=false;this.textContent='重新连接'}.bind(this))">重新连接</button></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
        );
      });
    })
  );
});
