// Robotics Lab: hardware catalog, mount slots, capabilities and missions.
// Everything here is plain data + pure functions so Workshop and Lab share one source of truth.

export type Category = "sensors" | "compute" | "actuators" | "power" | "structure";

export type SlotId =
  | "mast"
  | "gnss"
  | "imu"
  | "compute"
  | "power"
  | "payload"
  | "gripper"
  | "camL"
  | "camR"
  | "usL"
  | "usR"
  | "bumper"
  | "drive"
  | "encoder";

export type ComponentId =
  | "lidar"
  | "lidar3d"
  | "depth"
  | "rgb"
  | "imu"
  | "encoder"
  | "gps"
  | "ultrasonic"
  | "motors"
  | "arm"
  | "gripper"
  | "rpi"
  | "jetson"
  | "esp32"
  | "arduino"
  | "battery24"
  | "battery48"
  | "bumper"
  | "tray";

export interface ComponentDef {
  id: ComponentId;
  name: string;
  short: string;
  category: Category;
  spec: string;
  blurb: string;
  weight: number; // kg
  power: number; // W draw
  computeLoad: number; // TOPS consumed by its driver pipeline
  computeProvide?: number; // TOPS provided (compute boards)
  powerProvide?: number; // W supplied (batteries)
  controller?: "sbc" | "mcu"; // single-board computer (runs Linux, SLAM, vision) or microcontroller (motors + simple sensors)
  needsSbc?: boolean; // sensor data only usable on a Raspberry Pi or Jetson
  slots: SlotId[]; // any of these slots can host it
  topic?: string; // ROS-style topic it publishes, used in the Lab
}

export const COMPONENTS: ComponentDef[] = [
  {
    id: "lidar",
    name: "LiDAR (2D)",
    short: "LiDAR",
    category: "sensors",
    spec: "12 m · 360°",
    blurb: "Spinning laser rangefinder that sweeps one flat plane at 0.38 m. Enables SLAM, but anything lower or higher than that plane is invisible to it.",
    weight: 0.6,
    power: 8,
    computeLoad: 1,
    needsSbc: true,
    slots: ["mast"],
    topic: "/scan",
  },
  {
    id: "lidar3d",
    name: "3D LiDAR",
    short: "3D LiDAR",
    category: "sensors",
    spec: "32 ch · 360° × 40°",
    blurb: "Multi-beam laser scanner that sees a full 3D point cloud. Enables 3D SLAM and navigation around overhangs and low objects.",
    weight: 0.9,
    power: 12,
    computeLoad: 2,
    needsSbc: true,
    slots: ["mast"],
    topic: "/points",
  },
  {
    id: "depth",
    name: "Depth Camera",
    short: "Depth Cam",
    category: "sensors",
    spec: "RGB-D · 87°",
    blurb: "Stereo camera that measures depth for every pixel. Detects obstacles at any height in front of the robot, including ones a 2D LiDAR misses.",
    weight: 0.3,
    power: 4,
    computeLoad: 3,
    needsSbc: true,
    slots: ["camR"],
    topic: "/depth",
  },
  {
    id: "rgb",
    name: "RGB Camera",
    short: "RGB Cam",
    category: "sensors",
    spec: "1080p · 120°",
    blurb: "Wide-angle colour camera. Paired with an AI board it recognises objects, people and markers.",
    weight: 0.15,
    power: 2,
    computeLoad: 2,
    needsSbc: true,
    slots: ["camL"],
    topic: "/image",
  },
  {
    id: "imu",
    name: "IMU",
    short: "IMU",
    category: "sensors",
    spec: "Accel · Gyro · Mag",
    blurb: "Inertial measurement unit. Tracks rotation precisely, so turns and curves stay accurate instead of drifting.",
    weight: 0.05,
    power: 0.5,
    computeLoad: 0,
    slots: ["imu"],
    topic: "/imu",
  },
  {
    id: "encoder",
    name: "Wheel Encoders",
    short: "Encoders",
    category: "sensors",
    spec: "4096 CPR · pair",
    blurb: "Count every wheel revolution, so the robot knows how far it has travelled. Accurate in straight lines; turns drift as wheels slip.",
    weight: 0.1,
    power: 0.5,
    computeLoad: 0,
    slots: ["encoder"],
    topic: "/odom",
  },
  {
    id: "gps",
    name: "GPS (GNSS)",
    short: "GPS",
    category: "sensors",
    spec: "Outdoor · ±1 m",
    blurb: "Satellite positioning. Precise outdoors, but signals rarely reach inside buildings.",
    weight: 0.2,
    power: 1.5,
    computeLoad: 0,
    slots: ["gnss"],
    topic: "/gps",
  },
  {
    id: "ultrasonic",
    name: "Ultrasonic",
    short: "Ultrasonic",
    category: "sensors",
    spec: "0.2 to 4 m · 30°",
    blurb: "Sound-based range sensor with a narrow forward cone. Install two for left and right coverage.",
    weight: 0.05,
    power: 0.3,
    computeLoad: 0,
    slots: ["usL", "usR"],
    topic: "/range",
  },
  {
    id: "bumper",
    name: "Safety Bumper",
    short: "Bumper",
    category: "structure",
    spec: "Contact switch · front",
    blurb: "Pressure-sensitive front bumper. The final line of defence that halts the robot on contact.",
    weight: 0.4,
    power: 0.2,
    computeLoad: 0,
    slots: ["bumper"],
    topic: "/bumper",
  },
  {
    id: "motors",
    name: "Drive Motors",
    short: "Motors",
    category: "actuators",
    spec: "BLDC hub · 2 × 150 W",
    blurb: "A pair of brushless hub motors. Differential drive: spin them at different speeds to steer. They need a controller and a battery to turn.",
    weight: 2.4,
    power: 20,
    computeLoad: 0,
    slots: ["drive"],
    topic: "/cmd_vel",
  },
  {
    id: "arm",
    name: "Robotic Arm",
    short: "Arm",
    category: "actuators",
    spec: "4-DOF · 1 m reach",
    blurb: "Four-joint manipulator mounted on the deck. Add a gripper to pick and place objects.",
    weight: 3.5,
    power: 18,
    computeLoad: 2,
    slots: ["payload"],
  },
  {
    id: "gripper",
    name: "Gripper",
    short: "Gripper",
    category: "actuators",
    spec: "1 kg payload",
    blurb: "Parallel-jaw end effector. Mounts on the tip of the robotic arm.",
    weight: 0.6,
    power: 6,
    computeLoad: 0.5,
    slots: ["gripper"],
  },
  {
    id: "rpi",
    name: "Raspberry Pi 5",
    short: "RPi 5",
    category: "compute",
    spec: "Quad-core · 8 GB",
    blurb: "Single-board Linux computer. Runs LiDAR SLAM, depth processing and navigation for a lean robot.",
    weight: 0.1,
    power: 8,
    computeLoad: 0,
    computeProvide: 10,
    controller: "sbc",
    slots: ["compute"],
  },
  {
    id: "jetson",
    name: "Jetson Orin Nano",
    short: "Jetson",
    category: "compute",
    spec: "AI · 40 TOPS",
    blurb: "GPU-accelerated AI computer. Required for real-time neural vision such as object detection.",
    weight: 0.25,
    power: 15,
    computeLoad: 0,
    computeProvide: 40,
    controller: "sbc",
    slots: ["compute"],
  },
  {
    id: "esp32",
    name: "ESP32",
    short: "ESP32",
    category: "compute",
    spec: "Microcontroller · Wi-Fi",
    blurb: "Wireless microcontroller. Drives motors and reads encoders, IMU and ultrasonic sensors, and takes teleop commands over Wi-Fi. Too small for SLAM or cameras.",
    weight: 0.02,
    power: 0.8,
    computeLoad: 0,
    computeProvide: 0,
    controller: "mcu",
    slots: ["compute"],
  },
  {
    id: "arduino",
    name: "Arduino",
    short: "Arduino",
    category: "compute",
    spec: "Microcontroller · 16 MHz",
    blurb: "Classic microcontroller board. Controls motors and reads simple sensors in real time. Cannot process LiDAR or camera data.",
    weight: 0.03,
    power: 0.5,
    computeLoad: 0,
    computeProvide: 0,
    controller: "mcu",
    slots: ["compute"],
  },
  {
    id: "battery24",
    name: "Battery 24 V",
    short: "24 V Pack",
    category: "power",
    spec: "10 Ah · 240 Wh",
    blurb: "Lithium pack rated for 60 W continuous. Enough for a lean sensing robot.",
    weight: 2.2,
    power: 0,
    computeLoad: 0,
    powerProvide: 60,
    slots: ["power"],
  },
  {
    id: "battery48",
    name: "Battery 48 V",
    short: "48 V Pack",
    category: "power",
    spec: "20 Ah · 960 Wh",
    blurb: "High-capacity pack rated for 140 W continuous. Powers AI compute and manipulators.",
    weight: 4.8,
    power: 0,
    computeLoad: 0,
    powerProvide: 140,
    slots: ["power"],
  },
  {
    id: "tray",
    name: "Cargo Tray",
    short: "Tray",
    category: "structure",
    spec: "Deck mount · 10 kg",
    blurb: "Machined cargo tray for deliveries. Shares the deck mount with the robotic arm.",
    weight: 1.2,
    power: 0,
    computeLoad: 0,
    slots: ["payload"],
  },
];

export const COMPONENT_MAP: Record<ComponentId, ComponentDef> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c]),
) as Record<ComponentId, ComponentDef>;

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sensors", label: "Sensors" },
  { id: "compute", label: "Compute" },
  { id: "actuators", label: "Actuators" },
  { id: "power", label: "Power" },
  { id: "structure", label: "Structure" },
];

/* ── Chassis + mount slots ───────────────────────────────────────────── */

export const CHASSIS = {
  name: "Differential Drive",
  size: "0.60 × 0.50 × 0.30 m",
  weight: 9,
  maxWeight: 25,
  basePower: 4,
};

// Deck coordinate space: 220 (x, left → right) × 300 (y, back → front).
// The long sides carry the drive wheels; the robot drives along its length.
export const DECK_W = 220;
export const DECK_D = 300;

export interface SlotDef {
  id: SlotId;
  label: string;
  x: number;
  y: number;
  w: number;
  d: number;
  onDeck: boolean; // false = wheels / front face, drawn differently
}

export const SLOTS: SlotDef[] = [
  { id: "imu", label: "IMU bay", x: 52, y: 40, w: 40, d: 34, onDeck: true },
  { id: "gnss", label: "Antenna mount", x: 172, y: 40, w: 40, d: 40, onDeck: true },
  { id: "mast", label: "Sensor mast", x: 110, y: 106, w: 62, d: 62, onDeck: true },
  { id: "compute", label: "Compute bay", x: 55, y: 172, w: 70, d: 50, onDeck: true },
  { id: "power", label: "Power bay", x: 55, y: 238, w: 70, d: 50, onDeck: true },
  { id: "payload", label: "Deck mount", x: 158, y: 206, w: 70, d: 72, onDeck: true },
  { id: "gripper", label: "Arm tool flange", x: 158, y: 206, w: 30, d: 30, onDeck: true },
  { id: "camL", label: "Front camera L", x: 80, y: 282, w: 44, d: 26, onDeck: true },
  { id: "camR", label: "Front camera R", x: 140, y: 282, w: 56, d: 26, onDeck: true },
  { id: "usL", label: "Ultrasonic L", x: 30, y: 286, w: 30, d: 22, onDeck: true },
  { id: "usR", label: "Ultrasonic R", x: 190, y: 286, w: 30, d: 22, onDeck: true },
  { id: "bumper", label: "Front bumper", x: 110, y: 300, w: 220, d: 10, onDeck: false },
  { id: "drive", label: "Wheel hubs", x: 110, y: 150, w: 0, d: 0, onDeck: false },
  { id: "encoder", label: "Wheel axles", x: 110, y: 150, w: 0, d: 0, onDeck: false },
];

export const SLOT_MAP: Record<SlotId, SlotDef> = Object.fromEntries(SLOTS.map((s) => [s.id, s])) as Record<
  SlotId,
  SlotDef
>;

export type Build = Partial<Record<SlotId, ComponentId>>;

export function buildComponents(build: Build): ComponentDef[] {
  return (Object.values(build).filter(Boolean) as ComponentId[]).map((id) => COMPONENT_MAP[id]);
}

export function has(build: Build, id: ComponentId): boolean {
  return Object.values(build).includes(id);
}

export function countOf(build: Build, id: ComponentId): number {
  return Object.values(build).filter((v) => v === id).length;
}

/* ── Capabilities ────────────────────────────────────────────────────── */

export type CapId =
  | "mobility"
  | "odometry"
  | "heading"
  | "mapping"
  | "obstacle"
  | "mapping3d"
  | "navigation"
  | "objects"
  | "manipulation"
  | "delivery";

export interface CapDef {
  id: CapId;
  name: string;
  short: string;
  sub: string;
  overhead: number; // extra TOPS the software stack needs
  desc: string; // what it lets the robot do in the simulation
  limit: string; // what is still imprecise, which motivates the next upgrade
}

export const CAPS: CapDef[] = [
  {
    id: "mobility",
    name: "Teleop Drive",
    short: "Teleop",
    sub: "Drive by hand",
    overhead: 0,
    desc: "Drive the robot manually with the keyboard or pad.",
    limit: "No sense of position, so it cannot navigate on its own.",
  },
  {
    id: "odometry",
    name: "Odometry",
    short: "Odometry",
    sub: "Straight lines",
    overhead: 0,
    desc: "Go to Goal works: encoders measure distance travelled.",
    limit: "Turns drift as wheels slip. No map of the world.",
  },
  {
    id: "heading",
    name: "Heading (IMU)",
    short: "IMU Heading",
    sub: "Accurate turns",
    overhead: 0,
    desc: "Precise rotation tracking keeps curves and turns accurate.",
    limit: "Small errors still add up over long routes.",
  },
  {
    id: "mapping",
    name: "2D SLAM",
    short: "2D SLAM",
    sub: "Map + plan",
    overhead: 3,
    desc: "Builds a map, corrects drift and plans routes with A*.",
    limit: "Sees only the 0.38 m scan plane. Low or overhanging objects are invisible.",
  },
  {
    id: "obstacle",
    name: "Obstacle Detection",
    short: "Obstacles",
    sub: "Any height",
    overhead: 1,
    desc: "Depth vision detects obstacles at every height ahead.",
    limit: "Forward-facing only. The map still comes from the LiDAR plane.",
  },
  {
    id: "mapping3d",
    name: "3D SLAM & Nav",
    short: "3D SLAM",
    sub: "Full 3D world",
    overhead: 5,
    desc: "3D point-cloud map: plans around overhangs and low objects.",
    limit: "The complete navigation stack.",
  },
  {
    id: "navigation",
    name: "Autonomous Navigation",
    short: "Navigation",
    sub: "Plan to goal",
    overhead: 0,
    desc: "Plans and follows a route to any goal on the map.",
    limit: "Only as safe as the obstacles its sensors can see.",
  },
  {
    id: "objects",
    name: "Object Detection",
    short: "Objects",
    sub: "Recognise",
    overhead: 20,
    desc: "Neural vision recognises objects and people.",
    limit: "Needs an AI-class computer.",
  },
  {
    id: "manipulation",
    name: "Pick and Place",
    short: "Pick & Place",
    sub: "Manipulation",
    overhead: 3,
    desc: "Arm and gripper pick up recognised objects.",
    limit: "",
  },
  {
    id: "delivery",
    name: "Delivery",
    short: "Delivery",
    sub: "Carry cargo",
    overhead: 0,
    desc: "Carries cargo autonomously.",
    limit: "",
  },
];

export const CAP_MAP: Record<CapId, CapDef> = Object.fromEntries(CAPS.map((c) => [c.id, c])) as Record<CapId, CapDef>;

/** The progression ladder students climb, in order. */
export const CAP_TREE: CapId[] = ["mobility", "odometry", "heading", "mapping", "obstacle", "mapping3d"];

export interface CapStatus {
  id: CapId;
  unlocked: boolean;
  missing: string[]; // human-readable needs
  starved: boolean; // hardware is fine but compute is not
}

export interface Analysis {
  weight: number;
  powerDraw: number;
  powerSupply: number;
  computeLoad: number;
  computeSupply: number;
  caps: Record<CapId, CapStatus>;
  unlocked: Set<CapId>;
  issues: string[];
  controller: "sbc" | "mcu" | null;
  speedScale: number; // < 1 when underpowered or overloaded
}

export function analyze(build: Build): Analysis {
  const parts = buildComponents(build);
  const weight = CHASSIS.weight + parts.reduce((s, p) => s + p.weight, 0);
  const powerDraw = CHASSIS.basePower + parts.reduce((s, p) => s + p.power, 0);
  const powerSupply = parts.reduce((s, p) => s + (p.powerProvide ?? 0), 0);
  const computeSupply = parts.reduce((s, p) => s + (p.computeProvide ?? 0), 0);
  let computeLoad = parts.filter((p) => !p.needsSbc || parts.some((q) => q.controller === "sbc")).reduce((s, p) => s + p.computeLoad, 0);

  const h = (id: ComponentId) => has(build, id);
  const controller = parts.find((p) => p.controller)?.controller ?? null;
  const sbc = controller === "sbc";
  const caps = {} as Record<CapId, CapStatus>;
  const unlocked = new Set<CapId>();
  const SBC_LABEL = "a Raspberry Pi or Jetson (microcontrollers cannot run it)";

  const evalCap = (id: CapId, needs: [boolean, string][]) => {
    const missing = needs.filter(([ok]) => !ok).map(([, label]) => label);
    let ok = missing.length === 0;
    let starved = false;
    if (ok) {
      const over = CAP_MAP[id].overhead;
      if (over > 0 && computeLoad + over > computeSupply + 1e-9) {
        ok = false;
        starved = true;
        missing.push(`${over} TOPS of free compute`);
      } else computeLoad += over;
    }
    caps[id] = { id, unlocked: ok, missing, starved };
    if (ok) unlocked.add(id);
  };
  const u = (id: CapId) => unlocked.has(id);

  evalCap("mobility", [
    [h("motors"), "Drive Motors"],
    [!!controller, "a controller (Raspberry Pi, Jetson, ESP32 or Arduino)"],
    [h("battery24") || h("battery48"), "a Battery"],
  ]);
  evalCap("odometry", [
    [u("mobility"), "Teleop Drive"],
    [h("encoder"), "Wheel Encoders"],
  ]);
  evalCap("heading", [
    [!!controller, "a controller"],
    [h("imu"), "IMU"],
  ]);
  evalCap("mapping", [
    [h("lidar") || h("lidar3d"), "a LiDAR"],
    [sbc, SBC_LABEL],
    [h("encoder") || h("imu"), "Wheel Encoders or IMU"],
  ]);
  evalCap("obstacle", [
    [h("depth") || h("lidar3d"), "a Depth Camera (or 3D LiDAR)"],
    [sbc, SBC_LABEL],
  ]);
  evalCap("mapping3d", [
    [h("lidar3d"), "3D LiDAR"],
    [sbc, SBC_LABEL],
    [h("encoder") || h("imu"), "Wheel Encoders or IMU"],
  ]);
  evalCap("navigation", [
    [u("mobility"), "Teleop Drive"],
    [u("mapping") || u("mapping3d"), "2D or 3D SLAM"],
  ]);
  evalCap("objects", [
    [h("rgb") || h("depth"), "RGB or Depth Camera"],
    [sbc, SBC_LABEL],
  ]);
  evalCap("manipulation", [
    [h("arm"), "Robotic Arm"],
    [h("gripper"), "Gripper"],
    [u("objects"), "Object Detection"],
  ]);
  evalCap("delivery", [
    [h("tray"), "Cargo Tray"],
    [u("navigation"), "Autonomous Navigation"],
  ]);

  // Nothing here blocks the simulation: problems degrade performance instead.
  const issues: string[] = [];
  let speedScale = 1;
  if (weight > CHASSIS.maxWeight) {
    issues.push(`Overloaded (${weight.toFixed(1)} kg): the robot will move slower`);
    speedScale *= CHASSIS.maxWeight / weight;
  }
  if (powerSupply > 0 && powerDraw > powerSupply) {
    issues.push("Power draw exceeds battery output: expect reduced speed");
    speedScale *= powerSupply / powerDraw;
  }
  const orphan = parts.filter((p) => p.needsSbc && !sbc).map((p) => p.short);
  if (orphan.length) issues.push(`${orphan.join(", ")} ${orphan.length > 1 ? "need" : "needs"} a Raspberry Pi or Jetson (data is ignored)`);
  if (sbc && computeLoad > computeSupply) issues.push("Compute overloaded: some capabilities are switched off");

  return { weight, powerDraw, powerSupply, computeLoad, computeSupply, caps, unlocked, issues, controller, speedScale };
}

/* ── Missions ────────────────────────────────────────────────────────── */

export type EnvId = "warehouse" | "hospital" | "restaurant";

export interface MissionDef {
  id: string;
  code: string;
  title: string;
  brief: string;
  env: EnvId;
  level: number;
  tier: "Foundation" | "Intermediate" | "Advanced" | "Elite";
  requires: CapId[];
  reward: { xp: number };
  recommended: ComponentId[];
}

export const MISSIONS: MissionDef[] = [
  {
    id: "m1",
    code: "M1",
    title: "Warehouse Navigator",
    brief: "Cross the warehouse to the dispatch bay. Watch for a low pallet jack and an overhead conveyor.",
    env: "warehouse",
    level: 1,
    tier: "Foundation",
    requires: ["navigation", "obstacle"],
    reward: { xp: 600 },
    recommended: ["motors", "battery24", "rpi", "lidar", "encoder", "imu", "depth"],
  },
  {
    id: "m2",
    code: "M2",
    title: "Hospital Courier",
    brief: "Deliver medication across a busy hospital corridor. Staff are moving, so react in real time.",
    env: "hospital",
    level: 2,
    tier: "Intermediate",
    requires: ["navigation", "delivery"],
    reward: { xp: 900 },
    recommended: ["motors", "battery24", "rpi", "lidar", "encoder", "imu", "ultrasonic", "tray", "bumper"],
  },
  {
    id: "m3",
    code: "M3",
    title: "Restaurant Service",
    brief: "Weave between tables and waiters to serve the corner table, in the spirit of Argo Sonic.",
    env: "restaurant",
    level: 2,
    tier: "Intermediate",
    requires: ["navigation", "delivery"],
    reward: { xp: 900 },
    recommended: ["motors", "battery24", "rpi", "lidar", "encoder", "imu", "tray"],
  },
  {
    id: "m4",
    code: "M4",
    title: "Vision Inspector",
    brief: "Patrol the aisles and identify misplaced pallets with an onboard neural network.",
    env: "warehouse",
    level: 3,
    tier: "Advanced",
    requires: ["navigation", "objects"],
    reward: { xp: 1400 },
    recommended: ["motors", "battery48", "jetson", "lidar", "encoder", "imu", "rgb"],
  },
  {
    id: "m5",
    code: "M5",
    title: "Pick Station",
    brief: "Reach the picking station and transfer a parcel with the arm. The full autonomy stack.",
    env: "warehouse",
    level: 4,
    tier: "Elite",
    requires: ["navigation", "manipulation"],
    reward: { xp: 2000 },
    recommended: ["motors", "battery48", "jetson", "lidar", "encoder", "imu", "depth", "arm", "gripper"],
  },
];

export const MISSION_MAP: Record<string, MissionDef> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));

/** Place a component in its first free slot (or replace a single-slot occupant). */
export function placeComponent(
  build: Build,
  id: ComponentId,
): { build: Build; slot: SlotId; replaced?: ComponentId } | { error: string } {
  const def = COMPONENT_MAP[id];
  if (id === "gripper" && build.payload !== "arm") return { error: "Mount a Robotic Arm first. The gripper attaches to its tool flange." };
  const free = def.slots.find((s) => !build[s]);
  if (free) return { build: { ...build, [free]: id }, slot: free };
  if (def.slots.length === 1) {
    const slot = def.slots[0];
    const replaced = build[slot];
    if (replaced === id) return { error: `${def.name} is already installed.` };
    const next: Build = { ...build, [slot]: id };
    if (replaced === "arm") delete next.gripper;
    return { build: next, slot, replaced };
  }
  return { error: `All ${def.name} mounts are in use.` };
}

export function removeSlot(build: Build, slot: SlotId): Build {
  const next = { ...build };
  delete next[slot];
  if (slot === "payload") delete next.gripper;
  return next;
}

export const DEFAULT_BUILD: Build = {
  drive: "motors",
  power: "battery24",
  compute: "rpi",
  mast: "lidar",
  encoder: "encoder",
  imu: "imu",
};

export function levelFromXp(xp: number) {
  return Math.floor(xp / 1000) + 1;
}
