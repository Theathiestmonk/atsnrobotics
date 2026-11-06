import { analyze, CAP_MAP, countOf, has, type Build } from "../../data/catalog";
import type { Program } from "../../data/blocks";
import { wiring } from "../../data/blocks";
import { moverPos, zRange, type EnvDef, type Obstacle } from "../../data/environments";

export const ROBOT_R = 0.3;
/** Robot body height (m): anything lower than this in its footprint is a collision. */
export const ROBOT_H = 0.5;
/** 2D LiDAR scan plane height (m). */
export const LIDAR_Z = 0.38;

/** Vertical band each sensor can see: [low, high] in metres. */
const BANDS = {
  lidar: [LIDAR_Z - 0.01, LIDAR_Z + 0.01],
  lidar3d: [0.02, 2.0],
  depth: [0.0, 1.4],
  range: [0.1, 0.3],
  bumper: [0.0, 0.3],
} as const;
const GRID = 0.2;

export type LogLevel = "info" | "ok" | "warn" | "error";
export interface LogLine {
  t: number;
  msg: string;
  level: LogLevel;
}

export type SimStatus = "idle" | "running" | "paused" | "arrived" | "collided" | "lost";

export interface Ray {
  a: number; // relative to heading
  d: number;
  max: number;
  hit: boolean;
  src: "lidar" | "lidar3d" | "depth" | "range";
}

interface Config {
  scan: boolean;
  points: boolean;
  canDrive: boolean;
  driveMissing: string;
  speedScale: number;
  slam: "2d" | "3d" | null;
  depth: boolean;
  range: boolean;
  bumper: boolean;
  odom: boolean;
  imu: boolean;
  gps: boolean;
  goal: { tol: number } | null;
  planner: { inflate: number } | null;
  avoid: { safe: number } | null;
  estop: { dist: number } | null;
  wall: { dist: number } | null;
  drive: { maxV: number; maxW: number } | null;
  smooth: { acc: number } | null;
  localized: boolean;
  mapping: boolean;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class Sim {
  env: EnvDef;
  build: Build;
  cfg!: Config;
  t = 0;
  status: SimStatus = "idle";
  pose = { x: 0, y: 0, th: 0 };
  est: { x: number; y: number; th: number } | null = null;
  v = 0;
  w = 0;
  goal: { x: number; y: number };
  start: { x: number; y: number; th: number };
  path: { x: number; y: number }[] = [];
  pathIdx = 0;
  trail: { x: number; y: number }[] = [];
  rays: Ray[] = [];
  logs: LogLine[] = [];
  manual: { v: number; w: number } | null = null;
  manualSource: "pad" | "py" | null = null;
  known: Uint8Array; // 0 unknown, 1 free, 2 occupied
  gw: number;
  gh: number;
  estopActive = false;
  bumperHit = false;
  minClearance = Infinity;
  estopCount = 0;
  distance = 0;
  private stuckRef = { x: 0, y: 0, t: 0 };
  private lastStuckWarn = -99;
  private warned = new Set<string>();
  private mapTick = 0;
  moverClock: number[] = [];
  private avoidDir = 0;
  /** Obstacle layer: obstacles detected by any sensor get added to the planning map. */
  private detected = new Set<number>();
  private lastHit = -1;
  private replanAt = 0;
  private turnSign = 0;

  constructor(env: EnvDef, build: Build, program: Program) {
    this.env = env;
    this.build = build;
    this.goal = { ...env.goal };
    this.start = { ...env.start };
    this.gw = Math.ceil(env.w / GRID);
    this.gh = Math.ceil(env.h / GRID);
    this.known = new Uint8Array(this.gw * this.gh);
    this.setProgram(program);
    this.reset();
  }

  setProgram(p: Program) {
    const b = this.build;
    const ok = (lane: keyof Program, id: string) => {
      const blk = p[lane].find((x) => x.id === id);
      return blk && wiring(blk.id, p, b).ok ? blk : null;
    };
    const an = analyze(b);
    const caps = an.unlocked;
    const goal = ok("decision", "dec_goal");
    const planner = ok("decision", "dec_planner");
    const avoid = ok("decision", "dec_avoid");
    const estop = ok("decision", "dec_estop");
    const wall = ok("decision", "dec_wall");
    const drive = ok("actuator", "act_drive");
    const smooth = ok("actuator", "act_smooth");
    const cfg: Config = {
      scan: !!ok("input", "in_scan"),
      points: !!ok("input", "in_points"),
      canDrive: caps.has("mobility"),
      driveMissing: an.caps.mobility.missing.join(", "),
      speedScale: an.speedScale,
      slam: null,
      depth: !!ok("input", "in_depth"),
      range: !!ok("input", "in_range"),
      bumper: !!ok("input", "in_bumper"),
      odom: !!ok("input", "in_odom"),
      imu: !!ok("input", "in_imu"),
      gps: !!ok("input", "in_gps"),
      goal: goal ? { tol: goal.params.tol } : null,
      planner: planner ? { inflate: planner.params.inflate } : null,
      avoid: avoid ? { safe: avoid.params.safe } : null,
      estop: estop ? { dist: estop.params.dist } : null,
      wall: wall ? { dist: wall.params.dist } : null,
      drive: drive && caps.has("mobility") ? { maxV: drive.params.maxV, maxW: drive.params.maxW } : null,
      smooth: smooth ? { acc: smooth.params.acc } : null,
      localized: false,
      mapping: caps.has("mapping"),
    };
    // SLAM corrects pose drift when its LiDAR feed is subscribed. 3D wins over 2D.
    cfg.slam = caps.has("mapping3d") && cfg.points ? "3d" : caps.has("mapping") && (cfg.scan || cfg.points) ? "2d" : null;
    cfg.localized = !!cfg.slam;
    cfg.mapping = !!cfg.slam;
    const plannerChanged =
      !!cfg.planner !== !!this.cfg?.planner || cfg.planner?.inflate !== this.cfg?.planner?.inflate || cfg.slam !== this.cfg?.slam;
    this.cfg = cfg;
    if (this.status === "idle") this.est = cfg.odom || cfg.imu ? { ...this.pose } : null;
    if (plannerChanged) this.plan();
  }

  log(msg: string, level: LogLevel = "info") {
    this.logs.push({ t: this.t, msg, level });
    if (this.logs.length > 300) this.logs.splice(0, this.logs.length - 300);
  }

  private warnOnce(key: string, msg: string, level: LogLevel = "warn") {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    this.log(msg, level);
  }

  /** Position of mover i on its own clock (movers pause to yield to the robot). */
  mover(i: number) {
    return moverPos(this.env.movers[i], this.moverClock[i] ?? 0);
  }

  private moverBlocked: number[] = [];

  private advanceMovers(dt: number) {
    this.env.movers.forEach((m, i) => {
      const clock = this.moverClock[i] ?? 0;
      const next = moverPos(m, clock + dt);
      const now = this.mover(i);
      const gap = Math.hypot(next.x - this.pose.x, next.y - this.pose.y) - m.r - ROBOT_R;
      const gapNow = Math.hypot(now.x - this.pose.x, now.y - this.pose.y) - m.r - ROBOT_R;
      // Yield: hold position if the next step closes in on the robot within 0.35 m.
      if (gap > 0.35 || gap > gapNow) {
        this.moverClock[i] = clock + dt;
        this.moverBlocked[i] = 0;
        return;
      }
      this.moverBlocked[i] = (this.moverBlocked[i] ?? 0) + dt;
      if (this.moverBlocked[i] > 1.2) {
        // Give way: turn around (mirror the ping-pong clock to reverse direction in place).
        const len = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]);
        const period = (2 * len) / m.speed;
        const phase = (m.phase ?? 0) * period;
        this.moverClock[i] = period - (clock + phase) - phase;
        this.moverBlocked[i] = 0;
      }
    });
  }

  reset() {
    this.t = 0;
    this.moverClock = this.env.movers.map(() => 0);
    this.moverBlocked = this.env.movers.map(() => 0);
    this.avoidDir = 0;
    this.turnSign = 0;
    this.pose = { ...this.start };
    this.est = this.cfg.odom || this.cfg.imu ? { ...this.start } : null;
    this.v = 0;
    this.w = 0;
    this.trail = [{ x: this.pose.x, y: this.pose.y }];
    this.status = "idle";
    this.manual = null;
    this.manualSource = null;
    this.known.fill(0);
    this.detected.clear();
    this.replanAt = 0;
    this.warned.clear();
    this.estopActive = false;
    this.bumperHit = false;
    this.minClearance = Infinity;
    this.estopCount = 0;
    this.distance = 0;
    this.stuckRef = { x: this.pose.x, y: this.pose.y, t: 0 };
    this.lastStuckWarn = -99;
    this.logs = [];
    this.log("Simulation initialised.");
    this.log(`Robot spawned in ${this.env.name} at (${this.start.x.toFixed(1)}, ${this.start.y.toFixed(1)}) m.`);
    this.plan();
    this.sense();
  }

  setGoal(x: number, y: number) {
    this.goal = { x: clamp(x, 0.4, this.env.w - 0.4), y: clamp(y, 0.4, this.env.h - 0.4) };
    this.manual = null;
    this.manualSource = null;
    this.log(`Goal set to (${this.goal.x.toFixed(1)}, ${this.goal.y.toFixed(1)}).`);
    this.plan();
    if (this.status === "arrived" || this.status === "lost") this.status = "paused";
  }

  setStart(x: number, y: number) {
    this.start = { ...this.start, x: clamp(x, 0.4, this.env.w - 0.4), y: clamp(y, 0.4, this.env.h - 0.4) };
    this.reset();
  }

  /* ── Planning (A* on an inflated occupancy grid) ── */

  plan() {
    this.path = [];
    this.pathIdx = 0;
    if (!this.cfg.planner) return;
    const inflate = ROBOT_R + this.cfg.planner.inflate;
    const { gw, gh } = this;
    const blocked = new Uint8Array(gw * gh);
    for (let j = 0; j < gh; j++)
      for (let i = 0; i < gw; i++) {
        const x = (i + 0.5) * GRID;
        const y = (j + 0.5) * GRID;
        if (this.staticClearance(x, y, this.mapFilter()) < inflate) blocked[j * gw + i] = 1;
      }
    const from = this.est ?? this.pose;
    const si = clamp(Math.floor(from.x / GRID), 0, gw - 1);
    const sj = clamp(Math.floor(from.y / GRID), 0, gh - 1);
    const gi = clamp(Math.floor(this.goal.x / GRID), 0, gw - 1);
    const gj = clamp(Math.floor(this.goal.y / GRID), 0, gh - 1);
    blocked[sj * gw + si] = 0;
    if (blocked[gj * gw + gi]) {
      this.log("Planner: the goal sits inside an obstacle margin. Move the goal.", "warn");
      return;
    }
    const N = gw * gh;
    const g = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const open: number[] = [];
    const f = new Float32Array(N).fill(Infinity);
    const s = sj * gw + si;
    const goalIdx = gj * gw + gi;
    const h = (k: number) => Math.hypot((k % gw) - gi, Math.floor(k / gw) - gj);
    g[s] = 0;
    f[s] = h(s);
    open.push(s);
    const nb = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ];
    let found = false;
    while (open.length) {
      let bi = 0;
      for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
      const cur = open[bi];
      open[bi] = open[open.length - 1];
      open.pop();
      if (cur === goalIdx) {
        found = true;
        break;
      }
      closed[cur] = 1;
      const ci = cur % gw;
      const cj = Math.floor(cur / gw);
      for (const [di, dj, cost] of nb) {
        const ni = ci + di;
        const nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= gw || nj >= gh) continue;
        const n = nj * gw + ni;
        if (blocked[n] || closed[n]) continue;
        if (di && dj && (blocked[cj * gw + ni] || blocked[nj * gw + ci])) continue;
        const ng = g[cur] + cost;
        if (ng < g[n]) {
          if (g[n] === Infinity) open.push(n);
          g[n] = ng;
          f[n] = ng + h(n);
          came[n] = cur;
        }
      }
    }
    if (!found) {
      this.log("Planner: no route to the goal exists.", "error");
      return;
    }
    const cells: { x: number; y: number }[] = [];
    for (let k = goalIdx; k !== -1; k = came[k]) cells.push({ x: ((k % gw) + 0.5) * GRID, y: (Math.floor(k / gw) + 0.5) * GRID });
    cells.reverse();
    cells[cells.length - 1] = { ...this.goal };
    // String-pull: keep only waypoints needed for line of sight.
    const pts = [cells[0]];
    let anchor = 0;
    for (let k = 2; k < cells.length; k++) {
      if (!this.lineFree(cells[anchor], cells[k], inflate * 0.95)) {
        pts.push(cells[k - 1]);
        anchor = k - 1;
      }
    }
    pts.push(cells[cells.length - 1]);
    // Densify for smooth pursuit.
    const dense: { x: number; y: number }[] = [];
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k];
      const b = pts[k + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.25));
      for (let q = 0; q < n; q++) dense.push({ x: a.x + ((b.x - a.x) * q) / n, y: a.y + ((b.y - a.y) * q) / n });
    }
    dense.push(pts[pts.length - 1]);
    this.path = dense;
    let len = 0;
    for (let k = 1; k < dense.length; k++) len += Math.hypot(dense[k].x - dense[k - 1].x, dense[k].y - dense[k - 1].y);
    this.log(`Planning path... found (length ${len.toFixed(1)} m).`, "ok");
  }

  pathLength() {
    let len = 0;
    for (let k = 1; k < this.path.length; k++) len += Math.hypot(this.path[k].x - this.path[k - 1].x, this.path[k].y - this.path[k - 1].y);
    return len || Math.hypot(this.goal.x - this.start.x, this.goal.y - this.start.y) * 1.4;
  }

  private lineFree(a: { x: number; y: number }, b: { x: number; y: number }, margin: number) {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.1);
    for (let k = 0; k <= n; k++) {
      const x = a.x + ((b.x - a.x) * k) / n;
      const y = a.y + ((b.y - a.y) * k) / n;
      if (this.staticClearance(x, y, this.mapFilter()) < margin) return false;
    }
    return true;
  }

  /* ── Geometry ── */

  /** Obstacles the robot's SLAM map contains: a 2D LiDAR only maps what crosses its scan plane. */
  private mapFilter(): (o: Obstacle) => boolean {
    if (this.cfg.slam === "2d") {
      const idx = new Map(this.env.obstacles.map((o, i) => [o, i]));
      return (o) => overlaps(zRange(o), BANDS.lidar) || this.detected.has(idx.get(o) ?? -1);
    }
    return collidable;
  }

  private staticClearance(x: number, y: number, filter: (o: Obstacle) => boolean = collidable) {
    let best = Infinity;
    for (const o of this.env.obstacles) if (filter(o)) best = Math.min(best, distTo(o, x, y));
    return best;
  }

  /** The static obstacle nearest to (x, y), used to explain collisions. */
  private nearestObstacle(x: number, y: number) {
    let best: Obstacle | null = null;
    let bd = Infinity;
    for (const o of this.env.obstacles) {
      if (!collidable(o)) continue;
      const d = distTo(o, x, y);
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return { o: best, d: bd };
  }

  clearance(x: number, y: number) {
    let best = this.staticClearance(x, y);
    this.env.movers.forEach((m, i) => {
      const p = this.mover(i);
      best = Math.min(best, Math.hypot(p.x - x, p.y - y) - m.r);
    });
    return best;
  }

  private cast(x: number, y: number, ang: number, max: number, band: readonly [number, number] = [0, 2]) {
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    let best = max;
    this.lastHit = -1;
    this.env.obstacles.forEach((o, i) => {
      if (!overlaps(zRange(o), band)) return;
      const d = o.kind === "rect" ? rayRect(x, y, dx, dy, o.x, o.y, o.w, o.h) : rayCircle(x, y, dx, dy, o.x, o.y, o.r);
      if (d < best) {
        best = d;
        this.lastHit = i;
      }
    });
    this.env.movers.forEach((m, i) => {
      const p = this.mover(i);
      const d = rayCircle(x, y, dx, dy, p.x, p.y, m.r);
      if (d < best) {
        best = d;
        this.lastHit = -1;
      }
    });
    return best;
  }

  /* ── Sensing ── */

  sense() {
    const { x, y, th } = this.pose;
    const rays: Ray[] = [];
    const noise = () => (Math.random() - 0.5) * 0.02;
    if (this.cfg.scan) {
      for (let k = 0; k < 180; k++) {
        const a = -Math.PI + (k / 180) * Math.PI * 2;
        const d = this.cast(x, y, th + a, 12, BANDS.lidar);
        rays.push({ a, d: d < 12 ? d + noise() : 12, max: 12, hit: d < 12, src: "lidar" });
      }
    }
    if (this.cfg.points) {
      for (let k = 0; k < 180; k++) {
        const a = -Math.PI + (k / 180) * Math.PI * 2;
        const d = this.cast(x, y, th + a, 15, BANDS.lidar3d);
        rays.push({ a, d: d < 15 ? d + noise() : 15, max: 15, hit: d < 15, src: "lidar3d" });
      }
    }
    if (this.cfg.depth) {
      const fov = (87 * Math.PI) / 180;
      for (let k = 0; k < 40; k++) {
        const a = -fov / 2 + (k / 39) * fov;
        const d = this.cast(x, y, th + a, 8, BANDS.depth);
        if (d < 4) this.noteDetection();
        rays.push({ a, d, max: 8, hit: d < 8, src: "depth" });
      }
    }
    if (this.cfg.range) {
      const n = countOf(this.build, "ultrasonic");
      const centers = n >= 2 ? [-0.35, 0.35] : [0];
      for (const c of centers) {
        let d = 4;
        for (let k = -2; k <= 2; k++) {
          d = Math.min(d, this.cast(x, y, th + c + k * 0.065, 4, BANDS.range));
          if (d < 2) this.noteDetection();
        }
        rays.push({ a: c, d: Math.max(0.2, d), max: 4, hit: d < 4, src: "range" });
      }
    }
    this.rays = rays;
    if (this.cfg.bumper) {
      this.bumperHit = false;
      for (let a = -1; a <= 1; a += 0.25) {
        if (this.cast(x, y, th + a, ROBOT_R + 0.06, BANDS.bumper) < ROBOT_R + 0.05) this.bumperHit = true;
      }
    }
  }

  /** Obstacle layer: something a sensor sees that the SLAM map lacks gets added, then we replan. */
  private noteDetection() {
    const i = this.lastHit;
    if (i < 0 || this.cfg.slam !== "2d" || this.detected.has(i)) return;
    if (overlaps(zRange(this.env.obstacles[i]), BANDS.lidar)) return;
    this.detected.add(i);
    const o = this.env.obstacles[i];
    const what = o.style === "conveyor" ? "Overhead conveyor" : o.style === "jack" ? "Low pallet jack" : "Obstacle";
    this.log(`${what} detected outside the LiDAR plane. Added to the map, replanning.`, "ok");
    this.replanAt = this.t + 0.05;
  }

  /** Minimum range reported by any subscribed sensor in a relative-angle sector, minus body radius. */
  sector(a0: number, a1: number) {
    let best = Infinity;
    for (const r of this.rays) {
      if (r.a >= a0 && r.a <= a1 && r.hit) best = Math.min(best, r.d - ROBOT_R);
    }
    return best;
  }

  /** Free distance (m) a disc of radius `margin` can travel along relative heading `rel`, from sensor hits. */
  freeAlong(rel: number, L: number, margin: number) {
    let free = L;
    const c = Math.cos(rel);
    const s = Math.sin(rel);
    for (const r of this.rays) {
      if (!r.hit) continue;
      const hx = Math.cos(r.a) * r.d;
      const hy = Math.sin(r.a) * r.d;
      const fwd = hx * c + hy * s;
      if (fwd <= 0 || fwd > L + margin) continue;
      const lat = Math.abs(-hx * s + hy * c);
      if (lat < margin) free = Math.min(free, Math.max(0, fwd - Math.sqrt(margin * margin - lat * lat)));
    }
    return free;
  }

  private updateMap() {
    if (!this.cfg.slam) return;
    const { x, y, th } = this.pose;
    for (const r of this.rays) {
      if (r.src !== "lidar" && r.src !== "lidar3d") continue;
      const ang = th + r.a;
      const steps = Math.floor(r.d / GRID);
      for (let s = 0; s < steps; s++) {
        const i = Math.floor((x + Math.cos(ang) * s * GRID) / GRID);
        const j = Math.floor((y + Math.sin(ang) * s * GRID) / GRID);
        if (i >= 0 && j >= 0 && i < this.gw && j < this.gh && this.known[j * this.gw + i] !== 2) this.known[j * this.gw + i] = 1;
      }
      if (r.hit) {
        const i = Math.floor((x + Math.cos(ang) * (r.d + 0.05)) / GRID);
        const j = Math.floor((y + Math.sin(ang) * (r.d + 0.05)) / GRID);
        if (i >= 0 && j >= 0 && i < this.gw && j < this.gh) this.known[j * this.gw + i] = 2;
      }
    }
  }

  /* ── Control loop ── */

  run() {
    if (this.status === "arrived" || this.status === "collided" || this.status === "lost") this.reset();
    if (this.status === "idle") {
      if (!this.cfg.canDrive)
        this.warnOnce("nodrive", `The robot cannot move: it needs ${this.cfg.driveMissing}.`, "error");
      else if (!this.cfg.drive && !this.manual)
        this.warnOnce("nodriveblock", "Autonomy is off: add the Differential Drive block. Manual Drive still works.", "warn");
      if (this.cfg.canDrive && !this.cfg.goal && !this.cfg.wall && !this.manual)
        this.warnOnce("nodecision", "No decision block. Use Manual Drive, or add Go to Goal or Wall Follow.", "warn");
      if (this.cfg.gps && this.env.gpsIndoor) this.warnOnce("gps", "GPS: no satellite fix indoors. Position unavailable.", "warn");
      if (this.cfg.goal && !this.est) this.warnOnce("nopose", "Go to Goal has no pose source. Add Wheel Encoders.", "error");
      if (this.cfg.goal && !this.cfg.localized && this.est)
        this.warnOnce(
          "drift",
          this.cfg.odom && !this.cfg.imu
            ? "Encoders only: straight lines are accurate, but every turn adds heading error. An IMU fixes turns."
            : !this.cfg.odom
              ? "IMU only: heading is accurate, but distance is guessed. Wheel Encoders fix distance."
              : "Dead reckoning: small errors add up with no map. A LiDAR and SLAM correct them.",
          "warn",
        );
      if (this.cfg.slam === "2d")
        this.warnOnce("plane", `2D SLAM maps only the ${LIDAR_Z} m scan plane. Lower or higher objects are missing from the map.`, "info");
      if (this.cfg.goal && !this.cfg.planner && this.cfg.canDrive)
        this.warnOnce("noplan", "No Path Planner: the robot heads straight for the goal and can get trapped.", "info");
      this.log(this.manual ? "Simulation running (manual drive)." : "Simulation running.", "ok");
    }
    this.status = "running";
  }

  pause() {
    if (this.status === "running") {
      this.status = "paused";
      this.log("Paused.");
    } else if (this.status === "paused") this.run();
  }

  stop() {
    this.manual = null;
    this.manualSource = null;
    this.v = 0;
    this.w = 0;
    if (this.status === "running") this.status = "paused";
    this.log("Stop command received.");
  }

  step(dt: number) {
    if (this.status !== "running") {
      this.sense();
      return;
    }
    this.t += dt;
    this.advanceMovers(dt);
    this.sense();
    if (this.replanAt && this.t >= this.replanAt) {
      this.replanAt = 0;
      if (this.cfg.planner) this.plan();
    }
    if (++this.mapTick % 4 === 0) this.updateMap();

    const cfg = this.cfg;
    let v = 0;
    let w = 0;
    this.estopActive = false;

    if (this.manual) {
      if (!cfg.canDrive) this.warnOnce("nodrive", `The robot cannot move: it needs ${cfg.driveMissing}.`, "error");
      v = this.manual.v;
      w = this.manual.w;
    } else if (cfg.goal && this.est) {
      const est = this.est;
      let tx = this.goal.x;
      let ty = this.goal.y;
      if (cfg.planner && this.path.length) {
        const look = this.lookahead(est, 0.6);
        tx = look.x;
        ty = look.y;
      }
      const dGoal = Math.hypot(this.goal.x - est.x, this.goal.y - est.y);
      if (dGoal < cfg.goal.tol) {
        this.finish();
        return;
      }
      let ang = wrap(Math.atan2(ty - est.y, tx - est.x) - est.th);
      // Hysteresis near ±180° so the robot commits to one turn direction.
      if (Math.abs(ang) > 2.6) {
        if (!this.turnSign) this.turnSign = Math.sign(ang) || 1;
        ang = this.turnSign * Math.abs(ang);
      } else this.turnSign = 0;
      const maxV = cfg.drive?.maxV ?? 0.6;
      const slow = clamp(dGoal / 0.8, 0.3, 1);

      if (cfg.avoid) {
        // Local planner: steer along the clear heading closest to the target direction.
        const safe = cfg.avoid.safe;
        const margin = ROBOT_R + 0.1;
        const dTarget = Math.hypot(tx - est.x, ty - est.y);
        const look = safe + 0.4;
        const pref = this.avoidDir || 1;
        let best: number | null = null;
        for (let k = 0; k <= 18 && best === null; k++) {
          for (const sgn of k ? [pref, -pref] : [1]) {
            const rel = wrap(ang + sgn * k * 0.17);
            const need = k === 0 ? Math.min(look, dTarget) : look;
            if (this.freeAlong(rel, look, margin) >= need - 1e-6) {
              best = rel;
              break;
            }
          }
        }
        if (best === null) {
          // Boxed in: rotate towards whichever direction is most open.
          let bestFree = -1;
          for (let k = 0; k < 36; k++) {
            const rel = -Math.PI + (k / 36) * Math.PI * 2;
            const f = this.freeAlong(rel, look, margin);
            if (f > bestFree) {
              bestFree = f;
              best = rel;
            }
          }
        }
        const chosen = best ?? ang;
        const dev = wrap(chosen - ang);
        this.avoidDir = Math.abs(dev) > 0.05 ? Math.sign(dev) : 0;
        const frontFree = this.freeAlong(0, look, margin);
        v = maxV * slow * Math.max(0, Math.cos(chosen)) ** 2 * clamp((frontFree - 0.05) / safe, 0, 1);
        w = 2.2 * chosen;
      } else {
        v = maxV * slow * Math.max(0, Math.cos(ang)) ** 2;
        w = 2.2 * ang;
      }
    } else if (cfg.wall) {
      const maxV = cfg.drive?.maxV ?? 0.6;
      const right = this.sector(0.6, 2.2);
      const front = this.sector(-0.45, 0.45);
      v = maxV * 0.7;
      w = right === Infinity ? 0.6 : clamp((right - cfg.wall.dist) * 2.2, -1.2, 1.2);
      if (front < cfg.wall.dist + 0.2) {
        v *= 0.3;
        w = -1.4;
      }
      if (cfg.avoid) {
        const front2 = this.sector(-0.55, 0.55);
        if (front2 < cfg.avoid.safe) v *= clamp((front2 - 0.12) / (cfg.avoid.safe - 0.12), 0, 1);
      }
    }

    if (cfg.estop) {
      const front = this.sector(-0.7, 0.7);
      if (front < cfg.estop.dist || (cfg.bumper && this.bumperHit)) {
        if (v > 0) {
          if (!this.estopActive) this.estopCount++;
          v = 0;
        }
        this.estopActive = true;
      }
    }

    if (!cfg.canDrive) {
      v = 0;
      w = 0;
    } else if (this.manual) {
      v = clamp(v, -0.8, 0.8) * cfg.speedScale;
      w = clamp(w, -2, 2);
    } else if (!cfg.drive) {
      v = 0;
      w = 0;
    } else {
      v = clamp(v, -cfg.drive.maxV, cfg.drive.maxV) * cfg.speedScale;
      w = clamp(w, -cfg.drive.maxW, cfg.drive.maxW);
    }
    if (cfg.smooth) {
      const dv = cfg.smooth.acc * dt;
      v = clamp(v, this.v - dv, this.v + dv);
      w = clamp(w, this.w - dv * 3, this.w + dv * 3);
    }
    this.v = v;
    this.w = w;

    // Integrate true pose (unicycle model).
    const p = this.pose;
    const nth = wrap(p.th + w * dt);
    const nx = p.x + v * Math.cos(p.th) * dt;
    const ny = p.y + v * Math.sin(p.th) * dt;
    this.distance += Math.abs(v * dt);
    p.x = nx;
    p.y = ny;
    p.th = nth;

    // Pose estimate.
    if (this.est) {
      if (cfg.localized) {
        this.est = { ...p };
      } else {
        const e = this.est;
        // Encoders measure distance well but turns slip; an IMU measures rotation well but not distance.
        const headErr = cfg.imu ? 0.004 : 0.09;
        const distErr = cfg.odom ? 1.01 : 1.12;
        const walk = cfg.odom ? 0 : (Math.random() - 0.5) * 0.02 * Math.abs(v) * dt;
        e.th = wrap(e.th + w * dt * (1 + headErr));
        e.x += v * dt * Math.cos(e.th) * distErr + walk;
        e.y += v * dt * Math.sin(e.th) * distErr - walk;
      }
    }

    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(last.x - p.x, last.y - p.y) > 0.08) this.trail.push({ x: p.x, y: p.y });
    if (this.trail.length > 2000) this.trail.shift();

    const clear = this.clearance(p.x, p.y) - ROBOT_R;
    this.minClearance = Math.min(this.minClearance, clear);
    if (clear <= 0) {
      this.status = "collided";
      this.v = this.w = 0;
      this.log(`Collision at (${p.x.toFixed(2)}, ${p.y.toFixed(2)}). Run ended.`, "error");
      const hit = this.nearestObstacle(p.x, p.y);
      if (hit.o && hit.d <= ROBOT_R + 0.02) {
        const [lo, hi] = zRange(hit.o);
        const seenBy = (["lidar", "lidar3d", "depth", "range"] as const).filter(
          (src) => this.rays.some((r) => r.src === src) && overlaps([lo, hi], BANDS[src]),
        );
        const what = hit.o.style === "conveyor" ? "an overhead conveyor" : hit.o.style === "jack" ? "a low pallet jack" : `a ${hit.o.style}`;
        if (!this.rays.length) {
          this.log(`The robot hit ${what}. It has no range sensors, so it drives blind. Add a LiDAR, ultrasonic or depth camera.`, "warn");
        } else if (!seenBy.length) {
          const why =
            this.cfg.scan && !overlaps([lo, hi], BANDS.lidar)
              ? `It spans ${lo.toFixed(2)} to ${hi.toFixed(2)} m, ${hi < LIDAR_Z ? "below" : "above"} the 2D LiDAR plane at ${LIDAR_Z} m.`
              : "None of the subscribed sensors could see it.";
          this.log(`The robot hit ${what} it could not see. ${why} Add a Depth Camera or 3D LiDAR.`, "warn");
        } else if (!this.cfg.avoid) {
          this.log(`Your sensors saw ${what}, but no Obstacle Avoidance block reacted to it.`, "warn");
        }
      }
      return;
    }

    // Truth check: robot near goal even if it does not know it.
    if (!this.manual && Math.hypot(this.goal.x - p.x, this.goal.y - p.y) < 0.3 && cfg.goal) {
      this.finish();
      return;
    }

    if (this.t - this.stuckRef.t > 7) {
      const moved = Math.hypot(p.x - this.stuckRef.x, p.y - this.stuckRef.y);
      if (moved < 0.3 && this.t - this.lastStuckWarn > 14 && (cfg.goal || cfg.wall)) {
        const drift = this.est ? Math.hypot(this.est.x - p.x, this.est.y - p.y) : 0;
        this.log(
          drift > 0.4
            ? `Pose estimate has drifted ${drift.toFixed(2)} m from reality, so the robot follows its path in the wrong place. Unlock Localization (Encoders + IMU + LiDAR).`
            : cfg.planner
              ? "Robot is not making progress. Try a smaller safe distance or a larger planner margin."
              : "Robot is trapped. Reactive control alone cannot escape dead ends: add the Path Planner block.",
          "warn",
        );
        this.lastStuckWarn = this.t;
      }
      this.stuckRef = { x: p.x, y: p.y, t: this.t };
    }
  }

  private finish() {
    const p = this.pose;
    const err = Math.hypot(this.goal.x - p.x, this.goal.y - p.y);
    this.v = this.w = 0;
    if (err < Math.max(0.6, (this.cfg.goal?.tol ?? 0.35) + 0.2)) {
      this.status = "arrived";
      this.log(`Goal reached in ${this.t.toFixed(1)} s. Position error ${err.toFixed(2)} m.`, "ok");
    } else {
      this.status = "lost";
      this.log(`Robot believes it arrived, but is ${err.toFixed(2)} m away. Odometry drift: add Localization.`, "error");
    }
  }

  private lookahead(e: { x: number; y: number }, L: number) {
    const path = this.path;
    let best = this.pathIdx;
    let bestD = Infinity;
    for (let k = this.pathIdx; k < Math.min(path.length, this.pathIdx + 40); k++) {
      const d = Math.hypot(path[k].x - e.x, path[k].y - e.y);
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    this.pathIdx = best;
    for (let k = best; k < path.length; k++) if (Math.hypot(path[k].x - e.x, path[k].y - e.y) >= L) return path[k];
    return path[path.length - 1];
  }

  hasHardware(id: Parameters<typeof has>[1]) {
    return has(this.build, id);
  }
}

/* ── Geometry helpers ── */

function distTo(o: Obstacle, x: number, y: number) {
  if (o.kind === "circle") return Math.hypot(x - o.x, y - o.y) - o.r;
  const cx = clamp(x, o.x, o.x + o.w);
  const cy = clamp(y, o.y, o.y + o.h);
  const inside = x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h;
  return inside ? -1 : Math.hypot(x - cx, y - cy);
}

function rayRect(ox: number, oy: number, dx: number, dy: number, x: number, y: number, w: number, h: number) {
  let tmin = -Infinity;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < x || ox > x + w) return Infinity;
  } else {
    const t1 = (x - ox) / dx;
    const t2 = (x + w - ox) / dx;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < y || oy > y + h) return Infinity;
  } else {
    const t1 = (y - oy) / dy;
    const t2 = (y + h - oy) / dy;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));
  }
  if (tmax < Math.max(tmin, 0)) return Infinity;
  return tmin >= 0 ? tmin : Infinity;
}

function rayCircle(ox: number, oy: number, dx: number, dy: number, cx: number, cy: number, r: number) {
  const fx = ox - cx;
  const fy = oy - cy;
  const b = fx * dx + fy * dy;
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - c;
  if (disc < 0) return Infinity;
  const t = -b - Math.sqrt(disc);
  return t >= 0 ? t : Infinity;
}

function overlaps(a: readonly [number, number], b: readonly [number, number]) {
  return a[0] <= b[1] && b[0] <= a[1];
}

/** Anything whose underside is below the robot's top is something it can crash into. */
function collidable(o: Obstacle) {
  return zRange(o)[0] < ROBOT_H;
}
