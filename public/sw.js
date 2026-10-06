self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  // Pass through fetch for dynamic Next.js routes
});
