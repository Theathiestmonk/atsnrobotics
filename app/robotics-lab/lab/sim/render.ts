import type { Obstacle } from "../../data/environments";
import { LIDAR_Z, ROBOT_R, type Sim } from "./engine";

export type ViewMode = "2d" | "3d";

export interface Layers {
  path: boolean;
  scan: boolean;
  trail: boolean;
}

export interface Projection {
  s: number;
  ox: number;
  oy: number;
  K: number;
  M: number;
}

const GOLD = "#c9a962";
const GOLD_HI = "#f0d89a";
const SILVER = "#c9cbd0";

type Pal = {
  floorA: string; floorB: string; gridMajor: string; gridMinor: string; trail: string; start: string;
  ghost: string; scanRay: string; rangeCone: string; hit: string; wallTop: string; wallFront: string;
  rackTop: string; rackFront: string; mapBg: string; mapFree: string; mapOcc: string; mapRobot: string;
  svBg: string; svGrid: string; svText: string; svLidar: string; svDepth: string; svCone: string; svLabel: string;
};

const DARK: Pal = {
  floorA: "#151517", floorB: "#1d1d20", gridMajor: "rgba(201,169,98,0.13)", gridMinor: "rgba(255,255,255,0.04)",
  trail: "rgba(201,203,208,0.35)", start: "rgba(232,232,234,0.6)", ghost: "rgba(232,232,234,0.85)",
  scanRay: "rgba(220,222,228,0.10)", rangeCone: "rgba(232,232,234,0.10)", hit: GOLD_HI,
  wallTop: "#5d5f65", wallFront: "#2f3034", rackTop: "#232326", rackFront: "#151517",
  mapBg: "#09090a", mapFree: "#2a2a2e", mapOcc: GOLD_HI, mapRobot: "#fff",
  svBg: "#09090a", svGrid: "rgba(201,169,98,0.18)", svText: "rgba(255,255,255,0.35)", svLidar: "#d7b46a",
  svDepth: "#e8e8ea", svCone: "rgba(255,255,255,0.08)", svLabel: "#fff",
};

const LIGHT: Pal = {
  floorA: "#f3f1ec", floorB: "#e6e2da", gridMajor: "rgba(138,106,46,0.22)", gridMinor: "rgba(28,25,13,0.06)",
  trail: "rgba(60,58,52,0.4)", start: "rgba(60,58,52,0.6)", ghost: "rgba(40,38,32,0.85)",
  scanRay: "rgba(60,58,52,0.12)", rangeCone: "rgba(60,58,52,0.10)", hit: "#8a6a2e",
  wallTop: "#a9abb0", wallFront: "#7d8086", rackTop: "#3a3a40", rackFront: "#26262a",
  mapBg: "#f4f2ee", mapFree: "#dcd8cf", mapOcc: "#7d5e30", mapRobot: "#1c190d",
  svBg: "#f7f5f1", svGrid: "rgba(138,106,46,0.25)", svText: "rgba(28,25,13,0.45)", svLidar: "#8a6a2e",
  svDepth: "#4a4c52", svCone: "rgba(28,25,13,0.06)", svLabel: "#1c190d",
};

let T: Pal = DARK;
export function setRenderTheme(theme: "dark" | "light") {
  T = theme === "light" ? LIGHT : DARK;
}

export function projection(sim: Sim, cw: number, ch: number, mode: ViewMode): Projection {
  const pad = 18;
  const K = mode === "3d" ? 0.66 : 1;
  const M = mode === "3d" ? 0.42 : 0;
  const lift = mode === "3d" ? 2.4 : 0;
  const s = Math.min((cw - pad * 2) / sim.env.w, (ch - pad * 2) / (sim.env.h * K + lift * M));
  const ox = (cw - sim.env.w * s) / 2;
  const oy = (ch - (sim.env.h * K + lift * M) * s) / 2 + lift * M * s;
  return { s, ox, oy, K, M };
}

export function unproject(p: Projection, sx: number, sy: number) {
  return { x: (sx - p.ox) / p.s, y: (sy - p.oy) / (p.s * p.K) };
}

export function drawWorld(ctx: CanvasRenderingContext2D, sim: Sim, cw: number, ch: number, mode: ViewMode, layers: Layers, now: number) {
  const P = projection(sim, cw, ch, mode);
  const pr = (x: number, y: number, z = 0): [number, number] => [P.ox + x * P.s, P.oy + y * P.s * P.K - z * P.s * P.M];
  const env = sim.env;

  ctx.clearRect(0, 0, cw, ch);

  // Floor
  const f0 = pr(0, 0);
  const f1 = pr(env.w, env.h);
  const floor = ctx.createLinearGradient(0, f0[1], 0, f1[1]);
  floor.addColorStop(0, T.floorA);
  floor.addColorStop(1, T.floorB);
  ctx.fillStyle = floor;
  ctx.fillRect(f0[0], f0[1], f1[0] - f0[0], f1[1] - f0[1]);

  // Grid (1 m)
  ctx.lineWidth = 1;
  for (let x = 0; x <= env.w; x++) {
    ctx.strokeStyle = x % 5 === 0 ? T.gridMajor : T.gridMinor;
    line(ctx, pr(x, 0), pr(x, env.h));
  }
  for (let y = 0; y <= env.h; y++) {
    ctx.strokeStyle = y % 5 === 0 ? T.gridMajor : T.gridMinor;
    line(ctx, pr(0, y), pr(env.w, y));
  }

  // Trail
  if (layers.trail && sim.trail.length > 1) {
    ctx.strokeStyle = T.trail;
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.5;
    poly(ctx, sim.trail.map((p) => pr(p.x, p.y)));
    ctx.setLineDash([]);
  }

  // Planned path
  if (layers.path && sim.path.length > 1) {
    ctx.save();
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    poly(ctx, sim.path.map((p) => pr(p.x, p.y, 0.01)));
    ctx.restore();
    ctx.fillStyle = "#fff";
    for (let k = 0; k < sim.path.length; k += 8) {
      const [x, y] = pr(sim.path[k].x, sim.path[k].y);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Start marker
  {
    const [x, y] = pr(sim.start.x, sim.start.y);
    ctx.strokeStyle = T.start;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 0.45 * P.s, 0.45 * P.s * P.K, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Goal base ring (pulsing)
  {
    const [x, y] = pr(sim.goal.x, sim.goal.y);
    const pulse = (now / 1200) % 1;
    ctx.strokeStyle = `rgba(201,169,98,${0.8 - pulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, (0.3 + pulse * 0.6) * P.s, (0.3 + pulse * 0.6) * P.s * P.K, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(201,169,98,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y, 0.3 * P.s, 0.3 * P.s * P.K, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sensor rays
  if (layers.scan) drawRays(ctx, sim, pr, P);

  // Solids, painter-sorted by their front edge.
  type Solid = { y: number; draw: () => void };
  const solids: Solid[] = [];
  for (const o of env.obstacles) solids.push({ y: o.kind === "rect" ? o.y + o.h : o.y + o.r, draw: () => drawObstacle(ctx, o, pr, P, mode) });
  for (const [i, m] of env.movers.entries()) {
    const p = sim.mover(i);
    solids.push({
      y: p.y + m.r,
      draw: () =>
        m.style === "person"
          ? drawCylinder(ctx, pr, P, p.x, p.y, m.r, 1.6, "#2b2b30", "#454549", { head: true })
          : drawBox(ctx, pr, P, p.x - 0.55, p.y - 0.4, 1.1, 0.8, 1.1, "#c9a962", "#7d5e30", mode),
    });
  }
  solids.push({ y: sim.pose.y + ROBOT_R, draw: () => drawRobot(ctx, sim, pr, P, now) });
  solids.sort((a, b) => a.y - b.y);
  solids.forEach((s) => s.draw());

  // Estimated pose ghost
  if (sim.est && Math.hypot(sim.est.x - sim.pose.x, sim.est.y - sim.pose.y) > 0.12) {
    const [x, y] = pr(sim.est.x, sim.est.y);
    ctx.strokeStyle = T.ghost;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, ROBOT_R * P.s, ROBOT_R * P.s * P.K, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = T.ghost;
    ctx.font = "500 10px Roboto, sans-serif";
    ctx.fillText("estimate", x + ROBOT_R * P.s + 3, y + 3);
  }

  // Goal pin
  {
    const [x, y] = pr(sim.goal.x, sim.goal.y, mode === "3d" ? 0.9 : 0);
    const r = Math.max(7, 0.26 * P.s);
    ctx.save();
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 14;
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(x, y + (mode === "3d" ? r * 1.9 : 0));
    ctx.arc(x, y - (mode === "3d" ? 0 : r * 1.2), r, Math.PI * 0.8, Math.PI * 0.2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#0b0b0c";
    ctx.beginPath();
    ctx.arc(x, y - (mode === "3d" ? 0 : r * 1.2), r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  return P;
}

function drawRays(ctx: CanvasRenderingContext2D, sim: Sim, pr: (x: number, y: number, z?: number) => [number, number], P: Projection) {
  const { x, y, th } = sim.pose;
  const z = LIDAR_Z;
  const o = pr(x, y, z);
  // Depth cone
  const depth = sim.rays.filter((r) => r.src === "depth");
  if (depth.length) {
    ctx.fillStyle = "rgba(201,169,98,0.09)";
    ctx.beginPath();
    ctx.moveTo(...o);
    depth.forEach((r) => ctx.lineTo(...pr(x + Math.cos(th + r.a) * r.d, y + Math.sin(th + r.a) * r.d, z)));
    ctx.closePath();
    ctx.fill();
  }
  // Ultrasonic cones
  sim.rays
    .filter((r) => r.src === "range")
    .forEach((r) => {
      ctx.fillStyle = T.rangeCone;
      ctx.beginPath();
      ctx.moveTo(...o);
      for (let k = -2; k <= 2; k++) {
        const a = th + r.a + k * 0.065;
        ctx.lineTo(...pr(x + Math.cos(a) * r.d, y + Math.sin(a) * r.d, z));
      }
      ctx.closePath();
      ctx.fill();
    });
  // LiDAR beams
  const lidar = sim.rays.filter((r) => r.src === "lidar" || r.src === "lidar3d");
  if (lidar.length) {
    ctx.strokeStyle = T.scanRay;
    ctx.lineWidth = 1;
    ctx.beginPath();
    lidar.forEach((r, i) => {
      if (i % 2) return;
      ctx.moveTo(...o);
      ctx.lineTo(...pr(x + Math.cos(th + r.a) * r.d, y + Math.sin(th + r.a) * r.d, z));
    });
    ctx.stroke();
  }
  ctx.fillStyle = T.hit;
  sim.rays.forEach((r) => {
    if (!r.hit || r.src === "range") return;
    const [px, py] = pr(x + Math.cos(th + r.a) * r.d, y + Math.sin(th + r.a) * r.d, z);
    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
  });
  void P;
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, pr: (x: number, y: number, z?: number) => [number, number], P: Projection, mode: ViewMode) {
  if (o.kind === "circle") {
    if (o.style === "table") {
      drawCylinder(ctx, pr, P, o.x, o.y, 0.08, 0.7, "#2a2a2e", "#2a2a2e");
      drawCylinder(ctx, pr, P, o.x, o.y, o.r, 0.06, "#e8e8ea", "#9fa1a6", { z0: 0.7, rim: GOLD });
    } else drawCylinder(ctx, pr, P, o.x, o.y, o.r, o.z, "#9a9ca2", "#5b5d63");
    return;
  }
  const palette: Record<string, [string, string]> = {
    wall: [T.wallTop, T.wallFront],
    rack: [T.rackTop, T.rackFront],
    pallet: ["#b0a490", "#7a6d58"],
    bed: ["#ecedef", "#9fa1a6"],
    counter: [GOLD, "#26262a"],
    cart: [SILVER, "#7d8086"],
    jack: [GOLD, "#7d5e30"],
    conveyor: ["#3a3a40", "#1e1e22"],
  };
  const [top, front] = palette[o.style] ?? palette.wall;
  drawBox(ctx, pr, P, o.x, o.y, o.w, o.h, o.z, top, front, mode, o.style, o.zmin ?? 0);
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  pr: (x: number, y: number, z?: number) => [number, number],
  P: Projection,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  top: string,
  front: string,
  mode: ViewMode,
  style?: string,
  z0 = 0,
) {
  if (z0 > 0) {
    // Floating object: shadow on the floor and thin hanger posts so its height reads clearly.
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    quad(ctx, pr(x, y, 0), pr(x + w, y, 0), pr(x + w, y + h, 0), pr(x, y + h, 0));
    if (mode === "3d") {
      ctx.strokeStyle = "rgba(120,120,128,0.8)";
      ctx.lineWidth = 1.5;
      line(ctx, pr(x + 0.05, y + h / 2, z), pr(x + 0.05, y + h / 2, 2.2));
      line(ctx, pr(x + w - 0.05, y + h / 2, z), pr(x + w - 0.05, y + h / 2, 2.2));
    }
  }
  if (mode === "3d") {
    // Front face
    ctx.fillStyle = front;
    quad(ctx, pr(x, y + h, z0), pr(x + w, y + h, z0), pr(x + w, y + h, z), pr(x, y + h, z));
    if (style === "conveyor") {
      ctx.strokeStyle = "rgba(201,169,98,0.8)";
      ctx.lineWidth = 1;
      line(ctx, pr(x, y + h, (z0 + z) / 2), pr(x + w, y + h, (z0 + z) / 2));
    }
    if (style === "rack") {
      ctx.strokeStyle = "rgba(201,169,98,0.7)";
      ctx.lineWidth = 1;
      for (let lv = 1; lv <= 3; lv++) line(ctx, pr(x, y + h, (z * lv) / 4), pr(x + w, y + h, (z * lv) / 4));
    }
    if (style === "pallet") {
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      line(ctx, pr(x, y + h, z * 0.18), pr(x + w, y + h, z * 0.18));
    }
  }
  ctx.fillStyle = top;
  if (z0 > 0 && mode === "2d") ctx.globalAlpha = 0.55;
  quad(ctx, pr(x, y, z), pr(x + w, y, z), pr(x + w, y + h, z), pr(x, y + h, z));
  ctx.globalAlpha = 1;
  if (style === "conveyor") {
    ctx.strokeStyle = "rgba(201,169,98,0.85)";
    ctx.lineWidth = 1;
    for (let k = 0.15; k < w; k += 0.25) line(ctx, pr(x + k, y, z), pr(x + k, y + h, z));
    if (mode === "2d") {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(...pr(x, y, z), w * P.s, h * P.s * P.K);
      ctx.setLineDash([]);
    }
  }
  if (style === "jack") {
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    line(ctx, pr(x + 0.1, y + h * 0.3, z), pr(x + w - 0.25, y + h * 0.3, z));
    line(ctx, pr(x + 0.1, y + h * 0.7, z), pr(x + w - 0.25, y + h * 0.7, z));
  }
  if (style === "rack") {
    ctx.strokeStyle = "rgba(201,169,98,0.85)";
    ctx.lineWidth = 1.2;
    const n = Math.max(1, Math.round(Math.max(w, h) / 1.2));
    for (let k = 0; k <= n; k++) {
      if (h > w) line(ctx, pr(x, y + (h * k) / n, z), pr(x + w, y + (h * k) / n, z));
      else line(ctx, pr(x + (w * k) / n, y, z), pr(x + (w * k) / n, y + h, z));
    }
    ctx.strokeRect(...pr(x, y, z), w * P.s, h * P.s * P.K);
    // Cartons on top shelf
    ctx.fillStyle = "rgba(176,164,144,0.85)";
    for (let k = 0; k < n; k++) {
      const cx = h > w ? x + w * 0.15 : x + (w * k) / n + 0.15;
      const cy = h > w ? y + (h * k) / n + 0.15 : y + h * 0.15;
      const [sx, sy] = pr(cx, cy, z);
      ctx.fillRect(sx, sy, (h > w ? w * 0.7 : w / n - 0.3) * P.s, (h > w ? h / n - 0.3 : h * 0.7) * P.s * P.K);
    }
  } else if (style === "bed") {
    ctx.fillStyle = "#d4d5d8";
    const [sx, sy] = pr(x + 0.1, y + 0.15, z);
    ctx.fillRect(sx, sy, 0.45 * P.s, (h - 0.3) * P.s * P.K);
    ctx.fillStyle = "rgba(201,169,98,0.35)";
    const [bx, by] = pr(x + 0.7, y, z);
    ctx.fillRect(bx, by, (w - 0.7) * P.s, h * P.s * P.K);
  } else if (style === "pallet") {
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    line(ctx, pr(x + w / 2, y, z), pr(x + w / 2, y + h, z));
    line(ctx, pr(x, y + h / 2, z), pr(x + w, y + h / 2, z));
  }
}

function drawCylinder(
  ctx: CanvasRenderingContext2D,
  pr: (x: number, y: number, z?: number) => [number, number],
  P: Projection,
  x: number,
  y: number,
  r: number,
  h: number,
  top: string,
  side: string,
  opt: { z0?: number; rim?: string; head?: boolean } = {},
) {
  const z0 = opt.z0 ?? 0;
  const rx = r * P.s;
  const ry = r * P.s * P.K;
  const [bx, by] = pr(x, y, z0);
  const [tx, ty] = pr(x, y, z0 + h);
  if (P.M > 0) {
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI);
    ctx.lineTo(tx - rx, ty);
    ctx.ellipse(tx, ty, rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (opt.rim) {
    ctx.strokeStyle = opt.rim;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  if (opt.head) {
    ctx.fillStyle = "#c9cbd0";
    ctx.beginPath();
    ctx.arc(tx, ty - (P.M > 0 ? r * 0.6 * P.s : 0), r * 0.55 * P.s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRobot(ctx: CanvasRenderingContext2D, sim: Sim, pr: (x: number, y: number, z?: number) => [number, number], P: Projection, now: number) {
  const { x, y, th } = sim.pose;
  const H = 0.36;
  // Shadow
  const [sx, sy] = pr(x, y, 0);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + 2, ROBOT_R * P.s * 1.1, ROBOT_R * P.s * P.K * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Glow underneath
  ctx.save();
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = sim.status === "running" ? 18 : 8;
  drawCylinder(ctx, pr, P, x, y, ROBOT_R, H, "#f2f2f4", "#a9abb1");
  ctx.restore();
  // Gold LED band
  if (P.M > 0) {
    const [bx, by] = pr(x, y, H * 0.45);
    ctx.strokeStyle = GOLD_HI;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bx, by, ROBOT_R * P.s, ROBOT_R * P.s * P.K, 0, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Top deck
  const [tx, ty] = pr(x, y, H);
  ctx.fillStyle = "#1a1a1d";
  ctx.beginPath();
  ctx.ellipse(tx, ty, ROBOT_R * 0.78 * P.s, ROBOT_R * 0.78 * P.s * P.K, 0, 0, Math.PI * 2);
  ctx.fill();
  // Heading notch
  const hx = x + Math.cos(th) * ROBOT_R * 0.7;
  const hy = y + Math.sin(th) * ROBOT_R * 0.7;
  const [nx, ny] = pr(hx, hy, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  line(ctx, [tx, ty], [nx, ny]);
  // LiDAR puck
  if (sim.hasHardware("lidar") || sim.hasHardware("lidar3d")) {
    const spin = (now / 100) % (Math.PI * 2);
    ctx.fillStyle = "#0c0c0e";
    ctx.beginPath();
    ctx.ellipse(tx, ty - (P.M > 0 ? 4 : 0), ROBOT_R * 0.32 * P.s, ROBOT_R * 0.32 * P.s * P.K, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GOLD_HI;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(tx, ty - (P.M > 0 ? 4 : 0), ROBOT_R * 0.32 * P.s, ROBOT_R * 0.32 * P.s * P.K, 0, spin, spin + 1.2);
    ctx.stroke();
  }
  if (sim.estopActive) {
    ctx.fillStyle = "rgba(217,95,79,0.9)";
    ctx.font = "700 10px Roboto, sans-serif";
    ctx.fillText("E-STOP", tx - 18, ty - ROBOT_R * P.s - 8);
  }
}

export function drawMap(ctx: CanvasRenderingContext2D, sim: Sim, cw: number, ch: number) {
  const P = projection(sim, cw, ch, "2d");
  ctx.clearRect(0, 0, cw, ch);
  const cell = 0.2 * P.s;
  ctx.fillStyle = T.mapBg;
  ctx.fillRect(P.ox, P.oy, sim.env.w * P.s, sim.env.h * P.s);
  for (let j = 0; j < sim.gh; j++)
    for (let i = 0; i < sim.gw; i++) {
      const v = sim.known[j * sim.gw + i];
      if (!v) continue;
      ctx.fillStyle = v === 2 ? T.mapOcc : T.mapFree;
      ctx.fillRect(P.ox + i * cell, P.oy + j * cell, cell + 0.5, cell + 0.5);
    }
  if (sim.path.length > 1) {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    poly(ctx, sim.path.map((p) => [P.ox + p.x * P.s, P.oy + p.y * P.s]));
  }
  const rx = P.ox + sim.pose.x * P.s;
  const ry = P.oy + sim.pose.y * P.s;
  ctx.fillStyle = T.mapRobot;
  ctx.beginPath();
  ctx.arc(rx, ry, ROBOT_R * P.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  line(ctx, [rx, ry], [rx + Math.cos(sim.pose.th) * ROBOT_R * P.s * 1.6, ry + Math.sin(sim.pose.th) * ROBOT_R * P.s * 1.6]);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(P.ox + sim.goal.x * P.s, P.oy + sim.goal.y * P.s, 6, 0, Math.PI * 2);
  ctx.fill();
  return P;
}

/** Robot-centred scan plot used by the Sensor View panel. Forward is up. */
export function drawSensorView(ctx: CanvasRenderingContext2D, sim: Sim, cw: number, ch: number, source: "lidar" | "depth" | "range") {
  ctx.clearRect(0, 0, cw, ch);
  const range = source === "range" ? 4 : source === "depth" ? 8 : 8;
  const cx = cw / 2;
  const cy = ch / 2 + (source === "lidar" ? 0 : ch * 0.32);
  const s = (Math.min(cw, ch) / 2 - 8) / range;
  ctx.fillStyle = T.svBg;
  ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = T.svGrid;
  ctx.lineWidth = 1;
  ctx.font = "9px Roboto, sans-serif";
  ctx.fillStyle = T.svText;
  for (let r = 2; r <= range; r += 2) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText(`${r} m`, cx + 3, cy - r * s + 10);
  }
  line(ctx, [cx, 0], [cx, ch]);
  line(ctx, [0, cy], [cw, cy]);
  const rays = sim.rays.filter((r) => r.src === source);
  // Robot frame: angle a, forward = up => screen (sin a, -cos a)
  if (source === "range") {
    rays.forEach((r) => {
      ctx.fillStyle = r.hit ? "rgba(201,169,98,0.35)" : T.svCone;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let k = -2; k <= 2; k++) {
        const a = r.a + k * 0.065;
        ctx.lineTo(cx + Math.sin(a) * r.d * s, cy - Math.cos(a) * r.d * s);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = T.svLabel;
      ctx.fillText(`${r.d.toFixed(2)} m`, cx + Math.sin(r.a) * r.d * s - 14, cy - Math.cos(r.a) * r.d * s - 4);
    });
  } else {
    ctx.fillStyle = source === "lidar" ? T.svLidar : T.svDepth;
    rays.forEach((r) => {
      if (!r.hit) return;
      ctx.beginPath();
      ctx.arc(cx + Math.sin(r.a) * r.d * s, cy - Math.cos(r.a) * r.d * s, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx + 6, cy + 6);
  ctx.lineTo(cx - 6, cy + 6);
  ctx.closePath();
  ctx.fill();
  if (!rays.length) {
    ctx.fillStyle = T.svText;
    ctx.font = "12px Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Subscribe to this topic to see data", cw / 2, ch / 2);
    ctx.textAlign = "start";
  }
}

/* ── tiny canvas helpers ── */
function line(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number]) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
}
function poly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
}
function quad(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], c: [number, number], d: [number, number]) {
  ctx.beginPath();
  ctx.moveTo(...a);
  ctx.lineTo(...b);
  ctx.lineTo(...c);
  ctx.lineTo(...d);
  ctx.closePath();
  ctx.fill();
}
