/**
 * Neon Streets — Force Strip (2.5D)
 * Original Dubzilla / Neon Streets IP. Three.js low-poly side-scroll brawler.
 * FORCE STRIP rebuild v7.
 */
import * as THREE from "three";

const INTERNAL_W = 480;
const INTERNAL_H = 270;
const WORLD = 90;
const LANE_Z_MIN = -2.2;
const LANE_Z_MAX = 2.2;
const view = document.getElementById("view");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");
const hpEl = document.getElementById("hp");
const scoreEl = document.getElementById("score");
const stageNameEl = document.getElementById("stageName");
const bannerEl = document.getElementById("banner");
const cdsEl = document.getElementById("cds");

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(INTERNAL_W, INTERNAL_H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
view.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1038);
scene.fog = new THREE.Fog(0x2a1450, 16, 55);
const camera = new THREE.PerspectiveCamera(42, INTERNAL_W / INTERNAL_H, 0.1, 120);
camera.position.set(0, 4.2, 11.5);
const hemi = new THREE.HemisphereLight(0xb0a0ff, 0x221018, 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8c8, 0.7);
sun.position.set(-4, 10, 6);
scene.add(sun);
const neon = new THREE.PointLight(0xff2d6a, 1.4, 30);
scene.add(neon);

function mat(color) { return new THREE.MeshLambertMaterial({ color, flatShading: true }); }
function box(w, h, d, color, x=0, y=0, z=0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z); return m;
}
function makeDubzilla() {
  const root = new THREE.Group(); root.name = "dubzilla";
  root.add(box(.38,.72,.36,0x3a1450,-.22,.36));
  root.add(box(.38,.72,.36,0x3a1450,.22,.36));
  root.add(box(.42,.16,.55,0x6ecf32,-.22,.08,.08));
  root.add(box(.42,.16,.55,0x6ecf32,.22,.08,.08));
  root.add(box(.85,.85,.55,0x6ecf32,0,1.15));
  root.add(box(.95,.7,.62,0xffd700,0,1.28,-.02));
  root.add(box(1.02,.22,.68,0xff2d4a,0,.78));
  root.add(box(.72,.62,.65,0x6ecf32,0,2.0,.05));
  root.add(box(.48,.28,.35,0x6ecf32,0,1.85,.37));
  root.add(box(.18,.16,.07,0xb46cff,-.18,2.07,.40));
  root.add(box(.18,.16,.07,0xb46cff,.18,2.07,.40));
  root.add(box(.08,.1,.06,0xf4e8c8,-.12,1.73,.50));
  root.add(box(.08,.1,.06,0xf4e8c8,.12,1.73,.50));
  root.userData.armL = new THREE.Group(); root.userData.armR = new THREE.Group();
  root.add(root.userData.armL, root.userData.armR);
  return root;
}
function makeEnemy(color=0xe24b7a, boss=false) {
  const g = new THREE.Group();
  g.add(box(boss?1.1:.55,boss?1:.55,boss?.7:.35,color,0,boss?1.3:.85));
  g.add(box(boss?.7:.4,boss?.65:.4,boss?.65:.4,0xe8d0b0,0,boss?2.05:1.3));
  if (boss) g.add(box(1.2,1.4,.8,0x6b2cff,0,1.4));
  return g;
}
const world = new THREE.Group(); scene.add(world);
const floor = box(WORLD+20,.4,8,0x2a2430,WORLD/2,-.2); world.add(floor);
for (let x=0; x<WORLD; x+=3) world.add(box(1.4,.02,.18,0xd8c44a,x,.01));
for (let x=-2; x<WORLD+8; x+=4) {
  const h=4+Math.random()*7; world.add(box(2.5,h,1.8,0x16122a,x,h/2,-5.5));
}

const keys = {};
const held = {};
addEventListener("keydown", e => { keys[e.code]=true; if (e.code === "KeyM") toggleMute(); });
addEventListener("keyup", e => { keys[e.code]=false; });
document.querySelectorAll(".pad").forEach(b => {
  const a=b.dataset.act;
  b.addEventListener("pointerdown", e=>{e.preventDefault();held[a]=true;});
  ["pointerup","pointerleave","pointercancel"].forEach(t=>b.addEventListener(t,()=>held[a]=false));
});
const down = a => ({left:keys.ArrowLeft||keys.KeyA||held.left,right:keys.ArrowRight||keys.KeyD||held.right,up:keys.ArrowUp||keys.KeyW||held.up,down:keys.ArrowDown||keys.KeyS||held.down,claw:keys.KeyJ||keys.KeyZ||held.claw,spin:keys.KeyL||keys.KeyX||held.spin}[a]);
let audio, master, muted=false;
function bootAudio(){ if(audio)return; const C=window.AudioContext||window.webkitAudioContext; if(!C)return; audio=new C(); master=audio.createGain(); master.gain.value=.12; master.connect(audio.destination); }
function tone(f,d=.08){if(!audio||muted)return;const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;o.type="square";g.gain.value=.08;o.connect(g);g.connect(master);o.start();o.stop(audio.currentTime+d);}
function toggleMute(){muted=!muted;if(master)master.gain.value=muted?0:.12;}

let player, enemies=[], started=false, gameOver=false, score=0, stage=1, last=performance.now(), time=0;
function begin(){ bootAudio(); if(audio?.state === "suspended") audio.resume(); overlay.classList.add("hidden"); started=true; gameOver=false; score=0; stage=1; player={x:3,z:0,y:0,hp:120,vx:0,vz:0,mesh:makeDubzilla(),attack:0}; scene.add(player.mesh); enemies=[]; for(let i=0;i<5;i++) spawnEnemy(12+i*8, (i%3)-1); bannerEl.textContent="WALK RIGHT · CLEAR THE STRIP"; bannerEl.classList.add("show"); setTimeout(()=>bannerEl.classList.remove("show"),2200); }
function spawnEnemy(x,z,boss=false){const e={x,z,y:0,hp:boss?220:40,boss,mesh:makeEnemy(boss?0x6b2cff:0xe24b7a,boss),attack:0};e.mesh.position.set(x,0,z);scene.add(e.mesh);enemies.push(e);}
function attack(){ if(player.attack>0)return; player.attack=280; tone(320); for(const e of enemies){if(e.hp>0&&Math.abs(e.x-player.x)<2&&Math.abs(e.z-player.z)<1.2){e.hp-=22;score+=44;e.mesh.position.x+=player.x<e.x?.4:-.4;if(e.hp<=0){score+=e.boss?1000:150;scene.remove(e.mesh);}}} enemies=enemies.filter(e=>e.hp>0); }
function update(dt){
  if(!player)return;
  const mx=(down("right")?1:0)-(down("left")?1:0), mz=(down("down")?1:0)-(down("up")?1:0);
  player.vx=mx*5.5; player.vz=mz*5.5; player.x=Math.max(1,Math.min(WORLD-1,player.x+player.vx*dt/1000)); player.z=Math.max(LANE_Z_MIN,Math.min(LANE_Z_MAX,player.z+player.vz*dt/1000));
  if(down("claw")||down("spin"))attack(); else player.attack=Math.max(0,player.attack-dt);
  for(const e of enemies){const dx=player.x-e.x,dz=player.z-e.z,d=Math.hypot(dx,dz)||1;e.x+=dx/d*(e.boss?1.5:2.2)*dt/1000;e.z+=dz/d*(e.boss?1.5:2.2)*dt/1000;e.mesh.position.set(e.x,e.y,e.z);if(d<1.4)e.attack-=dt;if(d<1.4&&e.attack<=0){e.attack=900;player.hp=Math.max(0,player.hp-(e.boss?12:5));tone(100);}}
  if(player.x>68&&!enemies.some(e=>e.boss)){spawnEnemy(84,0,true);bannerEl.textContent="BOSS INCOMING";bannerEl.classList.add("show");setTimeout(()=>bannerEl.classList.remove("show"),1500);}
  if(player.x>87&&enemies.length===0){stage++;player.x=3;for(let i=0;i<5;i++)spawnEnemy(12+i*8,(i%3)-1);}
  if(player.hp<=0){gameOver=true;overlay.classList.remove("hidden");overlay.querySelector("h1").textContent="KO";overlay.querySelector("p").textContent="Score "+score+". Tap START to retry.";startBtn.textContent="RETRY";}
  player.mesh.position.set(player.x,player.y,player.z); player.mesh.rotation.y=mx<0?-Math.PI/2:Math.PI/2; camera.position.x+=(player.x+1.5-camera.position.x)*.12; camera.lookAt(player.x+1.2,1.5,0); neon.position.set(player.x,3,2);
  hpEl.style.width=(player.hp/120*100)+"%"; scoreEl.innerHTML=`SCORE ${String(score).padStart(6,"0")}<br>STAGE ${stage}/12<br><span id="stageName">${stage<12?"ALLEY":"NEON FINALE"}</span><br>${Math.floor(player.x/87*100)}%`;
  cdsEl.textContent="SPIN READY · BREATH READY";
}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(50,now-last);last=now;if(started&&!gameOver)update(dt);renderer.render(scene,camera);}
startBtn.addEventListener("click",begin);
camera.lookAt(0,1.6,0);requestAnimationFrame(frame);
window.__neon={player:()=>player,stage:()=>stage};
