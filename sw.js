/* House HQ — keeps the app opening with no signal. */
const CACHE='househq-v1';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    // the app itself: fresh copy when online, cached copy when not
    e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r; })
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else if(/^(www\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)){
    // Firebase and fonts: cached after the first visit
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(r2=>{ const cp=r2.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r2; })));
  }
});
