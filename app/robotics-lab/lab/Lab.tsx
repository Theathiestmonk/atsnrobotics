"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentArt } from "../components/ComponentArt";
import { Icon, type IconName } from "../components/Icon";
import { MiniMap } from "../components/MiniMap";
import { TopBar } from "../components/TopBar";
import { useRLTheme } from "../components/Theme";
import { EMPTY_PROGRAM, starterProgram, type Program } from "../data/blocks";
import { analyze, buildComponents, CAP_MAP, CAP_TREE, MISSION_MAP, MISSIONS, type Analysis, type Build, type EnvId } from "../data/catalog";
import { ENV_LIST, ENVIRONMENTS } from "../data/environments";
import { loadBuild, useProfile } from "../data/store";
import { ProgramBuilder } from "./ProgramBuilder";
import { Sim, type SimStatus } from "./sim/engine";
import { drawMap, drawSensorView, drawWorld, setRenderTheme, unproject, type Layers, type Projection, type ViewMode } from "./sim/render";

const PROGRAM_KEY = "atsn.rl.program.v1";
const SPEEDS = [0.5, 1, 2, 4];

const STATUS_LABEL: Record<SimStatus, string> = {
  idle: "Ready",
  running: "Navigating",
  paused: "Paused",
  arrived: "Goal reached",
  collided: "Collision",
  lost: "Lost",
};

interface Snap {
  t: number;
  x: number;
  y: number;
  th: number;
  v: number;
  w: number;
  status: SimStatus;
  estErr: number | null;
  clearance: number;
  logs: number;
  estop: boolean;
}

const DEFAULT_PY = `# Send a navigation command
sim.set_goal(18.0, 10.2)
sim.start()

# Or drive the robot directly
# sim.set_velocity(v=0.5, omega=0.0)
# print(sim.pose())`;

export function Lab() {
  const [profile, updateProfile] = useProfile();
  const [build, setBuild] = useState<Build | null>(null);
  const [fromWorkshop, setFromWorkshop] = useState(true);
  const [program, setProgram] = useState<Program>(EMPTY_PROGRAM);
  const [programReady, setProgramReady] = useState(false);
  const mission = MISSION_MAP[profile.missionId] ?? MISSIONS[0];
  const [envId, setEnvId] = useState<EnvId>("warehouse");
  const [mode, setMode] = useState<ViewMode>("3d");
  const [viewTab, setViewTab] = useState<"sim" | "map">("sim");
  const [layers, setLayers] = useState<Layers>({ path: true, scan: true, trail: true });
  const [speed, setSpeed] = useState(1);
  const [bottom, setBottom] = useState<"program" | "python" | "logs">("program");
  const [cmdTab, setCmdTab] = useState<"nav" | "motion">("nav");
  const [sensor, setSensor] = useState<"lidar" | "depth" | "range">("lidar");
  const [pick, setPick] = useState<"goal" | "start" | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [result, setResult] = useState<null | { stars: number; time: number; reward: boolean; missionOk: boolean; clearance: number }>(null);
  const [py, setPy] = useState(DEFAULT_PY);
  const [pyOut, setPyOut] = useState<{ text: string; err?: boolean }[]>([]);

  const simRef = useRef<Sim | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sensorRef = useRef<HTMLCanvasElement>(null);
  const projRef = useRef<Projection | null>(null);
  const keys = useRef(new Set<string>());
  const teleop = useRef<{ v: number; w: number } | null>(null);
  const { theme } = useRLTheme();
  const rendered = useRef({ mode, viewTab, layers, speed, sensor, theme });
  rendered.current = { mode, viewTab, layers, speed, sensor, theme };

  // Load the robot built in the Workshop + the saved program.
  useEffect(() => {
    const { build: b, fromWorkshop: fw } = loadBuild();
    setBuild(b);
    setFromWorkshop(fw);
    let p: Program | null = null;
    try {
      const raw = window.localStorage.getItem(PROGRAM_KEY);
      if (raw) p = JSON.parse(raw) as Program;
    } catch {
      /* ignore */
    }
    const valid = p && p.input && p.decision && p.actuator && p.input.length + p.decision.length + p.actuator.length > 0;
    setProgram(valid ? p! : starterProgram(b));
    setProgramReady(true);
  }, []);

  useEffect(() => setEnvId(mission.env), [mission.env]);

  useEffect(() => {
    if (!programReady) return;
    try {
      window.localStorage.setItem(PROGRAM_KEY, JSON.stringify(program));
    } catch {
      /* ignore */
    }
    simRef.current?.setProgram(program);
  }, [program, programReady]);

  // (Re)create the simulation when the environment or robot changes.
  useEffect(() => {
    if (!build) return;
    simRef.current = new Sim(ENVIRONMENTS[envId], build, program);
    setResult(null);
    // program is applied by its own effect; we only want env/build to rebuild here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envId, build]);

  const analysis = useMemo(() => (build ? analyze(build) : null), [build]);

  // Main loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastSnap = 0;
    let lastStatus: SimStatus = "idle";
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const sim = simRef.current;
      const canvas = canvasRef.current;
      if (!sim || !canvas) return;
      const r = rendered.current;
      let dt = Math.min(0.05, (now - last) / 1000) * r.speed;
      last = now;

      // Keyboard / pad teleop overrides the program.
      const k = keys.current;
      const kv = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0);
      const kw = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0);
      const tele = teleop.current ?? (kv || kw ? { v: kv * 0.5, w: kw * 1.2 } : null);
      if (tele) {
        sim.manual = tele;
        sim.manualSource = "pad";
        if (sim.status !== "running") sim.run();
      } else if (sim.manualSource === "pad") {
        sim.manual = null;
        sim.manualSource = null;
      }

      while (dt > 0) {
        const h = Math.min(dt, 1 / 60);
        sim.step(h);
        dt -= h;
      }

      setRenderTheme(r.theme);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const cw = canvas.width / dpr;
        const ch = canvas.height / dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        projRef.current = r.viewTab === "map" ? drawMap(ctx, sim, cw, ch) : drawWorld(ctx, sim, cw, ch, r.mode, r.layers, now);
      }
      const sc = sensorRef.current;
      const sctx = sc?.getContext("2d");
      if (sc && sctx) {
        const dpr = window.devicePixelRatio || 1;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawSensorView(sctx, sim, sc.width / dpr, sc.height / dpr, r.sensor);
      }

      if (now - lastSnap > 110 || sim.status !== lastStatus) {
        lastSnap = now;
        setSnap({
          t: sim.t,
          x: sim.pose.x,
          y: sim.pose.y,
          th: sim.pose.th,
          v: sim.v,
          w: sim.w,
          status: sim.status,
          estErr: sim.est ? Math.hypot(sim.est.x - sim.pose.x, sim.est.y - sim.pose.y) : null,
          clearance: sim.clearance(sim.pose.x, sim.pose.y) - 0.3,
          logs: sim.logs.length + sim.t,
          estop: sim.estopActive,
        });
        if (sim.status === "arrived" && lastStatus !== "arrived") onArriveRef.current(sim);
        lastStatus = sim.status;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas sizing.
  useEffect(() => {
    const fit = (el: HTMLCanvasElement | null) => {
      if (!el?.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = el.parentElement.getBoundingClientRect();
      el.width = Math.max(1, Math.round(width * dpr));
      el.height = Math.max(1, Math.round(height * dpr));
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    };
    const ro = new ResizeObserver(() => {
      fit(canvasRef.current);
      fit(sensorRef.current);
    });
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
    if (sensorRef.current?.parentElement) ro.observe(sensorRef.current.parentElement);
    return () => ro.disconnect();
  }, []);

  // Keyboard teleop.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select")) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        keys.current.add(k);
        if (k.startsWith("arrow")) e.preventDefault();
      }
      if (k === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  const onArrive = useCallback(
    (sim: Sim) => {
      const par = sim.pathLength() / 0.45 + 8;
      const clean = sim.minClearance > 0.15 && sim.estopCount === 0;
      const stars = 1 + (sim.t <= par ? 1 : 0) + (clean ? 1 : 0);
      const b = sim.build;
      const missionOk = sim.env.id === mission.env && mission.requires.every((c) => analyze(b).unlocked.has(c));
      const reward = missionOk && !profile.completed.includes(mission.id);
      if (reward)
        updateProfile((p) =>
          p.completed.includes(mission.id)
            ? p
            : { ...p, xp: p.xp + mission.reward.xp, completed: [...p.completed, mission.id] },
        );
      setResult({ stars, time: sim.t, reward, missionOk, clearance: sim.minClearance });
    },
    [mission, profile.completed, updateProfile],
  );
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  const sim = simRef.current;
  const togglePlay = () => {
    const s = simRef.current;
    if (!s) return;
    if (s.status === "running") s.pause();
    else s.run();
  };
  const reset = () => {
    simRef.current?.reset();
    setResult(null);
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    const P = projRef.current;
    if (!s || !P || !pick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = unproject(P, e.clientX - rect.left, e.clientY - rect.top);
    if (x < 0 || y < 0 || x > s.env.w || y > s.env.h) return;
    if (s.clearance(x, y) < 0.35) {
      s.log("That point is inside or too close to an obstacle.", "warn");
      return;
    }
    if (pick === "goal") s.setGoal(x, y);
    else s.setStart(x, y);
    setPick(null);
  };

  /* ── Python console ── */
  const runPython = () => {
    const s = simRef.current;
    if (!s) return;
    const out: { text: string; err?: boolean }[] = [];
    const num = (v: string) => Number(v.split("=").pop()!.trim());
    py.split("\n").forEach((raw, i) => {
      const line = raw.replace(/#.*/, "").trim();
      if (!line) return;
      let m: RegExpMatchArray | null;
      if ((m = line.match(/^sim\.set_goal\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/))) {
        s.setGoal(Number(m[1]), Number(m[2]));
        out.push({ text: `>>> goal = (${Number(m[1]).toFixed(1)}, ${Number(m[2]).toFixed(1)})` });
      } else if ((m = line.match(/^sim\.set_velocity\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/))) {
        const v = num(m[1]);
        const w = num(m[2]);
        if (Number.isNaN(v) || Number.isNaN(w)) out.push({ text: `line ${i + 1}: velocities must be numbers`, err: true });
        else {
          s.manual = { v, w };
          s.manualSource = "py";
          if (s.status !== "running") s.run();
          out.push({ text: `>>> cmd_vel v=${v} ω=${w}` });
        }
      } else if (/^sim\.(start|run)\(\)$/.test(line)) {
        s.run();
        out.push({ text: ">>> running" });
      } else if (line === "sim.pause()") {
        s.pause();
        out.push({ text: ">>> paused" });
      } else if (line === "sim.stop()") {
        s.stop();
        out.push({ text: ">>> stopped" });
      } else if (line === "sim.reset()") {
        reset();
        out.push({ text: ">>> reset" });
      } else if (/^(print\()?sim\.pose\(\)\)?$/.test(line)) {
        out.push({ text: `(${s.pose.x.toFixed(2)}, ${s.pose.y.toFixed(2)}, ${s.pose.th.toFixed(2)})` });
      } else if (/^(print\()?sim\.front_distance\(\)\)?$/.test(line)) {
        const f = s.sector(-0.5, 0.5);
        out.push({ text: f === Infinity ? "inf (no forward sensor)" : `${f.toFixed(2)} m` });
      } else {
        out.push({ text: `line ${i + 1}: unknown command "${line}"`, err: true });
      }
    });
    setPyOut((o) => [...o, ...out].slice(-80));
  };

  const parts = build ? buildComponents(build) : [];
  const env = ENVIRONMENTS[envId];
  const running = snap?.status === "running";
  const logs = sim?.logs ?? [];

  const pad = (v: number, w: number): React.PointerEventHandler => (e) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    teleop.current = { v, w };
  };
  const padUp = () => {
    teleop.current = null;
  };

  return (
    <div className="rl-app">
      <TopBar profile={profile} />

      <main className="lab-grid">
        {/* ── Left column ── */}
        <div className="lab-col lab-col--left">
          <section className="rl-panel">
            <header className="rl-panel__head">
              <Icon name="map" className="rl-gold" />
              <h2>Environment</h2>
            </header>
            <div className="lab-envs">
              {ENV_LIST.map((e) => (
                <button key={e.id} type="button" className={`lab-env ${e.id === envId ? "is-on" : ""}`} onClick={() => setEnvId(e.id)}>
                  <MiniMap env={e.id} />
                  <span>
                    <strong>{e.name}</strong>
                    <small>{e.blurb}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rl-panel">
            <header className="rl-panel__head">
              <Icon name="robot" className="rl-gold" />
              <h2>Robot</h2>
              <Link href="/robotics-lab/workshop" className="rl-link">
                Configure
              </Link>
            </header>
            {!fromWorkshop && <p className="lab-note">Showing the reference build. Assemble your own in the Workshop.</p>}
            <div className="lab-robot">
              <div className="lab-robot__parts">
                {parts.map((c, i) => (
                  <span key={`${c.id}-${i}`} title={c.name}>
                    <ComponentArt id={c.id} />
                  </span>
                ))}
              </div>
              <ul className="lab-abilities" aria-label="What this robot can do in the simulation">
                {CAP_TREE.map((c) => {
                  const st = analysis?.caps[c];
                  const on = !!st?.unlocked;
                  return (
                    <li key={c} className={on ? "is-on" : ""}>
                      <Icon name={on ? "check" : "lock"} size={12} />
                      <span>{CAP_MAP[c].short}</span>
                      <em className="lab-abilities__tip">
                        <strong>{CAP_MAP[c].name}</strong>
                        {on ? (
                          <>
                            {CAP_MAP[c].desc}
                            <br />
                            <i>Limit: {CAP_MAP[c].limit}</i>
                          </>
                        ) : (
                          <>Needs {st?.missing.join(", ")}.</>
                        )}
                      </em>
                    </li>
                  );
                })}
              </ul>
              {analysis && <p className="lab-abilities__limit">{abilitySummary(analysis)}</p>}
            </div>
          </section>

          <section className="rl-panel">
            <header className="rl-panel__head">
              <Icon name="flag" className="rl-gold" />
              <h2>Task</h2>
            </header>
            <div className="lab-task">
              <div className="lab-task__mission">
                <small>
                  {mission.code} · {mission.tier}
                </small>
                <strong>{mission.title}</strong>
                {mission.env !== envId && <em>This mission runs in the {ENVIRONMENTS[mission.env].name}.</em>}
              </div>
              <div className="lab-task__row">
                <Icon name="target" size={15} />
                <span>Start</span>
                <code>
                  ({sim?.start.x.toFixed(1) ?? env.start.x.toFixed(1)}, {sim?.start.y.toFixed(1) ?? env.start.y.toFixed(1)}) m
                </code>
              </div>
              <div className="lab-task__row">
                <Icon name="pin" size={15} className="rl-gold" />
                <span>Goal</span>
                <code>
                  ({sim?.goal.x.toFixed(1) ?? env.goal.x.toFixed(1)}, {sim?.goal.y.toFixed(1) ?? env.goal.y.toFixed(1)}) m
                </code>
              </div>
              <div className="lab-task__btns">
                <button type="button" className={`rl-btn rl-btn--ghost rl-btn--sm ${pick === "goal" ? "is-on" : ""}`} onClick={() => setPick(pick === "goal" ? null : "goal")}>
                  <Icon name="pin" size={14} /> Set Goal on Map
                </button>
                <button type="button" className={`rl-btn rl-btn--ghost rl-btn--sm ${pick === "start" ? "is-on" : ""}`} onClick={() => setPick(pick === "start" ? null : "start")}>
                  <Icon name="target" size={14} /> Set Start
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Viewport ── */}
        <section className="rl-panel lab-view">
          <div className="lab-view__bar">
            <div className="rl-seg rl-seg--tabs">
              <button type="button" className={viewTab === "sim" ? "is-on" : ""} onClick={() => setViewTab("sim")}>
                Simulation
              </button>
              <button type="button" className={viewTab === "map" ? "is-on" : ""} onClick={() => setViewTab("map")}>
                SLAM Map
              </button>
            </div>
            <div className="lab-view__right">
              <div className="lab-layers">
                {(["path", "scan", "trail"] as const).map((l) => (
                  <label key={l}>
                    <input type="checkbox" checked={layers[l]} onChange={(e) => setLayers((s) => ({ ...s, [l]: e.target.checked }))} />
                    {l === "path" ? "Path" : l === "scan" ? "Sensors" : "Trail"}
                  </label>
                ))}
              </div>
              <div className="rl-seg">
                <button type="button" className={mode === "2d" ? "is-on" : ""} onClick={() => setMode("2d")}>
                  2D
                </button>
                <button type="button" className={mode === "3d" ? "is-on" : ""} onClick={() => setMode("3d")}>
                  3D
                </button>
              </div>
            </div>
          </div>

          <div className={`lab-canvas ${pick ? "is-picking" : ""}`}>
            <canvas ref={canvasRef} onClick={onCanvasClick} />
            {pick && <div className="lab-canvas__pick">Click the floor to set the {pick}</div>}
            {viewTab === "map" && analysis && !analysis.unlocked.has("mapping") && !analysis.unlocked.has("mapping3d") && (
              <div className="lab-canvas__lock">
                <Icon name="lock" size={22} />
                <strong>SLAM is locked</strong>
                <span>Needs {analysis.caps.mapping.missing.join(", ")}.</span>
              </div>
            )}
            {result && (
              <div className="lab-result" role="dialog" aria-label="Run complete">
                <div className="lab-result__stars">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= result.stars ? "is-on" : ""}>
                      ★
                    </span>
                  ))}
                </div>
                <h3>{result.missionOk ? `${mission.title} complete` : "Goal reached"}</h3>
                <p>
                  {result.time.toFixed(1)} s · closest approach {Math.max(0, result.clearance).toFixed(2)} m
                </p>
                {result.reward ? (
                  <div className="ws-reward">
                    <span>
                      <Icon name="spark" size={16} className="rl-gold" /> +{mission.reward.xp} XP
                    </span>
                  </div>
                ) : (
                  <p className="lab-result__note">
                    {result.missionOk
                      ? "Mission rewards already collected. Chase three stars."
                      : `Rewards need the ${ENVIRONMENTS[mission.env].name} and: ${mission.requires.map((c) => CAP_MAP[c].name).join(", ")}.`}
                  </p>
                )}
                <div className="lab-result__btns">
                  <button type="button" className="rl-btn rl-btn--ghost" onClick={reset}>
                    <Icon name="reset" size={15} /> Run Again
                  </button>
                  <Link href="/robotics-lab/workshop" className="rl-btn rl-btn--gold">
                    <Icon name="wrench" size={15} /> Upgrade Robot
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lab-transport">
            <button type="button" className="rl-iconbtn rl-iconbtn--lg" onClick={togglePlay} title="Play / pause (Space)">
              <Icon name={running ? "pause" : "play"} />
            </button>
            <button type="button" className="rl-iconbtn rl-iconbtn--lg" onClick={reset} title="Reset">
              <Icon name="stop" />
            </button>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rl-select" aria-label="Simulation speed">
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}×
                </option>
              ))}
            </select>
            <div className="lab-transport__status">
              <span className={`lab-status lab-status--${snap?.status ?? "idle"}`}>{STATUS_LABEL[snap?.status ?? "idle"]}</span>
            </div>
            <div className="lab-legend">
              <span>
                <i className="lg-path" /> Planned path
              </span>
              <span>
                <i className="lg-scan" /> Sensor hits
              </span>
              <span>
                <i className="lg-robot" /> Robot
              </span>
              <span>
                <i className="lg-goal" /> Goal
              </span>
            </div>
            <span className="lab-transport__time">t = {(snap?.t ?? 0).toFixed(1)} s</span>
          </div>
        </section>

        {/* ── Right column ── */}
        <div className="lab-col lab-col--right">
          <section className="rl-panel">
            <header className="rl-panel__head">
              <Icon name="code" className="rl-gold" />
              <h2>Commands</h2>
            </header>
            <div className="rl-seg rl-seg--full">
              <button type="button" className={cmdTab === "nav" ? "is-on" : ""} onClick={() => setCmdTab("nav")}>
                Navigation
              </button>
              <button type="button" className={cmdTab === "motion" ? "is-on" : ""} onClick={() => setCmdTab("motion")}>
                Manual Drive
              </button>
            </div>
            {cmdTab === "nav" ? (
              <div className="lab-cmds">
                <CmdButton icon="pin" label="Go to Goal" onClick={() => simRef.current?.run()} />
                <CmdButton icon="stop" label="Stop" onClick={() => simRef.current?.stop()} />
                <CmdButton icon="pause" label={snap?.status === "paused" ? "Resume" : "Pause"} onClick={() => simRef.current?.pause()} />
                <CmdButton icon="reset" label="Reset" onClick={reset} />
              </div>
            ) : (
              <div className="lab-pad">
                <span />
                <button type="button" onPointerDown={pad(0.5, 0)} onPointerUp={padUp} onPointerCancel={padUp} aria-label="Forward">
                  <Icon name="arrowUp" />
                </button>
                <span />
                <button type="button" onPointerDown={pad(0, -1.2)} onPointerUp={padUp} onPointerCancel={padUp} aria-label="Turn left">
                  <Icon name="arrowLeft" />
                </button>
                <button type="button" onPointerDown={pad(-0.3, 0)} onPointerUp={padUp} onPointerCancel={padUp} aria-label="Reverse">
                  <Icon name="arrowDown" />
                </button>
                <button type="button" onPointerDown={pad(0, 1.2)} onPointerUp={padUp} onPointerCancel={padUp} aria-label="Turn right">
                  <Icon name="arrowRight" />
                </button>
                <p>Hold to drive, or use W A S D.</p>
              </div>
            )}
          </section>

          <section className="rl-panel">
            <header className="rl-panel__head">
              <Icon name="signal" className="rl-gold" />
              <h2>Robot State</h2>
              <span className="rl-live">Live</span>
            </header>
            <dl className="rl-kv rl-kv--state">
              <div>
                <dt>Position (x, y)</dt>
                <dd>
                  ({(snap?.x ?? 0).toFixed(2)}, {(snap?.y ?? 0).toFixed(2)}) m
                </dd>
              </div>
              <div>
                <dt>Orientation (θ)</dt>
                <dd>
                  {(snap?.th ?? 0).toFixed(2)} rad ({(((snap?.th ?? 0) * 180) / Math.PI).toFixed(1)}°)
                </dd>
              </div>
              <div>
                <dt>Linear velocity (v)</dt>
                <dd>{(snap?.v ?? 0).toFixed(2)} m/s</dd>
              </div>
              <div>
                <dt>Angular velocity (ω)</dt>
                <dd>{(snap?.w ?? 0).toFixed(2)} rad/s</dd>
              </div>
              <div>
                <dt>Pose estimate error</dt>
                <dd>{snap?.estErr == null ? "No pose source" : `${snap.estErr.toFixed(2)} m`}</dd>
              </div>
              <div>
                <dt>Clearance</dt>
                <dd className={snap && snap.clearance < 0.2 ? "is-warn" : ""}>{snap ? `${Math.max(0, snap.clearance).toFixed(2)} m` : "-"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`lab-status lab-status--${snap?.status ?? "idle"}`}>{snap?.estop ? "E-Stop" : STATUS_LABEL[snap?.status ?? "idle"]}</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rl-panel lab-sensor">
            <header className="rl-panel__head">
              <Icon name="eye" className="rl-gold" />
              <h2>Sensor View</h2>
              <select value={sensor} onChange={(e) => setSensor(e.target.value as typeof sensor)} className="rl-select rl-select--sm" aria-label="Sensor">
                <option value="lidar">LiDAR /scan</option>
                <option value="depth">Depth /depth</option>
                <option value="range">Ultrasonic /range</option>
              </select>
            </header>
            <div className="lab-sensor__canvas">
              <canvas ref={sensorRef} />
            </div>
          </section>
        </div>

        {/* ── Bottom: program / python / logs ── */}
        <section className="rl-panel lab-bottom">
          <div className="lab-bottom__tabs" role="tablist">
            {(
              [
                ["program", "Program Builder", "layers"],
                ["python", "Python Console", "code"],
                ["logs", "Logs", "list"],
              ] as [typeof bottom, string, IconName][]
            ).map(([id, label, icon]) => (
              <button key={id} type="button" role="tab" aria-selected={bottom === id} className={bottom === id ? "is-on" : ""} onClick={() => setBottom(id)}>
                <Icon name={icon} size={15} /> {label}
                {id === "logs" && logs.some((l) => l.level === "error") && <i className="lab-dot" />}
              </button>
            ))}
          </div>
          <div className="lab-bottom__body">
            {bottom === "program" && build && <ProgramBuilder program={program} build={build} onChange={setProgram} />}
            {bottom === "python" && (
              <div className="lab-py">
                <div className="lab-py__editor">
                  <textarea value={py} onChange={(e) => setPy(e.target.value)} spellCheck={false} aria-label="Python commands" />
                  <button type="button" className="rl-btn rl-btn--gold rl-btn--sm" onClick={runPython}>
                    <Icon name="play" size={14} /> Run
                  </button>
                </div>
                <div className="lab-py__out">
                  <p className="lab-py__help">
                    sim.set_goal(x, y) · sim.set_velocity(v=, omega=) · sim.start() · sim.pause() · sim.stop() · sim.reset() · print(sim.pose()) · print(sim.front_distance())
                  </p>
                  {pyOut.map((o, i) => (
                    <div key={i} className={o.err ? "is-err" : ""}>
                      {o.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bottom === "logs" && (
              <div className="lab-logs">
                {logs
                  .slice()
                  .reverse()
                  .map((l, i) => (
                    <div key={i} className={`lab-log lab-log--${l.level}`}>
                      <time>[{fmtTime(l.t)}]</time>
                      <span>{l.msg}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CmdButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" className="lab-cmd" onClick={onClick}>
      <Icon name={icon} size={16} />
      <span>{label}</span>
      <Icon name="play" size={12} className="lab-cmd__go" />
    </button>
  );
}

function fmtTime(t: number) {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

/** One-line explanation of what the robot can do right now and its main limitation. */
function abilitySummary(a: Analysis) {
  if (!a.unlocked.has("mobility")) return `It cannot move yet: needs ${a.caps.mobility.missing.join(", ")}.`;
  const top = [...CAP_TREE].reverse().find((c) => a.unlocked.has(c));
  return top ? CAP_MAP[top].limit : "";
}
