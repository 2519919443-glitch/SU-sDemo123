// K12学习助手 Service Worker
// 支持离线访问和PWA安装

var CACHE_NAME = 'k12-cache-v1';
var CACHE_URLS = [
  '/',
  '/index.html',
  '/src/style.css',
  '/src/data.js',
  '/src/core.js',
  '/src/core-api.js',
  '/src/pages/login.js',
  '/src/pages/onboard.js',
  '/src/pages/home.js',
  '/src/pages/knowledge.js',
  '/src/pages/quiz.js',
  '/src/pages/tools.js',
  '/src/pages/analysis.js',
  '/src/pages/profile.js',
  '/src/pages/teacher.js',
  '/src/pages/teacher-student.js',
  '/src/pages/teacher-chapter.js',
  '/src/pages/teacher-task.js',
  '/src/pages/admin.js',
  '/src/pages/admin-students.js',
  '/src/pages/admin-teachers.js',
  '/src/pages/admin-quiz.js',
  '/manifest.json'
];

// 安装：缓存核心资源
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS).catch(function(e) {
        console.log('[SW] 部分资源缓存失败，继续安装');
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：网络优先，缓存降级
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // API请求：不走缓存
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 静态资源：网络优先，缓存降级
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;
          // 如果是页面请求且缓存中没有，返回首页
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('离线模式', { status: 503 });
        });
      })
  );
});
