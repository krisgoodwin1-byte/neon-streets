/**
 * Neon Streets — Force Strip (2.5D)
 * Original Dubzilla / Neon Streets IP. PS1-era polygonal side-scroll brawler.
 * Three.js · side-locked camera · low-poly fighters · 12 stages
 */
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WORLD = 90;           // world length along +X
const EXIT_X = WORLD - 3;
const END_ZONE = WORLD * 0.82;
const LANE_Z_MIN = -2.2;
const LANE_Z_MAX = 2.2;
const GRAVITY = 28;
const INTERNAL_W = 480;
const INTERNAL_H = 270;

const STAGES = [
  { name:"ALLEY", sky:0x1a1038, fog:0x2a1450, road:0x2a2430, curb:0x3e3648, strip:0xd8c44a, build:[0x1a1430,0x12182a], neon:[0xff2d6a,0x7af0ff,0xffd76a,0xb46cff],
    bossId:"dumpster", bossName:"DUMPSTER KING", bossMech:"TRASH TOSS", bossCol:0x6a8a3a, bossHp:160 },
  { name:"TWITCHCON", sky:0x0a1a2a, fog:0x142848, road:0x1a2430, curb:0x2a3850, strip:0x9146ff, build:[0x101828,0x182038], neon:[0x9146ff,0x00fc87,0xffffff,0xefeff1],
    bossId:"booth", bossName:"BOOTH TITAN", bossMech:"DONATION LASER", bossCol:0x9146ff, bossHp:170 },
  { name:"LALO", sky:0x2a1010, fog:0x4a1820, road:0x2a2020, curb:0x3e3030, strip:0xff8a5b, build:[0x281418,0x1c1014], neon:[0xff4d4d,0xffd76a,0xff8a5b,0xfff0c8],
    bossId:"rival", bossName:"STREAM RIVAL", bossMech:"PHONE-CAM STUN", bossCol:0xff4d4d, bossHp:155 },
  { name:"SIX ARAKIAN", sky:0x101018, fog:0x1a1830, road:0x221e30, curb:0x342c48, strip:0xb46cff, build:[0x16122a,0x12102a], neon:[0xb46cff,0x7af0ff,0xff2d6a,0xe0d0ff],
    bossId:"arakian", bossName:"SIX ARAKIAN", bossMech:"MULTI-ARM / SAND", bossCol:0xb46cff, bossHp:190 },
  { name:"MAIN MAN SWEE", sky:0x102018, fog:0x183828, road:0x1e2a22, curb:0x2e3e34, strip:0x39ff14, build:[0x102018,0x142820], neon:[0x39ff14,0x7af0ff,0xffd76a,0xc8ff80],
    bossId:"golem", bossName:"GUIDE GOLEM", bossMech:"LECTURE STUN", bossCol:0x39ff14, bossHp:180 },
  { name:"PHIDX", sky:0x181028, fog:0x2a1850, road:0x261e32, curb:0x3a3048, strip:0xff66cc, build:[0x1a1230,0x221840], neon:[0xff66cc,0x66ffee,0xffe066,0xcc99ff],
    bossId:"wraith", bossName:"LAB WRAITH", bossMech:"TOXICITY / TP", bossCol:0x66ffee, bossHp:165 },
  { name:"LIL MAJIN", sky:0x201010, fog:0x401820, road:0x2a1c1c, curb:0x3e2a2a, strip:0xff2244, build:[0x221010,0x2a1414], neon:[0xff2244,0xffaa00,0xffffff,0xff6688],
    bossId:"imp", bossName:"INFERNO IMP", bossMech:"FIRE TRAIL", bossCol:0xff4422, bossHp:170 },
  { name:"FIGHTINGGM", sky:0x101820, fog:0x183040, road:0x1c2830, curb:0x2c3c48, strip:0x00d4ff, build:[0x101820,0x142028], neon:[0x00d4ff,0xffcc00,0xffffff,0x88e0ff],
    bossId:"champ", bossName:"ARENA CHAMP", bossMech:"COUNTER / HAYMAKER", bossCol:0x00d4ff, bossHp:185 },
  { name:"JOKA", sky:0x141018, fog:0x281830, road:0x241e28, curb:0x383042, strip:0xff9900, build:[0x1a121c,0x221828], neon:[0xff9900,0xffee55,0xff55aa,0xffffff],
    bossId:"jester", bossName:"CARNIVAL JESTER", bossMech:"BOUNCE BOMBS", bossCol:0xff9900, bossHp:160 },
  { name:"KINGREYJR", sky:0x181408, fog:0x302410, road:0x2a2418, curb:0x3e3628, strip:0xffd700, build:[0x1c1810,0x241e14], neon:[0xffd700,0xfff3a0,0xc9a227,0xffe680],
    bossId:"crown", bossName:"CROWN BRUISER", bossMech:"GOLD SHIELD", bossCol:0xffd700, bossHp:195 },
  { name:"RIDDLESMK", sky:0x0c1810, fog:0x143020, road:0x1a2a20, curb:0x2a3e32, strip:0x00ff9c, build:[0x0e1a14,0x14241c], neon:[0x00ff9c,0xa0ffcf,0x204020,0x80ffc0],
    bossId:"serpent", bossName:"PUZZLE SERPENT", bossMech:"MIST / COIL", bossCol:0x00ff9c, bossHp:175 },
  { name:"NEON FINALE", sky:0x200830, fog:0x3a1058, road:0x2a1838, curb:0x3e2850, strip:0xff2d6a, build:[0x1a0c28,0x220e34], neon:[0xff2d6a,0x7af0ff,0xffd76a,0xb46cff],
    bossId:"nyx", bossName:"NYX COIL", bossMech:"CRYSTAL SHIELD", bossCol:0x6b2cff, bossHp:220 }
];
function stageFor(s) { return STAGES[(Math.max(1, s) - 1) % STAGES.length]; }

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------
const view = document.getElementById("view");
const hpEl = document.getElementById("hp");
const cdsEl = document.getElementById("cds");
const scoreEl = document.getElementById("score");
const stageNameEl = document.getElementById("stageName");
const progressHintEl = document.getElementById("progressHint");
const bannerEl = document.getElementById("banner");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");
const bossBarWrap = document.getElementById("bossBarWrap");
const bossHpEl = document.getElementById("bossHp");
const bossLabel = document.getElementById("bossLabel");

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const keys = {};
const hold = { left:false, right:false, up:false, down:false, jump:false, claw:false, spin:false, breath:false, grab:false };
addEventListener("keydown", e => {
  keys[e.code] = true;
  if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "KeyM") toggleMute();
});
addEventListener("keyup", e => { keys[e.code] = false; });
function bindPad(el) {
  const act = el.dataset.act;
  const down = ev => { ev.preventDefault(); hold[act] = true; };
  const up = ev => { ev.preventDefault(); hold[act] = false; };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointerleave", up);
  el.addEventListener("pointercancel", up);
}
document.querySelectorAll(".pad").forEach(bindPad);

function pressed(act) {
  const map = {
    left: keys.ArrowLeft || keys.KeyA || hold.left,
    right: keys.ArrowRight || keys.KeyD || hold.right,
    up: keys.ArrowUp || keys.KeyW || hold.up,
    down: keys.ArrowDown || keys.KeyS || hold.down,
    jump: keys.Space || keys.KeyK || hold.jump,
    claw: keys.KeyJ || keys.KeyZ || hold.claw,
    spin: keys.KeyL || keys.KeyX || hold.spin,
    breath: keys.KeyI || keys.KeyC || hold.breath,
    grab: keys.KeyG || keys.KeyV || hold.grab
  };
  return !!map[act];
}

// ---------------------------------------------------------------------------
// Audio (lightweight)
// ---------------------------------------------------------------------------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx, master, musicOn = true;
function bootAudio() {
  if (actx) return;
  actx = new AudioCtx();
  master = actx.createGain();
  master.gain.value = 0.18;
  master.connect(actx.destination);
}
function tone(type, freq, dur, peak = 0.2) {
  if (!actx || !musicOn) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  const t = actx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}
function sfxHit() { tone("square", 180, 0.08, 0.15); tone("sawtooth", 90, 0.1, 0.1); }
function sfxClaw() { tone("square", 320, 0.06, 0.12); }
function sfxSpin() { tone("sawtooth", 140, 0.25, 0.14); }
function sfxRoar() { tone("sawtooth", 70, 0.35, 0.18); tone("square", 110, 0.3, 0.1); }
function sfxJump() { tone("triangle", 260, 0.12, 0.1); }
function sfxPickup() { tone("triangle", 520, 0.1, 0.12); tone("triangle", 780, 0.12, 0.08); }
function sfxBoss() { tone("sawtooth", 55, 0.5, 0.2); }
function sfxClear() { tone("triangle", 440, 0.15, 0.12); tone("triangle", 660, 0.2, 0.1); }
function sfxBlackout() { tone("sawtooth", 40, 0.5, 0.15); }
function toggleMute() { musicOn = !musicOn; if (master) master.gain.value = musicOn ? 0.18 : 0; }

// ---------------------------------------------------------------------------
// Three.js renderer (low-res → nearest upscale)
// ---------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(INTERNAL_W, INTERNAL_H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
renderer.domElement.style.imageRendering = "pixelated";
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a1038, 18, 55);

const camera = new THREE.PerspectiveCamera(42, INTERNAL_W / INTERNAL_H, 0.1, 120);
camera.position.set(0, 4.2, 11.5);
camera.lookAt(0, 1.6, 0);

const hemi = new THREE.HemisphereLight(0xb0a0ff, 0x221018, 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8c8, 0.7);
sun.position.set(-4, 10, 6);
scene.add(sun);
const neonFill = new THREE.PointLight(0xff2d6a, 1.2, 30);
neonFill.position.set(0, 3, 2);
scene.add(neonFill);
const neonFill2 = new THREE.PointLight(0x7af0ff, 0.9, 28);
neonFill2.position.set(4, 2.5, -1);
scene.add(neonFill2);

// ---------------------------------------------------------------------------
// Materials helpers
// ---------------------------------------------------------------------------
function mat(color, flat = true) {
  return new THREE.MeshLambertMaterial({ color, flatShading: flat });
}
function box(w, h, d, color, ox = 0, oy = 0, oz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(ox, oy, oz);
  return m;
}
function cyl(rTop, rBot, h, color, ox = 0, oy = 0, oz = 0, segs = 6) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat(color));
  m.position.set(ox, oy, oz);
  return m;
}

// ---------------------------------------------------------------------------
// Character builders — Force / T3 polygon density
// ---------------------------------------------------------------------------
function makeDubzillaMesh() {
  const root = new THREE.Group();
  root.name = "dubzilla";

  // Legs / purple pants
  const pantL = box(0.38, 0.72, 0.36, 0x3a1450, -0.22, 0.36, 0);
  const pantR = box(0.38, 0.72, 0.36, 0x3a1450, 0.22, 0.36, 0);
  root.add(pantL, pantR);
  // Feet
  root.add(box(0.42, 0.16, 0.55, 0x6ecf32, -0.22, 0.08, 0.08));
  root.add(box(0.42, 0.16, 0.55, 0x6ecf32, 0.22, 0.08, 0.08));
  // Claws on feet
  root.add(box(0.1, 0.08, 0.22, 0x111111, -0.32, 0.06, 0.28));
  root.add(box(0.1, 0.08, 0.22, 0x111111, -0.12, 0.06, 0.28));
  root.add(box(0.1, 0.08, 0.22, 0x111111, 0.12, 0.06, 0.28));
  root.add(box(0.1, 0.08, 0.22, 0x111111, 0.32, 0.06, 0.28));

  // Torso lime
  const torso = box(0.85, 0.85, 0.55, 0x6ecf32, 0, 1.15, 0);
  root.add(torso);
  // Yellow belly
  root.add(box(0.55, 0.55, 0.12, 0xc8e860, 0, 1.05, 0.28));

  // Yellow hoodie (open vest style)
  const hoodie = box(0.95, 0.7, 0.62, 0xffd700, 0, 1.28, -0.02);
  root.add(hoodie);
  // Hoodie sleeves short
  root.add(box(0.28, 0.22, 0.35, 0xffd700, -0.55, 1.42, 0));
  root.add(box(0.28, 0.22, 0.35, 0xffd700, 0.55, 1.42, 0));
  // DUBZ patch (left chest)
  root.add(box(0.28, 0.16, 0.04, 0x6ecf32, -0.28, 1.38, 0.32));
  root.add(box(0.22, 0.1, 0.03, 0xb46cff, -0.28, 1.38, 0.34));

  // Red sash
  root.add(box(1.02, 0.22, 0.68, 0xff2d4a, 0, 0.78, 0));
  root.add(box(0.28, 0.42, 0.14, 0xff2d4a, 0.38, 0.65, 0.32)); // hanging end
  root.add(box(0.2, 0.2, 0.14, 0xff2d4a, -0.4, 0.78, 0.34));

  // Black strap
  root.add(box(0.08, 0.9, 0.04, 0x1a1a1a, -0.15, 1.2, 0.3));

  // Arms lime
  const armL = new THREE.Group();
  armL.position.set(-0.58, 1.35, 0);
  armL.add(box(0.28, 0.55, 0.28, 0x6ecf32, 0, -0.25, 0));
  armL.add(box(0.32, 0.22, 0.32, 0x6ecf32, 0, -0.55, 0.05)); // hand
  armL.add(box(0.08, 0.08, 0.18, 0x111111, -0.08, -0.62, 0.18));
  armL.add(box(0.08, 0.08, 0.18, 0x111111, 0.08, -0.62, 0.18));
  root.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.58, 1.35, 0);
  armR.add(box(0.28, 0.55, 0.28, 0x6ecf32, 0, -0.25, 0));
  armR.add(box(0.32, 0.22, 0.32, 0x6ecf32, 0, -0.55, 0.05));
  // Spray can
  const can = new THREE.Group();
  can.position.set(0.05, -0.7, 0.15);
  can.add(cyl(0.08, 0.08, 0.28, 0xb46cff, 0, 0, 0, 6));
  can.add(box(0.1, 0.06, 0.1, 0xffd700, 0, 0.16, 0));
  can.add(box(0.1, 0.1, 0.02, 0x6ecf32, 0, 0.02, 0.09));
  armR.add(can);
  root.add(armR);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 1.85, 0.05);
  head.add(box(0.72, 0.62, 0.65, 0x6ecf32, 0, 0.15, 0));
  // Snout
  head.add(box(0.48, 0.28, 0.35, 0x6ecf32, 0, -0.05, 0.32));
  // Teeth
  head.add(box(0.08, 0.1, 0.06, 0xf4e8c8, -0.12, -0.12, 0.48));
  head.add(box(0.08, 0.1, 0.06, 0xf4e8c8, 0.12, -0.12, 0.48));
  // Purple eyes
  head.add(box(0.18, 0.16, 0.07, 0xb46cff, -0.18, 0.22, 0.33));
  head.add(box(0.18, 0.16, 0.07, 0xb46cff, 0.18, 0.22, 0.33));
  head.add(box(0.06, 0.06, 0.04, 0x1a0a20, -0.18, 0.22, 0.35));
  head.add(box(0.06, 0.06, 0.04, 0x1a0a20, 0.18, 0.22, 0.35));
  // Jaw line
  head.add(box(0.4, 0.08, 0.08, 0x4a9a20, 0, -0.18, 0.4));
  root.add(head);

  // Dorsal plates (yellow tips)
  const plates = [
    [-0.05, 2.35, -0.15, 0.18, 0.35, 0.1],
    [0.05, 2.15, -0.22, 0.2, 0.42, 0.12],
    [0, 1.9, -0.28, 0.22, 0.38, 0.12],
    [0, 1.55, -0.3, 0.2, 0.32, 0.1],
    [0, 1.25, -0.28, 0.16, 0.26, 0.08]
  ];
  for (const [x,y,z,w,h,d] of plates) {
    root.add(box(w, h, d, 0x6ecf32, x, y, z));
    root.add(box(w * 0.7, h * 0.35, d * 0.7, 0xffd700, x, y + h * 0.35, z - 0.02));
  }

  // Headphones around neck
  const hpBand = box(0.85, 0.08, 0.08, 0x1a1a1a, 0, 1.62, 0);
  root.add(hpBand);
  const cupL = box(0.22, 0.28, 0.18, 0x1a1a1a, -0.48, 1.55, 0.05);
  const cupR = box(0.22, 0.28, 0.18, 0x1a1a1a, 0.48, 1.55, 0.05);
  root.add(cupL, cupR);
  root.add(box(0.24, 0.3, 0.04, 0xff2d8a, -0.48, 1.55, 0.14));
  root.add(box(0.24, 0.3, 0.04, 0xff2d8a, 0.48, 1.55, 0.14));
  root.add(box(0.1, 0.1, 0.03, 0x6ecf32, -0.48, 1.55, 0.16));
  root.add(box(0.1, 0.1, 0.03, 0x6ecf32, 0.48, 1.55, 0.16));

  root.userData.armL = armL;
  root.userData.armR = armR;
  root.userData.head = head;
  root.userData.can = can;
  return root;
}

function makePunkMesh(col = 0xe24b7a) {
  const root = new THREE.Group();
  root.add(box(0.32, 0.55, 0.28, 0x2a2030, -0.12, 0.28, 0));
  root.add(box(0.32, 0.55, 0.28, 0x2a2030, 0.12, 0.28, 0));
  root.add(box(0.55, 0.55, 0.35, col, 0, 0.85, 0));
  root.add(box(0.22, 0.45, 0.22, col, -0.38, 0.85, 0));
  root.add(box(0.22, 0.45, 0.22, col, 0.38, 0.85, 0));
  root.add(box(0.4, 0.4, 0.4, 0xf0c8a0, 0, 1.3, 0));
  // mohawk
  root.add(box(0.1, 0.28, 0.35, 0x7af0ff, 0, 1.55, 0));
  root.add(box(0.12, 0.1, 0.06, 0x111111, -0.1, 1.35, 0.2));
  root.add(box(0.12, 0.1, 0.06, 0x111111, 0.1, 1.35, 0.2));
  return root;
}

function makeBruteMesh(col = 0xc45b2a) {
  const root = new THREE.Group();
  root.add(box(0.42, 0.7, 0.38, 0x2a2030, -0.18, 0.35, 0));
  root.add(box(0.42, 0.7, 0.38, 0x2a2030, 0.18, 0.35, 0));
  root.add(box(0.85, 0.75, 0.5, col, 0, 1.05, 0));
  root.add(box(0.35, 0.6, 0.35, col, -0.55, 1.0, 0));
  root.add(box(0.35, 0.6, 0.35, col, 0.55, 1.0, 0));
  root.add(box(0.55, 0.5, 0.5, 0xd0a080, 0, 1.6, 0));
  root.add(box(0.5, 0.12, 0.52, 0x1a1a1a, 0, 1.82, 0)); // beanie
  return root;
}

function makeBossMesh(id, col) {
  const root = new THREE.Group();
  // Base large body
  root.add(box(0.5, 0.8, 0.45, 0x1a0a30, -0.22, 0.4, 0));
  root.add(box(0.5, 0.8, 0.45, 0x1a0a30, 0.22, 0.4, 0));
  root.add(box(1.1, 1.0, 0.7, col, 0, 1.3, 0));
  root.add(box(0.4, 0.7, 0.4, col, -0.7, 1.25, 0));
  root.add(box(0.4, 0.7, 0.4, col, 0.7, 1.25, 0));
  root.add(box(0.7, 0.65, 0.65, 0xe8d0b0, 0, 2.05, 0));

  if (id === "dumpster") {
    root.add(box(1.3, 0.9, 0.85, 0x4a6a28, 0, 1.2, 0));
    root.add(box(1.35, 0.15, 0.9, 0x6a8a3a, 0, 1.7, 0));
  } else if (id === "booth") {
    root.add(box(1.4, 1.2, 0.4, 0x9146ff, 0, 1.4, -0.4));
    root.add(box(0.5, 0.3, 0.1, 0xffffff, 0, 1.6, -0.55));
  } else if (id === "rival") {
    root.add(box(0.25, 0.4, 0.08, 0x222222, 0.55, 1.7, 0.4)); // phone
    root.add(box(0.18, 0.3, 0.02, 0x7af0ff, 0.55, 1.7, 0.45));
  } else if (id === "arakian") {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      root.add(box(0.2, 0.9, 0.2, col, Math.cos(a) * 0.9, 1.2, Math.sin(a) * 0.5));
    }
  } else if (id === "golem") {
    root.add(box(1.2, 1.3, 0.8, 0x2a5a20, 0, 1.3, 0));
    root.add(box(0.3, 0.15, 0.1, 0x39ff14, -0.2, 2.1, 0.35));
    root.add(box(0.3, 0.15, 0.1, 0x39ff14, 0.2, 2.1, 0.35));
  } else if (id === "wraith") {
    root.children.forEach(c => { if (c.material) c.material = mat(0x66ffee); c.material.transparent = true; c.material.opacity = 0.75; });
  } else if (id === "imp") {
    root.add(box(0.15, 0.35, 0.15, 0xff4422, -0.25, 2.4, -0.1));
    root.add(box(0.15, 0.35, 0.15, 0xff4422, 0.25, 2.4, -0.1));
  } else if (id === "champ") {
    root.add(box(0.9, 0.15, 0.7, 0xffcc00, 0, 1.85, 0)); // belt
    root.add(cyl(0.15, 0.15, 0.08, 0xffcc00, 0, 1.85, 0.36, 6));
  } else if (id === "jester") {
    root.add(box(0.2, 0.4, 0.2, 0xff9900, -0.35, 2.4, 0));
    root.add(box(0.2, 0.4, 0.2, 0xff55aa, 0.35, 2.4, 0));
    root.add(box(0.12, 0.12, 0.12, 0xffee55, -0.35, 2.6, 0));
    root.add(box(0.12, 0.12, 0.12, 0xffee55, 0.35, 2.6, 0));
  } else if (id === "crown") {
    root.add(box(0.5, 0.25, 0.5, 0xffd700, 0, 2.45, 0));
    root.add(box(0.12, 0.2, 0.12, 0xffd700, -0.2, 2.6, 0));
    root.add(box(0.12, 0.28, 0.12, 0xffd700, 0, 2.65, 0));
    root.add(box(0.12, 0.2, 0.12, 0xffd700, 0.2, 2.6, 0));
  } else if (id === "serpent") {
    root.add(cyl(0.35, 0.45, 1.6, 0x00ff9c, 0, 1.4, 0, 6));
    root.add(box(0.5, 0.35, 0.7, 0x00ff9c, 0, 2.3, 0.2));
  } else if (id === "nyx") {
    root.add(box(1.2, 1.4, 0.8, 0x6b2cff, 0, 1.4, 0));
    for (let i = 0; i < 5; i++) {
      root.add(box(0.15, 0.4, 0.15, 0xb46cff, (i - 2) * 0.25, 2.5, -0.2));
    }
  }
  // Eyes
  root.add(box(0.14, 0.12, 0.06, 0xff2d6a, -0.18, 2.15, 0.35));
  root.add(box(0.14, 0.12, 0.06, 0xff2d6a, 0.18, 2.15, 0.35));
  return root;
}

function makePropMesh(kind) {
  const g = new THREE.Group();
  if (kind === "barrel") {
    g.add(cyl(0.28, 0.3, 0.7, 0xc45b2a, 0, 0.35, 0, 8));
    g.add(cyl(0.3, 0.3, 0.08, 0x8a3a18, 0, 0.7, 0, 8));
  } else if (kind === "crate") {
    g.add(box(0.55, 0.55, 0.55, 0x8a6030, 0, 0.28, 0));
  } else {
    g.add(box(0.4, 0.5, 0.35, 0x4a6a28, 0, 0.25, 0)); // trash bag
  }
  return g;
}

function makeLootMesh() {
  const g = new THREE.Group();
  g.add(box(0.28, 0.18, 0.35, 0xffd76a, 0, 0.12, 0));
  g.add(box(0.1, 0.08, 0.08, 0xff2d6a, 0, 0.25, 0));
  return g;
}

function makeCrystalMesh() {
  const g = new THREE.Group();
  g.add(box(0.25, 0.7, 0.add("bad")?"":"", 0xb46cff, 0, 0.4, 0));
  g.add(box(0.15, 0.35, 0.15, 0x7af0ff, 0, 0.85, 000));
  return g;
}

// ---------------------------------------------------------------------------
// World / stage set dressing
// ----------------------------------------------------------------*/
let worldGroup = new THREE.Group();
scene.add(worldlet);