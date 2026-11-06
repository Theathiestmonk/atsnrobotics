import { analyze, CAP_MAP, COMPONENT_MAP, has, type Build, type CapId, type ComponentId } from "./catalog";

// Visual programming model: Inputs (topic subscriptions) → Decision layer → Actuators.

export type Lane = "input" | "decision" | "actuator";

export type BlockId =
  | "in_scan"
  | "in_points"
  | "in_depth"
  | "in_image"
  | "in_range"
  | "in_imu"
  | "in_odom"
  | "in_gps"
  | "in_bumper"
  | "dec_goal"
  | "dec_planner"
  | "dec_avoid"
  | "dec_estop"
  | "dec_wall"
  | "act_drive"
  | "act_smooth"
  | "act_gripper";

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
  unit: string;
}

export interface BlockDef {
  id: BlockId;
  lane: Lane;
  name: string;
  tag: string; // topic or short descriptor
  desc: string;
  component?: ComponentId; // hardware that must be installed
  cap?: CapId; // capability that must be unlocked
  capAny?: CapId[]; // at least one of these capabilities must be unlocked
  needsAny?: BlockId[]; // at least one of these must be present in the program
  needsLabel?: string;
  params?: ParamDef[];
}

export const BLOCKS: BlockDef[] = [
  { id: "in_scan", lane: "input", name: "LiDAR Scan", tag: "/scan", desc: "360° distance ring in one plane at 0.38 m.", component: "lidar" },
  { id: "in_points", lane: "input", name: "3D Point Cloud", tag: "/points", desc: "360° scan at every height.", component: "lidar3d" },
  { id: "in_depth", lane: "input", name: "Depth Image", tag: "/depth", desc: "Forward depth, 87° field of view.", component: "depth" },
  { id: "in_range", lane: "input", name: "Ultrasonic Range", tag: "/range", desc: "Short forward cones, up to 4 m.", component: "ultrasonic" },
  { id: "in_bumper", lane: "input", name: "Bumper Contact", tag: "/bumper", desc: "Fires on physical contact.", component: "bumper" },
  { id: "in_odom", lane: "input", name: "Wheel Odometry", tag: "/odom", desc: "Distance travelled from encoders.", component: "encoder" },
  { id: "in_imu", lane: "input", name: "IMU Orientation", tag: "/imu", desc: "Heading and turn rate.", component: "imu" },
  { id: "in_gps", lane: "input", name: "GPS Fix", tag: "/gps", desc: "Global position. Outdoors only.", component: "gps" },
  { id: "in_image", lane: "input", name: "Camera Image", tag: "/image", desc: "Colour frames for vision models.", component: "rgb" },

  {
    id: "dec_goal",
    lane: "decision",
    name: "Go to Goal",
    tag: "navigate",
    desc: "Steer towards the goal using the robot's pose estimate.",
    needsAny: ["in_odom", "in_imu", "in_gps"],
    needsLabel: "a pose source: /odom, /imu or /gps",
    params: [{ key: "tol", label: "Arrival tolerance", min: 0.2, max: 1, step: 0.05, def: 0.35, unit: "m" }],
  },
  {
    id: "dec_planner",
    lane: "decision",
    name: "Path Planner (A*)",
    tag: "plan",
    desc: "Plans a collision-free route on the SLAM map. Works with Go to Goal.",
    capAny: ["mapping", "mapping3d"],
    needsAny: ["in_scan", "in_points"],
    needsLabel: "/scan or /points for SLAM",
    params: [{ key: "inflate", label: "Safety margin", min: 0.05, max: 0.5, step: 0.05, def: 0.2, unit: "m" }],
  },
  {
    id: "dec_avoid",
    lane: "decision",
    name: "Obstacle Avoidance",
    tag: "react",
    desc: "Slows and steers away when something is close.",
    needsAny: ["in_scan", "in_points", "in_depth", "in_range"],
    needsLabel: "/scan, /points, /depth or /range",
    params: [{ key: "safe", label: "Safe distance", min: 0.4, max: 2, step: 0.1, def: 0.9, unit: "m" }],
  },
  {
    id: "dec_estop",
    lane: "decision",
    name: "Emergency Stop",
    tag: "safety",
    desc: "Hard stop if anything enters the stop zone. Always wins.",
    needsAny: ["in_scan", "in_points", "in_depth", "in_range", "in_bumper"],
    needsLabel: "a range sensor or /bumper",
    params: [{ key: "dist", label: "Stop distance", min: 0.1, max: 0.8, step: 0.05, def: 0.3, unit: "m" }],
  },
  {
    id: "dec_wall",
    lane: "decision",
    name: "Wall Follow",
    tag: "explore",
    desc: "Keeps a wall at a fixed distance. Used when there is no goal.",
    needsAny: ["in_scan", "in_points", "in_range"],
    needsLabel: "/scan, /points or /range",
    params: [{ key: "dist", label: "Wall distance", min: 0.4, max: 1.5, step: 0.1, def: 0.7, unit: "m" }],
  },

  {
    id: "act_drive",
    lane: "actuator",
    name: "Differential Drive",
    tag: "/cmd_vel",
    desc: "Turns linear and angular velocity into wheel speeds.",
    component: "motors",
    params: [
      { key: "maxV", label: "Max speed", min: 0.2, max: 1.5, step: 0.1, def: 0.6, unit: "m/s" },
      { key: "maxW", label: "Max turn rate", min: 0.5, max: 3, step: 0.1, def: 1.6, unit: "rad/s" },
    ],
  },
  {
    id: "act_smooth",
    lane: "actuator",
    name: "Velocity Smoother",
    tag: "ramp",
    desc: "Limits acceleration for smooth, safe motion.",
    needsAny: ["act_drive"],
    needsLabel: "the Differential Drive block",
    params: [{ key: "acc", label: "Max acceleration", min: 0.2, max: 3, step: 0.1, def: 0.8, unit: "m/s²" }],
  },
  {
    id: "act_gripper",
    lane: "actuator",
    name: "Gripper Control",
    tag: "/gripper",
    desc: "Open and close the gripper. Manipulation missions arrive soon.",
    component: "gripper",
  },
];

export const BLOCK_MAP: Record<BlockId, BlockDef> = Object.fromEntries(BLOCKS.map((b) => [b.id, b])) as Record<
  BlockId,
  BlockDef
>;

export interface PlacedBlock {
  uid: string;
  id: BlockId;
  params: Record<string, number>;
}

export type Program = Record<Lane, PlacedBlock[]>;

export const EMPTY_PROGRAM: Program = { input: [], decision: [], actuator: [] };

let uidSeq = 0;
export function makeBlock(id: BlockId): PlacedBlock {
  const params: Record<string, number> = {};
  BLOCK_MAP[id].params?.forEach((p) => (params[p.key] = p.def));
  return { uid: `${id}-${Date.now().toString(36)}-${uidSeq++}`, id, params };
}

/** Can this block be used at all with the current hardware? */
export function availability(id: BlockId, build: Build): { ok: boolean; reason?: string } {
  const b = BLOCK_MAP[id];
  const an = analyze(build);
  if (b.component && !has(build, b.component)) return { ok: false, reason: "Install it in the Workshop first" };
  if (b.lane === "input" && !an.controller) return { ok: false, reason: "Needs a controller to read the sensor" };
  if (b.component && COMPONENT_MAP[b.component].needsSbc && an.controller !== "sbc")
    return { ok: false, reason: "Needs a Raspberry Pi or Jetson to process this data" };
  if (id === "act_drive" && !an.unlocked.has("mobility")) return { ok: false, reason: `Needs ${an.caps.mobility.missing.join(", ")}` };
  if (b.cap && !an.unlocked.has(b.cap)) return { ok: false, reason: `Requires ${CAP_MAP[b.cap].name}` };
  if (b.capAny && !b.capAny.some((c) => an.unlocked.has(c)))
    return { ok: false, reason: `Requires ${b.capAny.map((c) => CAP_MAP[c].name).join(" or ")}` };
  return { ok: true };
}

/** Is this placed block wired correctly within the program? */
export function wiring(id: BlockId, program: Program, build: Build): { ok: boolean; reason?: string } {
  const avail = availability(id, build);
  if (!avail.ok) return avail;
  const b = BLOCK_MAP[id];
  if (b.needsAny) {
    const all = [...program.input, ...program.decision, ...program.actuator].map((p) => p.id);
    if (!b.needsAny.some((n) => all.includes(n))) return { ok: false, reason: `Needs ${b.needsLabel}` };
  }
  return { ok: true };
}

export function starterProgram(build: Build): Program {
  const p: Program = { input: [], decision: [], actuator: [] };
  const add = (id: BlockId) => {
    if (availability(id, build).ok) p[BLOCK_MAP[id].lane].push(makeBlock(id));
  };
  (["in_scan", "in_points", "in_depth", "in_range", "in_odom", "in_imu", "in_bumper"] as BlockId[]).forEach(add);
  (["dec_estop", "dec_avoid", "dec_planner", "dec_goal"] as BlockId[]).forEach(add);
  (["act_drive", "act_smooth"] as BlockId[]).forEach(add);
  // Drop blocks that would have nothing to read (e.g. avoidance with no range sensor).
  for (const lane of ["decision", "actuator"] as Lane[]) p[lane] = p[lane].filter((b) => wiring(b.id, p, build).ok);
  return p;
}

/** Python-flavoured rendering of the visual program, shown to students as "what this compiles to". */
export function programToCode(p: Program): string {
  const lines: string[] = ["import robotics_lab as rl", "", "robot = rl.Robot()", ""];
  if (p.input.length) {
    lines.push("# Inputs: subscribe to sensor topics");
    p.input.forEach((b) => lines.push(`${BLOCK_MAP[b.id].tag.slice(1)} = robot.subscribe("${BLOCK_MAP[b.id].tag}")`));
    lines.push("");
  }
  lines.push("@robot.loop(hz=20)", "def control():");
  if (!p.decision.length) lines.push("    cmd = rl.Twist(0, 0)  # no decision blocks yet");
  else {
    lines.push("    cmd = rl.Twist(0, 0)");
    const has = (id: BlockId) => p.decision.find((b) => b.id === id);
    const planner = has("dec_planner");
    const goal = has("dec_goal");
    const wall = has("dec_wall");
    const avoid = has("dec_avoid");
    const estop = has("dec_estop");
    if (planner) lines.push(`    path = rl.astar(robot.map, robot.pose, robot.goal, margin=${planner.params.inflate})`);
    if (goal) lines.push(`    cmd = rl.go_to(${planner ? "path.lookahead(0.6)" : "robot.goal"}, robot.pose, tol=${goal.params.tol})`);
    else if (wall) lines.push(`    cmd = rl.follow_wall(scan, distance=${wall.params.dist})`);
    if (avoid) lines.push(`    cmd = rl.avoid(cmd, robot.ranges(), safe=${avoid.params.safe})`);
    if (estop) lines.push(`    if robot.ranges().front < ${estop.params.dist}${p.input.some((b) => b.id === "in_bumper") ? " or bumper.pressed" : ""}:`, "        cmd.linear = 0.0");
  }
  const drive = p.actuator.find((b) => b.id === "act_drive");
  const smooth = p.actuator.find((b) => b.id === "act_smooth");
  if (smooth) lines.push(`    cmd = rl.smooth(cmd, max_accel=${smooth.params.acc})`);
  if (drive) lines.push(`    robot.publish("/cmd_vel", cmd.clamp(v=${drive.params.maxV}, w=${drive.params.maxW}))`);
  else lines.push("    # no actuator block: the wheels never receive the command");
  return lines.join("\n");
}
