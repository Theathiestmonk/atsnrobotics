import type { EnvId } from "./catalog";

// All coordinates in metres. World origin top-left, +x right, +y down (screen convention),
// heading θ measured from +x towards +y.

export type ObstacleStyle = "wall" | "rack" | "pallet" | "bed" | "counter" | "table" | "pillar" | "cart" | "jack" | "conveyor";

export type Obstacle =
  | { kind: "rect"; x: number; y: number; w: number; h: number; z: number; zmin?: number; style: ObstacleStyle }
  | { kind: "circle"; x: number; y: number; r: number; z: number; zmin?: number; style: ObstacleStyle };

/** Vertical extent (m) of an obstacle: [bottom, top]. */
export const zRange = (o: Obstacle): [number, number] => [o.zmin ?? 0, o.z];

export interface Mover {
  r: number;
  a: [number, number];
  b: [number, number];
  speed: number; // m/s
  style: "forklift" | "person";
  phase?: number; // 0..1 starting offset
}

export interface EnvDef {
  id: EnvId;
  name: string;
  blurb: string;
  w: number;
  h: number;
  start: { x: number; y: number; th: number };
  goal: { x: number; y: number };
  obstacles: Obstacle[];
  movers: Mover[];
  gpsIndoor: true;
}

const W = 20;
const H = 12;
const T = 0.2;

const border = (): Obstacle[] => [
  { kind: "rect", x: 0, y: 0, w: W, h: T, z: 1.2, style: "wall" },
  { kind: "rect", x: 0, y: H - T, w: W, h: T, z: 1.2, style: "wall" },
  { kind: "rect", x: 0, y: 0, w: T, h: H, z: 1.2, style: "wall" },
  { kind: "rect", x: W - T, y: 0, w: T, h: H, z: 1.2, style: "wall" },
];

const r = (x: number, y: number, w: number, h: number, style: ObstacleStyle, z = 1): Obstacle => ({
  kind: "rect",
  x,
  y,
  w,
  h,
  z,
  style,
});
const c = (x: number, y: number, rad: number, style: ObstacleStyle, z = 0.75): Obstacle => ({
  kind: "circle",
  x,
  y,
  r: rad,
  z,
  style,
});

export const ENVIRONMENTS: Record<EnvId, EnvDef> = {
  warehouse: {
    id: "warehouse",
    name: "Warehouse",
    blurb: "Three racks, wide aisles. A low pallet jack and an overhead conveyor.",
    w: W,
    h: H,
    start: { x: 2.2, y: 2.2, th: Math.PI / 2 },
    goal: { x: 18, y: 2.2 },
    obstacles: [
      ...border(),
      // Three racks forming a wide serpentine: every aisle is about 4 m.
      r(5, T, 1, 7.4, "rack", 2.2),
      r(10, 4.4, 1, H - 4.4 - T, "rack", 2.2),
      r(15, T, 1, 7.4, "rack", 2.2),
      // Below the 2D LiDAR plane (0.38 m): a low pallet jack at the first turn.
      r(4.6, 8.0, 1.8, 0.6, "jack", 0.18),
      // Above the 2D LiDAR plane: an overhead conveyor hanging at 0.44 m in the last aisle.
      { kind: "rect", x: 16, y: 4.8, w: 2.4, h: 0.6, z: 0.64, zmin: 0.44, style: "conveyor" },
    ],
    movers: [],
    gpsIndoor: true,
  },
  hospital: {
    id: "hospital",
    name: "Hospital Ward",
    blurb: "Patient rooms off a busy corridor with moving staff.",
    w: W,
    h: H,
    start: { x: 2.2, y: 10.2, th: -Math.PI / 2 },
    goal: { x: 17.5, y: 2.2 },
    obstacles: [
      ...border(),
      r(T, 4.6, 2.8, T, "wall", 1.2),
      r(4.6, 4.6, 10.6, T, "wall", 1.2),
      r(16.8, 4.6, 3.0, T, "wall", 1.2),
      r(T, 7.4, 1.2, T, "wall", 1.2),
      r(3.0, 7.4, 8.6, T, "wall", 1.2),
      r(13.2, 7.4, 6.6, T, "wall", 1.2),
      r(6, T, T, 4.4, "wall", 1.2),
      r(12, T, T, 4.4, "wall", 1.2),
      r(8, 7.6, T, 4.2, "wall", 1.2),
      r(15, 7.6, T, 4.2, "wall", 1.2),
      r(0.8, 0.8, 2.2, 1.1, "bed", 0.6),
      r(8, 0.8, 2.2, 1.1, "bed", 0.6),
      r(13, 0.8, 2.2, 1.1, "bed", 0.6),
      r(4.6, 10.2, 2.2, 1.1, "bed", 0.6),
      r(10, 10.2, 2.2, 1.1, "bed", 0.6),
      r(16.6, 10.2, 2.2, 1.1, "bed", 0.6),
      r(8.6, 4.85, 1.2, 0.55, "cart", 0.9),
    ],
    movers: [
      { r: 0.28, a: [4, 5.7], b: [17.5, 5.7], speed: 0.7, style: "person" },
      { r: 0.28, a: [18, 6.6], b: [3.5, 6.6], speed: 0.55, style: "person", phase: 0.4 },
    ],
    gpsIndoor: true,
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant Floor",
    blurb: "Tables, a pillar and waiters crossing the floor.",
    w: W,
    h: H,
    start: { x: 1.8, y: 1.8, th: 0 },
    goal: { x: 17.4, y: 8.6 },
    obstacles: [
      ...border(),
      r(T, 3.6, 4.4, 0.5, "counter", 1.05),
      r(4.6, T, 0.3, 1.8, "wall", 1.2),
      c(8, 2.6, 0.65, "table"),
      c(12, 2.6, 0.65, "table"),
      c(16, 2.6, 0.65, "table"),
      c(6.5, 6.4, 0.65, "table"),
      c(10.5, 6.4, 0.65, "table"),
      c(14.5, 6.4, 0.65, "table"),
      c(8, 10, 0.65, "table"),
      c(12, 10, 0.65, "table"),
      c(17.6, 10.4, 0.65, "table"),
      c(3.6, 9, 0.35, "pillar", 2.4),
    ],
    movers: [
      { r: 0.28, a: [6, 4.4], b: [18.4, 4.4], speed: 0.6, style: "person" },
      { r: 0.28, a: [16.2, 8.2], b: [16.2, 11.2], speed: 0.4, style: "person", phase: 0.5 },
      { r: 0.28, a: [10, 8.3], b: [3, 8.3], speed: 0.5, style: "person", phase: 0.2 },
    ],
    gpsIndoor: true,
  },
};

export const ENV_LIST = Object.values(ENVIRONMENTS);

export function moverPos(m: Mover, t: number): { x: number; y: number } {
  const len = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]);
  const period = (2 * len) / m.speed;
  let u = ((t / period + (m.phase ?? 0)) % 1 + 1) % 1;
  u = u < 0.5 ? u * 2 : 2 - u * 2; // ping-pong
  return { x: m.a[0] + (m.b[0] - m.a[0]) * u, y: m.a[1] + (m.b[1] - m.a[1]) * u };
}
