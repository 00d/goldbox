import { DungeonRenderer } from './renderer';

// ============================================================
// Main — sample dungeon map, input, game loop
// ============================================================

const RESOLUTION: [number, number] = [640, 480];
const MOVE_SPEED  = 3.0;  // units per second
const LOOK_SPEED  = 2.0;  // radians per second
const FOV         = Math.PI / 3; // 60 degrees

// --- Sample dungeon map (16x16) ---
// 0 = open floor, 1 = sandstone wall, 2 = dark stone, 3 = wood, 4 = mossy
// fmt: off
const MAP_WIDTH  = 16;
const MAP_HEIGHT = 16;
const MAP_DATA: number[] = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1,
  1, 0, 0, 0, 2, 2, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 2, 2, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
// fmt: on

// --- Camera state ---
let camX = 8.5;
let camY = 8.5;
let camAngle = 0.0;

// --- Input state ---
const keys = new Set<string>();
let mouseDx = 0;
let mouseCapture = false;

// --- Input handlers (registered immediately, independent of GPU init) ---
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

window.addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup',   e => keys.delete(e.key.toLowerCase()));

canvas.addEventListener('click', () => {
  canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  mouseCapture = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', e => {
  if (mouseCapture) mouseDx += e.movementX;
});

// --- Collision helper ---
function canMoveTo(x: number, y: number): boolean {
  const margin = 0.15;
  const corners = [
    [x - margin, y - margin],
    [x + margin, y - margin],
    [x - margin, y + margin],
    [x + margin, y + margin],
  ];
  for (const [cx, cy] of corners) {
    const gx = Math.floor(cx);
    const gy = Math.floor(cy);
    if (gx < 0 || gy < 0 || gx >= MAP_WIDTH || gy >= MAP_HEIGHT) return false;
    if (MAP_DATA[gy * MAP_WIDTH + gx] !== 0) return false;
  }
  return true;
}

// --- Async setup + game loop ---
(async () => {
  const renderer = new DungeonRenderer({ canvas, resolution: RESOLUTION });

  // loadMap awaits GPU init internally before writing buffers
  const mapGrid = new Uint32Array(MAP_DATA);
  await renderer.loadMap(mapGrid, MAP_WIDTH, MAP_HEIGHT);

  let lastTime = performance.now();

  function update(dt: number) {
    const forward = [Math.cos(camAngle), Math.sin(camAngle)];
    const right   = [-Math.sin(camAngle), Math.cos(camAngle)];
    let dx = 0, dy = 0;

    if (keys.has('w')) { dx += forward[0]; dy += forward[1]; }
    if (keys.has('s')) { dx -= forward[0]; dy -= forward[1]; }
    if (keys.has('a')) { dx -= right[0]; dy -= right[1]; }
    if (keys.has('d')) { dx += right[0]; dy += right[1]; }

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }

    const newX = camX + dx * MOVE_SPEED * dt;
    const newY = camY + dy * MOVE_SPEED * dt;

    // Wall sliding: try combined, then each axis independently
    if (canMoveTo(newX, newY)) {
      camX = newX; camY = newY;
    } else if (canMoveTo(newX, camY)) {
      camX = newX;
    } else if (canMoveTo(camX, newY)) {
      camY = newY;
    }

    if (mouseDx !== 0) {
      camAngle += mouseDx * LOOK_SPEED * 0.003;
      mouseDx = 0;
    }

    if (keys.has('arrowleft'))  camAngle -= LOOK_SPEED * dt;
    if (keys.has('arrowright')) camAngle += LOOK_SPEED * dt;
  }

  async function loop() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = now;

    update(dt);

    renderer.setCamera(camX, camY, camAngle, FOV);
    await renderer.frame();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
