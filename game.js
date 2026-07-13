/* ============================================================
   Game of Khe — Limebo Adventure
   Assets & metadata from limebo-game-pack + environment pack.
   ============================================================ */

'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;   // 1280
const H = canvas.height;  // 720

/* ---------- Manifest: character (game-pack.json) ---------- */
const CELL = { w: 192, h: 208 };
const PIVOT = { x: 0.5, y: 0.94 };
const PLAYER_BOX = { x: 48, y: 42, w: 96, h: 154 }; // in cell pixels

// Atlas states (limebo-actions.webp / limebo-emotes.webp, 8x9 grid, cell 192x208)
const ATLAS_STATES = {
  'combat-ready':     { page: 'actions', row: 0, frames: 6, dur: 120, loop: true,  lock: false },
  'attack-right':     { page: 'actions', row: 1, frames: 8, dur: 80,  loop: false, lock: true, events: [{ frame: 3, type: 'hit', dir: 1 }] },
  'attack-left':      { page: 'actions', row: 2, frames: 8, dur: 80,  loop: false, lock: true, events: [{ frame: 3, type: 'hit', dir: -1 }] },
  'defend':           { page: 'actions', row: 3, frames: 4, dur: 260, loop: false, lock: true, events: [{ frame: 1, type: 'guard-on' }, { frame: 3, type: 'guard-off' }] },
  'hurt':             { page: 'actions', row: 4, frames: 5, dur: 100, loop: false, lock: true },
  'knockout-recover': { page: 'actions', row: 5, frames: 8, dur: 140, loop: false, lock: true },
  'victory':          { page: 'actions', row: 6, frames: 6, dur: 120, loop: true,  lock: true },
  'dance':            { page: 'actions', row: 7, frames: 6, dur: 100, loop: true,  lock: true },
  'sleep':            { page: 'actions', row: 8, frames: 6, dur: 160, loop: true,  lock: true },
  'happy':            { page: 'emotes',  row: 0, frames: 6, dur: 120, loop: true,  lock: false },
  'frightened':       { page: 'emotes',  row: 1, frames: 8, dur: 100, loop: true,  lock: false },
  'angry':            { page: 'emotes',  row: 2, frames: 8, dur: 100, loop: true,  lock: false },
  'surprised':        { page: 'emotes',  row: 3, frames: 4, dur: 120, loop: false, lock: false },
  'dizzy':            { page: 'emotes',  row: 4, frames: 5, dur: 130, loop: true,  lock: true },
  'special-speaker':  { page: 'emotes',  row: 5, frames: 8, dur: 90,  loop: false, lock: true, events: [{ frame: 3, type: 'speaker-pulse' }] },
  'sad':              { page: 'emotes',  row: 6, frames: 6, dur: 140, loop: true,  lock: false },
  'taunt':            { page: 'emotes',  row: 7, frames: 6, dur: 110, loop: true,  lock: false },
  'laugh':            { page: 'emotes',  row: 8, frames: 6, dur: 100, loop: true,  lock: false },
};

// Movement states: chạy trái/phải lấy trực tiếp từ hàng 2 & 3 của base pet atlas
// (assets/spritesheet.webp, 8x11 grid); các state còn lại từ assets/limebo-movement.png
const MOVE_STATES = {
  'idle':          { page: 'movement', row: 0, frames: 6, dur: 183, loop: true,  lock: false },
  'running-right': { page: 'pet',      row: 1, frames: 8, dur: 100, loop: true,  lock: false },
  'running-left':  { page: 'pet',      row: 2, frames: 8, dur: 100, loop: true,  lock: false },
  'jumping':       { page: 'movement', row: 3, frames: 5, dur: 168, loop: false, lock: false },
  'waving':        { page: 'movement', row: 4, frames: 4, dur: 175, loop: true,  lock: false },
  'waiting':       { page: 'movement', row: 5, frames: 6, dur: 168, loop: true,  lock: false },
};

const STATES = Object.assign({}, ATLAS_STATES, MOVE_STATES);

/* ---------- Manifest: environment (environment-pack.json) ---------- */
const OBSTACLE_DEFS = {
  'fallen-log':       { kind: 'solid',                      box: [110, 340, 292, 140] },
  'rounded-boulder':  { kind: 'solid',                      box: [130, 280, 252, 200] },
  'thorn-bush':       { kind: 'damage', damage: 1,          box: [115, 290, 282, 190] },
  'tree-stump':       { kind: 'solid',                      box: [120, 330, 272, 150] },
  'puddle':           { kind: 'slow-zone', speedMult: 0.55, box: [90, 400, 332, 70] },
  'mushroom-cluster': { kind: 'solid',                      box: [145, 300, 222, 180] },
  'stacked-stones':   { kind: 'solid',                      box: [150, 300, 212, 180] },
  'low-fence':        { kind: 'solid',                      box: [100, 345, 312, 135] },
  'wooden-crate':     { kind: 'solid',                      box: [105, 180, 302, 300] },
  'traffic-cone':     { kind: 'solid',                      box: [140, 220, 232, 260] },
  'road-barrier':     { kind: 'solid',                      box: [95, 280, 322, 200] },
  'cloth-barrel':     { kind: 'solid',                      box: [125, 200, 262, 280] },
  'crystal-cluster':  { kind: 'damage', damage: 1,          box: [135, 250, 242, 230] },
  'felt-stalagmite':  { kind: 'damage', damage: 1,          box: [150, 200, 212, 280] },
  'mine-cart':        { kind: 'solid',                      box: [100, 220, 312, 260] },
  'broken-pillar':    { kind: 'solid',                      box: [145, 220, 222, 260] },
};
const OB_CELL = 512;
const OB_PIVOT_Y = 0.9375; // baseline at 480px inside each 512 cell
const OB_SCALE = 0.55;

// World = nhiều tile background lặp lại (bg 1920x1080 scale còn 720 cao = đúng 1280 rộng)
const TILES_PER_LEVEL = 6;
const WORLD_W = W * TILES_PER_LEVEL;

// groundY: baseline chân nhân vật/vật cản nằm NGAY TRÊN mặt đường của mỗi background
const LEVELS = [
  { key: 'meadow',         name: 'Đồng cỏ',        groundY: 0.865, obstacles: ['fallen-log', 'puddle', 'thorn-bush', 'tree-stump', 'mushroom-cluster', 'low-fence', 'rounded-boulder', 'stacked-stones'] },
  { key: 'forest',         name: 'Rừng xanh',      groundY: 0.85,  obstacles: ['tree-stump', 'thorn-bush', 'fallen-log', 'mushroom-cluster', 'rounded-boulder', 'thorn-bush', 'stacked-stones'] },
  { key: 'village-sunset', name: 'Làng hoàng hôn', groundY: 0.88,  obstacles: ['traffic-cone', 'wooden-crate', 'road-barrier', 'cloth-barrel', 'low-fence', 'traffic-cone', 'wooden-crate'] },
  { key: 'crystal-cave',   name: 'Hang pha lê',    groundY: 0.875, obstacles: ['crystal-cluster', 'felt-stalagmite', 'rounded-boulder', 'mine-cart', 'broken-pillar', 'crystal-cluster', 'stacked-stones'] },
];

// Rải vật cản dọc thế giới dài: lặp danh sách đề xuất với khoảng cách ngẫu nhiên (seed cố định theo màn)
function buildObstacles(lv, seed) {
  let s = (seed * 9973 + 7) >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const out = [];
  let x = 700, i = 0;
  while (x < WORLD_W - 500) {
    const name = lv.obstacles[i % lv.obstacles.length];
    out.push({ name, x: Math.round(x), def: OBSTACLE_DEFS[name], dead: false, fade: 1 });
    x += 500 + rng() * 450;
    i++;
  }
  return out;
}

/* ---------- Emote bar ---------- */
const EMOTES = [
  ['😊', 'happy', 'Vui vẻ'], ['😂', 'laugh', 'Cười lớn'], ['😢', 'sad', 'Buồn'],
  ['😠', 'angry', 'Tức giận'], ['😲', 'surprised', 'Ngạc nhiên'], ['😨', 'frightened', 'Sợ hãi'],
  ['😵', 'dizzy', 'Choáng váng'], ['😝', 'taunt', 'Trêu chọc'], ['📢', 'special-speaker', 'Loa phóng thanh'],
  ['💃', 'dance', 'Nhảy múa'], ['🏆', 'victory', 'Ăn mừng'], ['😴', 'sleep', 'Ngủ'],
  ['👋', 'waving', 'Vẫy tay'], ['⏳', 'waiting', 'Chờ đợi'],
];

/* ---------- Asset loading ---------- */
const IMAGES = {};
// Thử lại tối đa 3 lần (mạng/CDN chập chờn khi vừa deploy GitHub Pages);
// ảnh vật cản hỏng hẳn thì bỏ qua thay vì chặn cả game.
function loadImage(key, src, attempt = 1) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { IMAGES[key] = img; resolve(); };
    img.onerror = () => {
      if (attempt < 3) {
        setTimeout(() => loadImage(key, src, attempt + 1).then(resolve, reject), 400 * attempt);
      } else if (key.startsWith('ob:')) {
        console.warn('Bỏ qua vật cản thiếu ảnh: ' + src);
        resolve();
      } else {
        reject(new Error('Không tải được ' + src));
      }
    };
    img.src = src + (attempt > 1 ? '?retry=' + attempt : '');
  });
}

const loadJobs = [
  loadImage('actions', 'assets/limebo-actions.webp'),
  loadImage('emotes', 'assets/limebo-emotes.webp'),
  loadImage('movement', 'assets/limebo-movement.png'),
  loadImage('pet', 'assets/spritesheet.webp'),
];
for (const lv of LEVELS) loadJobs.push(loadImage('bg:' + lv.key, `assets/backgrounds/${lv.key}.webp`));
for (const name of Object.keys(OBSTACLE_DEFS)) loadJobs.push(loadImage('ob:' + name, `assets/obstacles/${name}.webp`));

/* ---------- Game state ---------- */
const keys = {};
let score = 0;
let levelIndex = 0;
let obstacles = [];       // { name, x, def, dead, fade }
let pulses = [];          // speaker pulse rings { x, y, r, alpha }
let projectiles = [];     // skill shots { x, y, dir, dist }
let gameWon = false;
let overlayHideAt = 0;    // thời điểm ẩn overlay "hết tim"

// Nâng chân nhân vật lên một chút so với baseline vật cản để đứng NGAY TRÊN mặt đường
const PLAYER_LIFT = 12;
const MAX_JUMPS = 2;          // double jump
const SKILL_COOLDOWN = 2500;  // ms
const SKILL_SPEED = 720;      // px/s
const SKILL_RANGE = 950;      // px

const player = {
  x: 120,
  footY: 0,          // absolute foot position (world y)
  vy: 0,
  grounded: true,
  jumpsUsed: 0,
  facing: 1,
  hp: 5, maxHp: 5,
  invulnUntil: 0,
  guarding: false,
  speed: 300,
  state: 'idle',
  stateStart: 0,
  emoteUntil: 0,
  castPending: false,
  skillReadyAt: 0,
  eventsFired: new Set(),
};

const heartsEl = document.getElementById('hearts');
const scoreEl = document.getElementById('score');
const levelNameEl = document.getElementById('levelName');
const overlayEl = document.getElementById('overlay');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlayTextEl = document.getElementById('overlayText');

function groundLine() { return LEVELS[levelIndex].groundY * H; }
function playerGround() { return groundLine() - PLAYER_LIFT; }

function setState(name, now) {
  if (player.state === name) return;
  player.state = name;
  player.stateStart = now;
  player.eventsFired = new Set();
}

function loadLevel(i, now) {
  levelIndex = (i + LEVELS.length) % LEVELS.length;
  const lv = LEVELS[levelIndex];
  obstacles = buildObstacles(lv, levelIndex).filter((ob) => IMAGES['ob:' + ob.name]);
  projectiles = [];
  levelNameEl.textContent = `Màn ${levelIndex + 1}: ${lv.name}`;
  player.guarding = false;
  player.castPending = false;
  player.footY = playerGround();
  player.vy = 0;
  player.grounded = true;
  player.jumpsUsed = 0;
  setState('idle', now);
}

function updateHUD() {
  heartsEl.textContent = '❤️'.repeat(player.hp) + '🖤'.repeat(player.maxHp - player.hp);
  scoreEl.textContent = String(score);
}

/* ---------- Geometry helpers ---------- */
function playerBoxAt(x, footY) {
  const drawX = x - CELL.w * PIVOT.x;
  const drawY = footY - CELL.h * PIVOT.y;
  return { x: drawX + PLAYER_BOX.x, y: drawY + PLAYER_BOX.y, w: PLAYER_BOX.w, h: PLAYER_BOX.h };
}
function playerBox() { return playerBoxAt(player.x, player.footY); }

function obstacleBox(ob) {
  const [bx, by, bw, bh] = ob.def.box;
  const drawX = ob.x - OB_CELL * 0.5 * OB_SCALE;
  const drawY = groundLine() - OB_CELL * OB_PIVOT_Y * OB_SCALE;
  return { x: drawX + bx * OB_SCALE, y: drawY + by * OB_SCALE, w: bw * OB_SCALE, h: bh * OB_SCALE };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function hOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

// Highest solid surface (smallest y) under the player's feet at column x
const STEP_TOLERANCE = 14;
function supportLevel(x, footY) {
  let s = playerGround();
  const pb = playerBoxAt(x, footY);
  for (const ob of obstacles) {
    if (ob.dead || ob.def.kind !== 'solid') continue;
    const b = obstacleBox(ob);
    if (hOverlap(pb, b) && b.y >= footY - STEP_TOLERANCE) s = Math.min(s, b.y);
  }
  return s;
}

/* ---------- Combat & damage ---------- */
function doAttackHit(dir) {
  const pb = playerBox();
  const reach = { x: dir > 0 ? pb.x + pb.w * 0.5 : pb.x - 110 + pb.w * 0.5, y: pb.y, w: 110 + pb.w * 0.5, h: pb.h };
  let hitAny = false;
  for (const ob of obstacles) {
    if (ob.dead || ob.def.kind !== 'damage') continue;
    if (overlap(reach, obstacleBox(ob))) {
      ob.dead = true;
      score += 10;
      hitAny = true;
    }
  }
  if (hitAny) updateHUD();
}

function takeDamage(now, amount) {
  if (now < player.invulnUntil || player.guarding || gameWon) return;
  player.hp = Math.max(0, player.hp - amount);
  player.invulnUntil = now + 1500;
  player.x -= player.facing * 70; // knockback
  updateHUD();
  setState(player.hp <= 0 ? 'knockout-recover' : 'hurt', now);
}

/* ---------- Input ---------- */
const EMOTE_LOOP_MS = 2500;

function isEmote(name) {
  return EMOTES.some(([, st]) => st === name);
}

function playEmote(stateName, now) {
  if (gameWon) return;
  if (!STATES[stateName]) return;
  if (player.state === 'hurt' || player.state === 'knockout-recover') return;
  if (!player.grounded) return;
  setState(stateName, now);
  player.emoteUntil = STATES[stateName].loop ? now + EMOTE_LOOP_MS : Infinity;
}

function tryAttack(now) {
  const cur = STATES[player.state];
  if (cur.lock && !isEmote(player.state)) return;
  if (!player.grounded) return;
  setState(player.facing >= 0 ? 'attack-right' : 'attack-left', now);
}
function tryDefend(now) {
  const cur = STATES[player.state];
  if (cur.lock && !isEmote(player.state)) return;
  if (!player.grounded) return;
  setState('defend', now);
}
// Nhảy edge-triggered: nhấn lần 2 khi đang trên không = double jump (cao gấp đôi)
function tryJump(now) {
  const cur = STATES[player.state];
  if (cur.lock && !isEmote(player.state)) return;
  if (player.grounded) {
    player.vy = JUMP_V;
    player.grounded = false;
    player.jumpsUsed = 1;
    setState('jumping', now);
  } else if (player.jumpsUsed < MAX_JUMPS) {
    player.vy = JUMP_V;
    player.jumpsUsed++;
    setState('idle', now);       // ép restart animation nhảy
    setState('jumping', now);
    pulses.push({ x: player.x, y: player.footY, r: 14, alpha: 0.8 });
  }
}
// Chiêu tầm xa: animation loa phóng thanh bắn quả cầu năng lượng xoá vật cản
function trySkill(now) {
  const cur = STATES[player.state];
  if (cur.lock && !isEmote(player.state)) return;
  if (!player.grounded) return;
  if (now < player.skillReadyAt) return;
  player.skillReadyAt = now + SKILL_COOLDOWN;
  player.castPending = true;
  setState('special-speaker', now);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault();
  keys[e.key.toLowerCase()] = true;
  const now = performance.now();

  if (gameWon) {
    if (e.key === 'Enter') restart(now);
    return;
  }

  if (e.key === 'j' || e.key === 'J') tryAttack(now);
  if (e.key === 'k' || e.key === 'K') tryDefend(now);
  if (e.key === 'l' || e.key === 'L') trySkill(now);
  if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !e.repeat) tryJump(now);
  const di = '1234567890'.indexOf(e.key);
  if (di >= 0 && EMOTES[di]) playEmote(EMOTES[di][1], now);
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
// Tránh kẹt phím khi tab/cửa sổ mất focus giữa lúc đang giữ phím
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const k in keys) keys[k] = false;
});

/* ---------- Touch controls (mobile) ---------- */
function bindHoldButton(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const press = (e) => { e.preventDefault(); keys[key] = true; };
  const release = (e) => { e.preventDefault(); keys[key] = false; };
  el.addEventListener('pointerdown', press);
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave', release);
}
function bindTapButton(id, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (gameWon) { restart(now); return; }
    fn(now);
  });
}
bindHoldButton('btnLeft', 'arrowleft');
bindHoldButton('btnRight', 'arrowright');
bindTapButton('btnJump', tryJump);
bindTapButton('btnAttack', tryAttack);
bindTapButton('btnDefend', tryDefend);
bindTapButton('btnSkill', trySkill);
// Chạm vào canvas khi thắng cũng chơi lại được
canvas.addEventListener('pointerdown', () => { if (gameWon) restart(performance.now()); });

/* ---------- Emote bar UI ---------- */
const bar = document.getElementById('emoteBar');
EMOTES.forEach(([emoji, stateName, label], i) => {
  const btn = document.createElement('button');
  btn.title = label;
  btn.innerHTML = `${emoji}<span class="k">${i < 10 ? String((i + 1) % 10) : '·'}</span>`;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    playEmote(stateName, performance.now());
    document.body.classList.remove('emotes-open'); // đóng panel trên mobile
  });
  bar.appendChild(btn);
});

/* ---------- Restart / victory ---------- */
function restart(now) {
  score = 0;
  gameWon = false;
  player.hp = player.maxHp;
  player.x = 120;
  player.skillReadyAt = 0;
  overlayEl.classList.remove('show');
  loadLevel(0, now);
  updateHUD();
}

function winGame(now) {
  gameWon = true;
  setState('victory', now);
  overlayTitleEl.textContent = '🏆 CHIẾN THẮNG!';
  overlayTextEl.textContent = `Limebo đã vượt qua cả 4 vùng đất! Điểm: ${score} — Nhấn Enter để chơi lại`;
  overlayEl.classList.add('show');
}

/* ---------- Update ---------- */
const GRAVITY = 2600;
const JUMP_V = -1050;

function update(dt, now) {
  const st = STATES[player.state];

  // Ẩn overlay "hết tim" sau khi hiện đủ lâu
  if (overlayHideAt && now >= overlayHideAt) {
    overlayEl.classList.remove('show');
    overlayHideAt = 0;
  }

  // Finish non-loop states
  if (!st.loop) {
    const elapsed = now - player.stateStart;
    if (elapsed >= st.frames * st.dur && player.state !== 'jumping') {
      if (player.state === 'knockout-recover') {
        // Hết tim: chơi lại từ đầu (màn 1, 0 điểm)
        restart(now);
        overlayTitleEl.textContent = '💀 Hết tim!';
        overlayTextEl.textContent = 'Chơi lại từ Màn 1...';
        overlayEl.classList.add('show');
        overlayHideAt = now + 2200;
        return;
      }
      if (player.state === 'defend') player.guarding = false;
      setState('idle', now);
    }
  }
  // Finish looping emotes
  if (isEmote(player.state) && STATES[player.state].loop && now >= player.emoteUntil) {
    setState('idle', now);
  }

  // Fire animation events
  if (st.events) {
    const frame = Math.min(st.frames - 1, Math.floor((now - player.stateStart) / st.dur));
    for (const ev of st.events) {
      const key = ev.type + ':' + ev.frame;
      if (frame >= ev.frame && !player.eventsFired.has(key)) {
        player.eventsFired.add(key);
        if (ev.type === 'hit') doAttackHit(ev.dir);
        if (ev.type === 'guard-on') player.guarding = true;
        if (ev.type === 'guard-off') player.guarding = false;
        if (ev.type === 'speaker-pulse') {
          pulses.push({ x: player.x, y: player.footY - 120, r: 30, alpha: 1 });
          if (player.castPending) {
            player.castPending = false;
            projectiles.push({ x: player.x + player.facing * 70, y: player.footY - 100, dir: player.facing, dist: 0 });
          }
        }
      }
    }
  }

  // Pulses & fading always animate
  for (const ob of obstacles) if (ob.dead && ob.fade > 0) ob.fade = Math.max(0, ob.fade - dt * 3);
  for (const p of pulses) { p.r += 220 * dt; p.alpha -= dt * 1.4; }
  pulses = pulses.filter((p) => p.alpha > 0);

  if (gameWon) return;

  const locked = STATES[player.state].lock;

  // Slow zones (feet inside the zone box)
  let speedMult = 1;
  const pbNow = playerBox();
  for (const ob of obstacles) {
    if (ob.dead || ob.def.kind !== 'slow-zone') continue;
    if (overlap(pbNow, obstacleBox(ob))) speedMult = Math.min(speedMult, ob.def.speedMult);
  }

  // Horizontal input
  let vx = 0;
  if (!locked) {
    if (keys['arrowleft'] || keys['a']) { vx = -player.speed * speedMult; player.facing = -1; }
    if (keys['arrowright'] || keys['d']) { vx = player.speed * speedMult; player.facing = 1; }
  }

  // Horizontal move with solid blocking (can step onto tops within tolerance)
  if (vx !== 0) {
    const newX = player.x + vx * dt;
    const tryBox = playerBoxAt(newX, player.footY);
    let blocked = false;
    for (const ob of obstacles) {
      if (ob.dead || ob.def.kind !== 'solid') continue;
      const b = obstacleBox(ob);
      // Only blocks if the player's feet are below the obstacle top (not standing on it)
      if (overlap(tryBox, b) && player.footY > b.y + STEP_TOLERANCE) { blocked = true; break; }
    }
    if (!blocked) player.x = newX;
  }

  // Vertical physics
  if (!player.grounded) {
    player.vy += GRAVITY * dt;
    let newFoot = player.footY + player.vy * dt;
    if (player.vy >= 0) {
      const support = supportLevel(player.x, player.footY);
      if (newFoot >= support) {
        newFoot = support;
        player.vy = 0;
        player.grounded = true;
        player.jumpsUsed = 0;
        if (player.state === 'jumping') setState('idle', now);
      }
    }
    player.footY = newFoot;
  } else {
    // Walked off an edge?
    const support = supportLevel(player.x, player.footY);
    if (support > player.footY + 1) {
      player.grounded = false;
      player.vy = 0;
    } else {
      player.footY = support;
    }
  }

  // Grounded movement animation
  if (player.grounded && !locked && player.state !== 'jumping' && !isEmote(player.state)) {
    if (vx > 0) setState('running-right', now);
    else if (vx < 0) setState('running-left', now);
    else if (player.state === 'running-right' || player.state === 'running-left') setState('idle', now);
  }

  // Damage obstacles
  const pb2 = playerBox();
  for (const ob of obstacles) {
    if (ob.dead || ob.def.kind !== 'damage') continue;
    if (overlap(pb2, obstacleBox(ob))) { takeDamage(now, ob.def.damage); break; }
  }

  // Skill projectiles: bay thẳng, chạm vật cản nào là xoá vật cản đó
  for (const p of projectiles) {
    const step = SKILL_SPEED * dt * p.dir;
    p.x += step;
    p.dist += Math.abs(step);
    // Hitbox quét từ quả cầu xuống mặt đất để trúng cả vật cản thấp
    const shotBox = { x: p.x - 18, y: p.y - 20, w: 36, h: Math.max(40, groundLine() - p.y + 20) };
    for (const ob of obstacles) {
      if (ob.dead) continue;
      if (overlap(shotBox, obstacleBox(ob))) {
        ob.dead = true;
        score += 10;
        updateHUD();
        pulses.push({ x: p.x, y: p.y, r: 20, alpha: 1 });
        p.dist = Infinity;
        break;
      }
    }
  }
  projectiles = projectiles.filter((p) => p.dist < SKILL_RANGE && p.x > -50 && p.x < WORLD_W + 50);

  // Level bounds & transition
  if (player.x > WORLD_W - 30) {
    if (levelIndex === LEVELS.length - 1) {
      player.x = WORLD_W - 30;
      winGame(now);
    } else {
      score += 50;
      loadLevel(levelIndex + 1, now);
      player.x = 60;
      updateHUD();
    }
  }
  if (player.x < 30) player.x = 30;
}

/* ---------- Render ---------- */
function render(now) {
  const lv = LEVELS[levelIndex];
  const camX = Math.max(0, Math.min(WORLD_W - W, player.x - W / 2));

  const bg = IMAGES['bg:' + lv.key];
  const firstTile = Math.floor(camX / W);
  for (let i = firstTile; i <= firstTile + 1; i++) ctx.drawImage(bg, i * W - camX, 0, W, H);

  // Obstacles
  const obSize = OB_CELL * OB_SCALE;
  for (const ob of obstacles) {
    if (ob.dead && ob.fade <= 0) continue;
    const img = IMAGES['ob:' + ob.name];
    const dx = ob.x - obSize / 2 - camX;
    const dy = groundLine() - OB_CELL * OB_PIVOT_Y * OB_SCALE;
    ctx.save();
    if (ob.dead) ctx.globalAlpha = ob.fade;
    ctx.drawImage(img, dx, dy, obSize, obSize);
    ctx.restore();
  }

  // Skill projectiles
  for (const p of projectiles) {
    const sx = p.x - camX;
    ctx.save();
    const grad = ctx.createRadialGradient(sx, p.y, 2, sx, p.y, 16);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#9ef01a');
    grad.addColorStop(1, 'rgba(158, 240, 26, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, p.y, 16, 0, Math.PI * 2);
    ctx.fill();
    // vệt sáng phía sau
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#9ef01a';
    ctx.beginPath();
    ctx.ellipse(sx - p.dir * 22, p.y, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Speaker pulses
  for (const p of pulses) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.strokeStyle = '#9ef01a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p.x - camX, p.y, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Player sprite
  const st = STATES[player.state];
  const elapsed = Math.max(0, now - player.stateStart);
  let frame = Math.floor(elapsed / st.dur);
  frame = st.loop ? frame % st.frames : Math.min(frame, st.frames - 1);

  const img = IMAGES[st.page];
  const dx = player.x - CELL.w * PIVOT.x - camX;
  const dy = player.footY - CELL.h * PIVOT.y;

  ctx.save();
  if (now < player.invulnUntil && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.drawImage(img, frame * CELL.w, st.row * CELL.h, CELL.w, CELL.h, dx, dy, CELL.w, CELL.h);
  ctx.restore();

  // Guard indicator
  if (player.guarding) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#7fc8ff';
    ctx.beginPath();
    ctx.arc(player.x - camX, player.footY - 100, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------- Main loop ---------- */
let lastT = 0;
const btnSkillEl = document.getElementById('btnSkill');
function step(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  update(dt, t);
  render(t);
  if (btnSkillEl) btnSkillEl.classList.toggle('cd', t < player.skillReadyAt);
}
function loop(t) {
  step(t);
  requestAnimationFrame(loop);
}

Promise.all(loadJobs).then(() => {
  const now = performance.now();
  lastT = now;
  loadLevel(0, now);
  updateHUD();
  requestAnimationFrame(loop);
  // Fallback: keep the game ticking when requestAnimationFrame is throttled
  setInterval(() => {
    const t = performance.now();
    if (t - lastT > 30) step(t);
  }, 33);
}).catch((err) => {
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('Lỗi tải tài nguyên: ' + err.message, 40, 60);
});
