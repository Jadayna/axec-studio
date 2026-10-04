// White Murmure — Service Worker (V1).
// Stratégie : cache-first. Le shell + les 10 sons gratuits sont pré-cachés à
// l'installation (~10 Mo, offline immédiat). Les 36 sons des packs sont mis en
// cache au fil de l'eau, au premier usage (évite ~60 Mo à l'installation).

// NOTE : ces listes dupliquent `src/sounds.js` (champ `file`).
// tools/check_sync.mjs vérifie que les deux restent synchronisées.
const FREE_SOUNDS = [
  'sounds/pluie-douce.mp3',
  'sounds/tonnerre-lointain.mp3',
  'sounds/vagues.mp3',
  'sounds/vent.mp3',
  'sounds/feu-foyer.mp3',
  'sounds/cafe-anime.mp3',
  'sounds/oiseaux.mp3',
  'sounds/grillons.mp3',
  'sounds/bruit-blanc.mp3',
  'sounds/ventilateur.mp3',
];
const PACK_SOUNDS = [
  'sounds/pluie-battante.mp3',
  'sounds/tonnerre-proche.mp3',
  'sounds/pluie-sur-vitre.mp3',
  'sounds/vent-tempete.mp3',
  'sounds/grele.mp3',
  'sounds/ruisseau-en-crue.mp3',
  'sounds/huard.mp3',
  'sounds/vent-pins.mp3',
  'sounds/ruisseau-forestier.mp3',
  'sounds/branches.mp3',
  'sounds/pluie-en-foret.mp3',
  'sounds/mesanges.wav',
  'sounds/fontaine-bambou.mp3',
  'sounds/carillon-vent.mp3',
  'sounds/ruisseau-zen.mp3',
  'sounds/cigales.mp3',
  'sounds/vent-bambous.mp3',
  'sounds/bol-chantant.mp3',
  'sounds/vagues-rochers.mp3',
  'sounds/vent-cotier.mp3',
  'sounds/mouettes.mp3',
  'sounds/corne-brume.mp3',
  'sounds/galets.mp3',
  'sounds/pluie-fine.mp3',
  'sounds/feu-de-camp.mp3',
  'sounds/hibou.mp3',
  'sounds/pluie-sur-tente.mp3',
  'sounds/vent-feuilles.mp3',
  'sounds/bois-craque.mp3',
  'sounds/loup.mp3',
  'sounds/averse-tropicale.mp3',
  'sounds/grenouilles.mp3',
  'sounds/oiseaux-tropicaux.mp3',
  'sounds/ruisseau-jungle.mp3',
  'sounds/vent-palmiers.mp3',
  'sounds/cascade.mp3',
];

const CACHE = 'white-murmure-v3';
// Chemins relatifs au SW : OK à '/' comme en sous-chemin (ex. /whitemurmure/app/).
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Tolérant : ignore les 404 (ex. sons pas encore intégrés).
    await Promise.allSettled(
      [...CORE, ...FREE_SOUNDS].map((u) => cache.add(u).catch(() => {})),
    );
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      if (res.ok && new URL(e.request.url).origin === self.location.origin) {
        cache.put(e.request, res.clone());
      }
      return res;
    } catch {
      return hit || Response.error();
    }
  })());
});
