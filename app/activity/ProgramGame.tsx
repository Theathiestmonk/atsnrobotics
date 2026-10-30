"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// Grid constants
const COLS = 9;
const ROWS = 6;
const MAX_CMDS = 12;

type Dir = 0 | 1 | 2 | 3; // right, down, left, up
type Cmd = "F" | "L" | "R";
type RunState = "idle" | "running" | "success" | "fail";

interface Cell { wall: boolean; goal: boolean; }
interface Level {
  label: string;
  hint: string;
  grid: boolean[][]; // true = wall
  goals: [number, number][]; // [row, col]
  startR: number;
  startC: number;
  startDir: Dir;
}

const DX = [1, 0, -1, 0]; // right down left up — column delta
const DY = [0, 1, 0, -1]; // row delta

const LEVELS: Level[] = [
  {
    label: "Level 1 — Straight Ahead",
    hint: "Move forward 3 times to reach the delivery point.",
    startR: 2, startC: 1, startDir: 0,
    goals: [[2, 4]],
    grid: (() => {
      const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      return g;
    })(),
  },
  {
    label: "Level 2 — First Turn",
    hint: "Go forward, turn, then go forward again.",
    startR: 4, startC: 1, startDir: 0,
    goals: [[1, 4]],
    grid: (() => {
      const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      return g;
    })(),
  },
  {
    label: "Level 3 — Around the Obstacle",
    hint: "There's a wall in the way — navigate around it.",
    startR: 2, startC: 1, startDir: 0,
    goals: [[2, 7]],
    grid: (() => {
      const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      g[2][4] = true; g[1][4] = true; g[3][4] = true;
      return g;
    })(),
  },
  {
    label: "Level 4 — S-Curve",
    hint: "Two turns needed to thread the gap.",
    startR: 0, startC: 1, startDir: 1,
    goals: [[5, 7]],
    grid: (() => {
      const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      [0,1,2].forEach(r => g[r][4] = true);
      [3,4,5].forEach(r => g[r][3] = true);
      return g;
    })(),
  },
  {
    label: "Level 5 — The Warehouse",
    hint: "Two deliveries to make — plan carefully!",
    startR: 0, startC: 0, startDir: 0,
    goals: [[0, 7], [5, 7]],
    grid: (() => {
      const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      [1,2,3].forEach(r => g[r][2] = true);
      [2,3,4].forEach(r => g[r][5] = true);
      g[0][5] = true;
      return g;
    })(),
  },
];

const CMD_META: Record<Cmd, { label: string; icon: string; color: string; border: string }> = {
  F: { label: "Forward", icon: "↑", color: "rgba(99,179,237,0.12)", border: "rgba(99,179,237,0.4)" },
  L: { label: "Turn Left", icon: "↺", color: "rgba(201,169,98,0.1)", border: "rgba(201,169,98,0.4)" },
  R: { label: "Turn Right", icon: "↻", color: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.4)" },
};

export function ProgramGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const sonicImg = useRef<HTMLImageElement | null>(null);

  const cellSize = useRef(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const [levelIdx, setLevelIdx] = useState(0);
  const [cmds, setCmds] = useState<Cmd[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [execStep, setExecStep] = useState(-1);
  const [message, setMessage] = useState("");
  const [goalsLeft, setGoalsLeft] = useState(0);

  const runStateRef = useRef<RunState>("idle");
  const execStepRef = useRef(-1);
  const cmdsRef = useRef<Cmd[]>([]);

  // Robot animation state (all refs for canvas loop)
  const robotR = useRef(0);
  const robotC = useRef(0);
  const robotDir = useRef<Dir>(0);
  const robotX = useRef(0); // pixel, interpolated
  const robotY = useRef(0);
  const robotAngle = useRef(0); // in radians
  const targetX = useRef(0);
  const targetY = useRef(0);
  const targetAngle = useRef(0);
  const goalsHit = useRef<Set<string>>(new Set());
  const stepTimer = useRef(0); // countdown frames for this step
  const STEP_FRAMES = 28;

  const level = LEVELS[levelIdx];

  useEffect(() => {
    const img = new window.Image();
    img.src = "/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png";
    img.onload = () => { sonicImg.current = img; };
  }, []);

  const resetRobot = useCallback((lvl: Level) => {
    const cs = cellSize.current, ox = offsetX.current, oy = offsetY.current;
    const cx = ox + lvl.startC * cs + cs / 2;
    const cy = oy + lvl.startR * cs + cs / 2;
    robotR.current = lvl.startR;
    robotC.current = lvl.startC;
    robotDir.current = lvl.startDir;
    robotX.current = cx; robotY.current = cy;
    targetX.current = cx; targetY.current = cy;
    robotAngle.current = (lvl.startDir * Math.PI) / 2 - Math.PI / 2;
    targetAngle.current = robotAngle.current;
    goalsHit.current = new Set();
    stepTimer.current = 0;
  }, []);

  const cellCenter = (r: number, c: number) => ({
    x: offsetX.current + c * cellSize.current + cellSize.current / 2,
    y: offsetY.current + r * cellSize.current + cellSize.current / 2,
  });

  const dirAngle = (d: Dir) => (d * Math.PI) / 2 - Math.PI / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = container!.clientWidth;
      canvas!.height = container!.clientHeight;
      const panelH = Math.min(container!.clientHeight * 0.62, 400);
      const cs = Math.floor(Math.min((canvas!.width * 0.88) / COLS, panelH / ROWS));
      cellSize.current = Math.max(36, cs);
      const gridW = cellSize.current * COLS, gridH = cellSize.current * ROWS;
      offsetX.current = Math.floor((canvas!.width - gridW) / 2);
      offsetY.current = Math.floor(canvas!.height * 0.06);
      resetRobot(LEVELS[levelIdx]);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function lerpAngle(a: number, b: number, t: number) {
      let d = b - a;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      return a + d * t;
    }

    function drawGrid() {
      const cs = cellSize.current, ox = offsetX.current, oy = offsetY.current;
      const grid = level.grid;
      const goalSet = new Set(level.goals.map(([r, c]) => `${r},${c}`));

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = ox + c * cs, y = oy + r * cs;
          if (grid[r][c]) {
            ctx.fillStyle = "#1e1e2e";
            ctx.fillRect(x, y, cs, cs);
            // wall texture dots
            ctx.fillStyle = "rgba(255,255,255,0.04)";
            for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
              ctx.fillRect(x + 6 + i * (cs / 3 - 3), y + 6 + j * (cs / 3 - 3), 2, 2);
            }
          } else {
            ctx.fillStyle = "#0d0d18";
            ctx.fillRect(x, y, cs, cs);
            // floor grid
            ctx.strokeStyle = "rgba(255,255,255,0.04)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
          }
          // goal cell
          if (goalSet.has(`${r},${c}`)) {
            const hit = goalsHit.current.has(`${r},${c}`);
            const pulse = 0.4 + 0.08 * Math.sin(Date.now() / 350);
            ctx.fillStyle = hit ? "rgba(34,197,94,0.25)" : `rgba(201,169,98,${pulse})`;
            ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
            // star icon
            const cx2 = x + cs / 2, cy2 = y + cs / 2, sr = cs * 0.28;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const ang = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              const ang2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
              if (i === 0) ctx.moveTo(cx2 + sr * Math.cos(ang), cy2 + sr * Math.sin(ang));
              else ctx.lineTo(cx2 + sr * Math.cos(ang), cy2 + sr * Math.sin(ang));
              ctx.lineTo(cx2 + sr * 0.42 * Math.cos(ang2), cy2 + sr * 0.42 * Math.sin(ang2));
            }
            ctx.closePath();
            ctx.fillStyle = hit ? "#22c55e" : "#c9a962";
            if (!hit) { ctx.shadowColor = "#c9a96280"; ctx.shadowBlur = 8; }
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      // start marker
      const sx = ox + level.startC * cs, sy = oy + level.startR * cs;
      ctx.strokeStyle = "rgba(99,179,237,0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + 2, sy + 2, cs - 4, cs - 4);
    }

    function drawRobot() {
      const cs = cellSize.current;
      const x = robotX.current, y = robotY.current;
      const ang = robotAngle.current;
      const imgH = cs * 1.5;
      const imgW = sonicImg.current ? (sonicImg.current.naturalWidth / sonicImg.current.naturalHeight) * imgH : imgH * 0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.shadowColor = "rgba(201,169,98,0.6)"; ctx.shadowBlur = 14;
      if (sonicImg.current) ctx.drawImage(sonicImg.current, -imgW / 2, -imgH * 0.65, imgW, imgH);
      ctx.restore();

      // direction arrow under robot
      ctx.save();
      ctx.translate(x, y + cs * 0.55);
      ctx.fillStyle = "rgba(99,179,237,0.55)";
      ctx.font = `${Math.max(10, cs * 0.28)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawExecutionHighlight(step: number) {
      if (step < 0 || step >= cmdsRef.current.length) return;
      // Visual pulse on active command shown in UI, not canvas
    }

    function tick() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#080810";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      drawGrid();

      // Animate robot toward target
      const speed = 0.18;
      robotX.current += (targetX.current - robotX.current) * speed;
      robotY.current += (targetY.current - robotY.current) * speed;
      robotAngle.current = lerpAngle(robotAngle.current, targetAngle.current, speed);

      drawRobot();

      // Run execution steps
      if (runStateRef.current === "running") {
        if (stepTimer.current > 0) {
          stepTimer.current--;
        } else {
          const step = execStepRef.current + 1;
          const cmdsNow = cmdsRef.current;
          if (step >= cmdsNow.length) {
            // All commands done — check if all goals hit
            const allDone = level.goals.every(([r, c]) => goalsHit.current.has(`${r},${c}`));
            if (allDone) {
              runStateRef.current = "success";
              setRunState("success");
              setMessage("Argo delivered everything perfectly!");
            } else {
              runStateRef.current = "fail";
              setRunState("fail");
              setMessage("Argo didn't reach all delivery points. Try again!");
            }
            execStepRef.current = step;
            setExecStep(step);
          } else {
            // Execute next command
            const cmd = cmdsNow[step];
            let newDir = robotDir.current;
            let newR = robotR.current;
            let newC = robotC.current;
            let hit = false;
            if (cmd === "L") { newDir = ((robotDir.current + 3) % 4) as Dir; }
            else if (cmd === "R") { newDir = ((robotDir.current + 1) % 4) as Dir; }
            else if (cmd === "F") {
              newR = robotR.current + DY[newDir];
              newC = robotC.current + DX[newDir];
              if (newR < 0 || newR >= ROWS || newC < 0 || newC >= COLS || level.grid[newR][newC]) {
                hit = true; newR = robotR.current; newC = robotC.current;
              }
            }
            robotDir.current = newDir;
            targetAngle.current = dirAngle(newDir);
            if (!hit) {
              robotR.current = newR; robotC.current = newC;
              const { x, y } = cellCenter(newR, newC);
              targetX.current = x; targetY.current = y;
            }
            // Check goal
            const gKey = `${newR},${newC}`;
            if (level.goals.some(([gr, gc]) => gr === newR && gc === newC)) {
              goalsHit.current.add(gKey);
              setGoalsLeft(level.goals.length - goalsHit.current.size);
            }
            if (hit) {
              runStateRef.current = "fail";
              setRunState("fail");
              setMessage("Argo hit a wall! Rethink your route.");
              execStepRef.current = step;
              setExecStep(step);
            } else {
              execStepRef.current = step;
              setExecStep(step);
              stepTimer.current = STEP_FRAMES;
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [levelIdx, level, resetRobot]);

  const addCmd = (cmd: Cmd) => {
    if (runState !== "idle" || cmds.length >= MAX_CMDS) return;
    const next = [...cmds, cmd];
    setCmds(next);
    cmdsRef.current = next;
  };

  const removeCmd = (i: number) => {
    if (runState !== "idle") return;
    const next = cmds.filter((_, idx) => idx !== i);
    setCmds(next);
    cmdsRef.current = next;
  };

  const runProgram = () => {
    if (cmds.length === 0 || runState !== "idle") return;
    resetRobot(level);
    setGoalsLeft(level.goals.length);
    runStateRef.current = "running";
    execStepRef.current = -1;
    stepTimer.current = 0;
    setRunState("running");
    setExecStep(-1);
    setMessage("");
  };

  const resetLevel = useCallback(() => {
    resetRobot(level);
    setCmds([]);
    cmdsRef.current = [];
    runStateRef.current = "idle";
    execStepRef.current = -1;
    setRunState("idle");
    setExecStep(-1);
    setMessage("");
    setGoalsLeft(level.goals.length);
  }, [level, resetRobot]);

  const nextLevel = () => {
    const next = levelIdx + 1;
    if (next >= LEVELS.length) return;
    setLevelIdx(next);
    setCmds([]);
    cmdsRef.current = [];
    runStateRef.current = "idle";
    execStepRef.current = -1;
    setRunState("idle");
    setExecStep(-1);
    setMessage("");
  };

  useEffect(() => { resetLevel(); }, [levelIdx]);

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, background: "#080810", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* Top bar */}
      <div style={{ position: "relative", zIndex: 10, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)" }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>ATSN Robotics</p>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>Program the Robot</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>LEVEL</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#c9a962" }}>{levelIdx + 1} / {LEVELS.length}</div>
          </div>
          <button onClick={onExit} style={{ padding: "5px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Games
          </button>
        </div>
      </div>

      {/* Level label */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, pointerEvents: "none" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>{level.label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{level.hint}</div>
      </div>

      {/* Bottom control panel */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "14px 16px 20px", background: "linear-gradient(to top, rgba(0,0,5,0.97) 70%, transparent)" }}>

        {/* Command queue */}
        <div style={{ display: "flex", gap: 6, minHeight: 44, marginBottom: 12, overflowX: "auto", paddingBottom: 2, alignItems: "center" }}>
          {cmds.length === 0 && (
            <p style={{ margin: 0, color: "rgba(255,255,255,0.2)", fontSize: 13, fontStyle: "italic" }}>Add commands below, then press Run</p>
          )}
          {cmds.map((cmd, i) => {
            const meta = CMD_META[cmd];
            const isActive = runState === "running" && i === execStep;
            const isDone = runState !== "idle" && i < execStep;
            return (
              <div key={i} onClick={() => removeCmd(i)}
                style={{
                  flexShrink: 0,
                  width: 42, height: 42,
                  borderRadius: 10,
                  border: `1.5px solid ${isActive ? "#fff" : isDone ? "rgba(255,255,255,0.1)" : meta.border}`,
                  background: isActive ? "rgba(255,255,255,0.15)" : isDone ? "rgba(255,255,255,0.03)" : meta.color,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: runState === "idle" ? "pointer" : "default",
                  opacity: isDone ? 0.4 : 1,
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.15s, border-color 0.15s",
                  boxShadow: isActive ? "0 0 12px rgba(255,255,255,0.2)" : "none",
                }}>
                <span style={{ fontSize: 18, lineHeight: 1, color: isActive ? "#fff" : isDone ? "rgba(255,255,255,0.3)" : "#fff" }}>{meta.icon}</span>
                <span style={{ fontSize: 8, color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{cmd}</span>
              </div>
            );
          })}
          {runState === "idle" && cmds.length < MAX_CMDS && (
            <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.12)" }}>+</span>
            </div>
          )}
        </div>

        {/* Command palette + run/reset */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          {(["F", "L", "R"] as Cmd[]).map(cmd => {
            const meta = CMD_META[cmd];
            return (
              <button key={cmd} onClick={() => addCmd(cmd)}
                disabled={runState !== "idle" || cmds.length >= MAX_CMDS}
                style={{
                  padding: "9px 20px", borderRadius: 12,
                  border: `1.5px solid ${meta.border}`,
                  background: meta.color,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: runState === "idle" && cmds.length < MAX_CMDS ? "pointer" : "not-allowed",
                  opacity: runState !== "idle" || cmds.length >= MAX_CMDS ? 0.35 : 1,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "opacity 0.2s",
                }}>
                <span style={{ fontSize: 18 }}>{meta.icon}</span> {meta.label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          {runState === "idle" && (
            <button onClick={runProgram} disabled={cmds.length === 0}
              style={{ padding: "9px 28px", borderRadius: 12, border: "1.5px solid rgba(34,197,94,0.5)", background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 14, fontWeight: 800, cursor: cmds.length > 0 ? "pointer" : "not-allowed", opacity: cmds.length > 0 ? 1 : 0.35, letterSpacing: "0.04em" }}>
              Run ▶
            </button>
          )}
          {runState === "running" && (
            <div style={{ padding: "9px 20px", borderRadius: 12, border: "1.5px solid rgba(201,169,98,0.4)", background: "rgba(201,169,98,0.08)", color: "#c9a962", fontSize: 13, fontWeight: 700 }}>
              Running... {execStep + 1}/{cmds.length}
            </div>
          )}
          {(runState === "success" || runState === "fail") && (
            <button onClick={resetLevel} style={{ padding: "9px 20px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Reset
            </button>
          )}
        </div>

        {/* Result message */}
        {message && (
          <div style={{ textAlign: "center", marginTop: 12, padding: "10px 20px", borderRadius: 12, background: runState === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${runState === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}` }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: runState === "success" ? "#22c55e" : "#ef4444" }}>{message}</p>
            {runState === "success" && levelIdx < LEVELS.length - 1 && (
              <button onClick={nextLevel} style={{ marginTop: 8, padding: "7px 24px", borderRadius: 999, border: "1.5px solid #c9a962", background: "rgba(201,169,98,0.12)", color: "#c9a962", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                Next Level →
              </button>
            )}
            {runState === "success" && levelIdx === LEVELS.length - 1 && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>All levels complete — you're a robotics programmer!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
