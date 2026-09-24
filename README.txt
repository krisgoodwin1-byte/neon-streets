NEON STREETS — Force Strip (2.5D)
Original Dubzilla / Neon Streets IP. Low-poly Three.js brawler.

Run locally
1. Serve the folder over HTTP (required for ES modules / Three.js CDN):
     python3 -m http.server 8080
   or any static host.
2. Open http://localhost:8080/ in Chrome / Firefox.
3. Click START GAME.

Install as app (Android PWA)
1. Host the folder on https (GitHub Pages, Netlify Drop, etc.).
2. Chrome menu → Add to Home screen / Install app.
3. Launch "Dubzilla".

Controls
WASD / arrows / touch pads — move on the lane (X + depth Z)
JUMP  CLAW  SPIN  BREATH  GRAB/THROW (G)
M mutes SFX

Goal
Walk LEFT → RIGHT through 12 stages. Fight punks/brutes.
Beat the stage boss, then reach EXIT. Survive Neon Blackout.
Loot heals. Grab barrels/crates and throw them.

Tech
Three.js r160 (CDN importmap) · WebGL · 480×270 internal
nearest-upscale · PerspectiveCamera side-scroll follow
Low-poly Box/Cylinder meshes · MeshLambert flat shading

Files
index.html  — shell, HUD, pads, importmap
game.js     — renderer, meshes, stages, combat, AI
sw.js       — neon-streets-v7 cache
manifest.webmanifest + icons/
