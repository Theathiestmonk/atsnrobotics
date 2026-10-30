"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const COLS = 21;
const ROWS = 15;
const GAME_TIME = 45;
const START: Pt = { r: 1, c: 1 };
const END: Pt = { r: ROWS - 2, c: COLS - 2 };

type Pt = { r: number; c: number };
type Phase = "idle" | "drawing" | "timeout" | "revealing" | "done";

function key(p: Pt) { return `${p.r},${p.c}`; }

function generateMaze(): boolean[][] {
  // DFS perfect maze
  const grid: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
  function carve(r: number, c: number) {
    grid[r][c] = false;
    const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && grid[nr][nc]) {
        grid[r + dr / 2][c + dc / 2] = false;
        carve(nr, nc);
      }
    }
  }
  carve(1, 1);
  grid[START.r][START.c] = false;
  grid[END.r][END.c] = false;

  // Open ~30% of extra interior walls to create multiple paths / loops
  const candidates: Pt[] = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (!grid[r][c]) continue;
      // A wall cell between two open cells horizontally or vertically = a candidate to remove
      const hOpen = !grid[r][c - 1] && !grid[r][c + 1];
      const vOpen = !grid[r - 1][c] && !grid[r + 1][c];
      if (hOpen || vOpen) candidates.push({ r, c });
    }
  }
  // Shuffle and remove ~30%
  candidates.sort(() => Math.random() - 0.5);
  const toRemove = Math.floor(candidates.length * 0.30);
  for (let i = 0; i < toRemove; i++) grid[candidates[i].r][candidates[i].c] = false;

  return grid;
}

function bfs(grid: boolean[][], start: Pt, end: Pt): Pt[] {
  const queue: Pt[] = [start];
  const prev = new Map<string, Pt | null>();
  prev.set(key(start), null);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.r === end.r && cur.c === end.c) break;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const np: Pt = { r: cur.r + dr, c: cur.c + dc };
      if (np.r >= 0 && np.r < ROWS && np.c >= 0 && np.c < COLS && !grid[np.r][np.c] && !prev.has(key(np))) {
        prev.set(key(np), cur);
        queue.push(np);
      }
    }
  }
  const path: Pt[] = [];
  let cur: Pt | null | undefined = end;
  while (cur != null) { path.unshift(cur); cur = prev.get(key(cur)); }
  return path.length > 1 ? path : [];
}

function isAdjacent(a: Pt, b: Pt) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function MazeGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const sonicImg = useRef<HTMLImageElement | null>(null);

  const gridRef = useRef<boolean[][]>(generateMaze());
  const playerPath = useRef<Pt[]>([START]);
  const optimalPath = useRef<Pt[]>([]);
  const revealIdx = useRef(0);
  const robotPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef(false);
  const cellSize = useRef(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const timerRef = useRef(GAME_TIME);
  const lastTickRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState({ player: 0, optimal: 0 });
  const [pathLen, setPathLen] = useState(1);
  const [atEnd, setAtEnd] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const img = new window.Image();
    img.src = "/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png";
    img.onload = () => { sonicImg.current = img; };
  }, []);

  const cellToXY = useCallback((p: Pt) => ({
    x: offsetX.current + p.c * cellSize.current + cellSize.current / 2,
    y: offsetY.current + p.r * cellSize.current + cellSize.current / 2,
  }), []);

  const xYToCell = useCallback((px: number, py: number): Pt | null => {
    const c = Math.floor((px - offsetX.current) / cellSize.current);
    const r = Math.floor((py - offsetY.current) / cellSize.current);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    if (gridRef.current[r][c]) return null;
    return { r, c };
  }, []);

  const startNew = useCallback(() => {
    gridRef.current = generateMaze();
    playerPath.current = [START];
    optimalPath.current = [];
    revealIdx.current = 0;
    timerRef.current = GAME_TIME;
    lastTickRef.current = 0;
    phaseRef.current = "drawing";
    setPhase("drawing");
    setScore({ player: 0, optimal: 0 });
    setPathLen(1);
    setAtEnd(false);
    setTimeLeft(GAME_TIME);
  }, []);

  const submitPath = useCallback(() => {
    const pp = playerPath.current;
    const lastCell = pp[pp.length - 1];
    if (lastCell.r !== END.r || lastCell.c !== END.c) return;
    const opt = bfs(gridRef.current, START, END);
    optimalPath.current = opt;
    revealIdx.current = 0;
    phaseRef.current = "revealing";
    setPhase("revealing");
    setScore({ player: pp.length - 1, optimal: opt.length - 1 });
    const startXY = cellToXY(START);
    robotPos.current = { x: startXY.x, y: startXY.y };
  }, [cellToXY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = container!.clientWidth;
      canvas!.height = container!.clientHeight;
      const maxCellW = Math.floor((canvas!.width * 0.88) / COLS);
      const maxCellH = Math.floor((canvas!.height * 0.72) / ROWS);
      cellSize.current = Math.max(14, Math.min(maxCellW, maxCellH));
      const gridW = cellSize.current * COLS, gridH = cellSize.current * ROWS;
      offsetX.current = Math.floor((canvas!.width - gridW) / 2);
      offsetY.current = Math.floor((canvas!.height - gridH) / 2);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function drawGrid() {
      const cs = cellSize.current, ox = offsetX.current, oy = offsetY.current;
      const grid = gridRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = ox + c * cs, y = oy + r * cs;
          ctx.fillStyle = grid[r][c] ? "#1a1a24" : "#0d0d14";
          ctx.fillRect(x, y, cs, cs);
        }
      }
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!grid[r][c]) {
            const x = ox + c * cs, y = oy + r * cs;
            ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
          }
        }
      }
    }

    function drawPlayerPath() {
      const pp = playerPath.current;
      if (pp.length < 2) return;
      const cs = cellSize.current;
      ctx.beginPath();
      const s = cellToXY(pp[0]);
      ctx.moveTo(s.x, s.y);
      for (let i = 1; i < pp.length; i++) { const p = cellToXY(pp[i]); ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = "rgba(99,179,237,0.55)";
      ctx.lineWidth = Math.max(3, cs * 0.35);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.stroke();
      ctx.fillStyle = "rgba(99,179,237,0.3)";
      for (const p of pp) {
        const { x, y } = cellToXY(p);
        ctx.beginPath(); ctx.arc(x, y, cs * 0.18, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawOptimalPath(upTo: number) {
      const op = optimalPath.current;
      if (op.length < 2 || upTo < 1) return;
      const cs = cellSize.current;
      ctx.beginPath();
      const s = cellToXY(op[0]);
      ctx.moveTo(s.x, s.y);
      for (let i = 1; i <= Math.min(upTo, op.length - 1); i++) { const p = cellToXY(op[i]); ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = Math.max(3, cs * 0.3);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(34,197,94,0.6)"; ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawStartEnd() {
      const cs = cellSize.current;
      const s = cellToXY(START), e = cellToXY(END);
      const pulse = 0.38 + 0.05 * Math.sin(Date.now() / 400);
      // start
      ctx.fillStyle = "rgba(34,197,94,0.18)";
      ctx.beginPath(); ctx.arc(s.x, s.y, cs * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, cs * 0.38, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#22c55e"; ctx.font = `bold ${Math.max(8, cs * 0.32)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("S", s.x, s.y);
      // end — pulse red for urgency
      const urgency = timerRef.current < 10 ? 0.3 + 0.15 * Math.sin(Date.now() / 150) : pulse;
      ctx.fillStyle = `rgba(239,68,68,${urgency * 0.6})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, cs * urgency, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, cs * 0.38, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#ef4444"; ctx.font = `bold ${Math.max(8, cs * 0.32)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("E", e.x, e.y);
    }

    function drawRobot(pos: { x: number; y: number }) {
      const cs = cellSize.current;
      const imgH = cs * 1.8, imgW = sonicImg.current ? (sonicImg.current.naturalWidth / sonicImg.current.naturalHeight) * imgH : imgH * 0.55;
      ctx.save();
      ctx.shadowColor = "rgba(201,169,98,0.7)"; ctx.shadowBlur = 16;
      if (sonicImg.current) ctx.drawImage(sonicImg.current, pos.x - imgW / 2, pos.y - imgH * 0.7, imgW, imgH);
      ctx.restore();
    }

    let revealAnim = 0;
    function tick(ts: number) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#080810";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      drawGrid();

      const ph = phaseRef.current;

      // Timer countdown during drawing
      if (ph === "drawing") {
        if (lastTickRef.current === 0) lastTickRef.current = ts;
        const dt = (ts - lastTickRef.current) / 1000;
        lastTickRef.current = ts;
        timerRef.current = Math.max(0, timerRef.current - dt);
        setTimeLeft(Math.ceil(timerRef.current));
        if (timerRef.current <= 0) {
          phaseRef.current = "timeout";
          setPhase("timeout");
        }
      }

      if (ph === "drawing" || ph === "idle") {
        drawPlayerPath();
        drawStartEnd();
        const last = playerPath.current[playerPath.current.length - 1];
        if (last) drawRobot(cellToXY(last));
      }

      if (ph === "revealing" || ph === "done") {
        ctx.globalAlpha = ph === "done" ? 0.55 : 0.25;
        drawPlayerPath();
        ctx.globalAlpha = 1;
        const speed = 2.5;
        if (ph === "revealing") {
          revealAnim += speed;
          if (revealAnim >= optimalPath.current.length) {
            revealAnim = optimalPath.current.length;
            phaseRef.current = "done";
            setPhase("done");
          }
          revealIdx.current = Math.floor(revealAnim);
        }
        drawOptimalPath(revealIdx.current);
        drawStartEnd();
        const ri = Math.min(Math.floor(revealAnim), optimalPath.current.length - 1);
        if (optimalPath.current[ri]) {
          const target = cellToXY(optimalPath.current[ri]);
          robotPos.current.x += (target.x - robotPos.current.x) * 0.25;
          robotPos.current.y += (target.y - robotPos.current.y) * 0.25;
          drawRobot(robotPos.current);
        }
      }

      if (ph === "timeout") {
        // Show partial path faded
        ctx.globalAlpha = 0.2;
        drawPlayerPath();
        ctx.globalAlpha = 1;
        drawStartEnd();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [cellToXY]);

  const syncPathState = useCallback(() => {
    const pp = playerPath.current;
    const last = pp[pp.length - 1];
    setPathLen(pp.length);
    setAtEnd(!!(last && last.r === END.r && last.c === END.c));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phaseRef.current !== "drawing") return;
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const cell = xYToCell((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    if (cell && cell.r === START.r && cell.c === START.c) {
      playerPath.current = [START];
      syncPathState();
    }
  }, [xYToCell, syncPathState]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing.current || phaseRef.current !== "drawing") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const cell = xYToCell((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    if (!cell) return;
    const pp = playerPath.current;
    const last = pp[pp.length - 1];
    if (cell.r === last.r && cell.c === last.c) return;
    if (pp.length >= 2) {
      const prev = pp[pp.length - 2];
      if (cell.r === prev.r && cell.c === prev.c) { pp.pop(); syncPathState(); return; }
    }
    if (!isAdjacent(last, cell)) return;
    if (pp.some(p => p.r === cell.r && p.c === cell.c)) return;
    pp.push(cell);
    syncPathState();
  }, [xYToCell, syncPathState]);

  const handlePointerUp = useCallback(() => { isDrawing.current = false; }, []);

  const getStars = () => {
    if (score.optimal === 0) return 0;
    const ratio = score.player / score.optimal;
    if (ratio <= 1.1) return 3;
    if (ratio <= 1.4) return 2;
    return 1;
  };
  const stars = getStars();
  const efficiency = score.optimal > 0 ? Math.round((score.optimal / score.player) * 100) : 0;

  const timerColor = timeLeft > 20 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#ef4444";
  const timerPct = (timeLeft / GAME_TIME) * 100;

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, background: "#080810", fontFamily: "system-ui, sans-serif" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }} />

      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }}>
        <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>ATSN Robotics</p>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Shortest Path Challenge</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {phase === "drawing" && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: timerColor, lineHeight: 1, transition: "color 0.3s", textShadow: timeLeft <= 10 ? `0 0 12px ${timerColor}` : "none" }}>{timeLeft}s</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>TIME LEFT</div>
              </div>
            )}
            <button onClick={onExit} style={{ pointerEvents: "auto", padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Games
            </button>
          </div>
        </div>
        {/* Timer bar */}
        {phase === "drawing" && (
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", margin: "0 0 0 0" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 0.25s linear, background 0.3s", boxShadow: `0 0 8px ${timerColor}60` }} />
          </div>
        )}
      </div>

      {/* Idle screen */}
      {phase === "idle" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "rgba(0,0,0,0.72)" }}>
          <div style={{ textAlign: "center", maxWidth: 460, padding: "0 24px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: "#fff" }}>Shortest Path Challenge</h2>
            <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.65 }}>
              Draw your route from <span style={{ color: "#22c55e", fontWeight: 700 }}>S</span> to <span style={{ color: "#ef4444", fontWeight: 700 }}>E</span> through the maze before time runs out. Multiple routes exist — find the shortest one to beat Argo.
            </p>
            <p style={{ margin: 0, color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>You have {GAME_TIME} seconds.</p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[["Draw", "Drag from S"], ["Find E", "Reach the end"], ["Submit", "Reveal Argo's path"]].map(([step, desc]) => (
              <div key={step} style={{ textAlign: "center" }}>
                <div style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.22)", borderRadius: 8, padding: "5px 14px", marginBottom: 4, fontWeight: 700, color: "#c9a962", fontSize: 13 }}>{step}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{desc}</div>
              </div>
            ))}
          </div>
          <button onClick={startNew} style={{ padding: "12px 44px", borderRadius: 999, border: "1.5px solid #c9a962", background: "rgba(201,169,98,0.12)", color: "#c9a962", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.04em" }}>
            Start
          </button>
        </div>
      )}

      {/* Drawing HUD */}
      {phase === "drawing" && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600 }}>
            {pathLen <= 1
              ? "Drag from the S cell to start"
              : atEnd
              ? "Reached the end — submit your route!"
              : `${pathLen - 1} steps — keep going to reach E`}
          </p>
          {atEnd && (
            <button onClick={submitPath} style={{ pointerEvents: "auto", padding: "11px 36px", borderRadius: 999, border: "1.5px solid #22c55e", background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              Reveal Argo Path
            </button>
          )}
          <button onClick={() => { playerPath.current = [START]; syncPathState(); }} style={{ pointerEvents: "auto", padding: "5px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer" }}>
            Clear path
          </button>
        </div>
      )}

      {/* Timeout overlay */}
      {phase === "timeout" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(0,0,0,0.78)" }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#ef4444", textShadow: "0 0 24px #ef444460" }}>Time's Up!</div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 15 }}>You didn't reach the exit in time. Try a different route.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={startNew} style={{ padding: "11px 32px", borderRadius: 999, border: "1.5px solid #c9a962", background: "rgba(201,169,98,0.12)", color: "#c9a962", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              New Maze
            </button>
            <button onClick={onExit} style={{ padding: "11px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer" }}>
              Games Menu
            </button>
          </div>
        </div>
      )}

      {/* Revealing banner */}
      {phase === "revealing" && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
          <p style={{ margin: 0, color: "#22c55e", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em" }}>Argo computing optimal route...</p>
        </div>
      )}

      {/* Done overlay */}
      {phase === "done" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 24px", background: "linear-gradient(to top, rgba(0,0,0,0.93) 65%, transparent)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 24, height: 4, borderRadius: 2, background: "rgba(99,179,237,0.7)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Your path</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 24, height: 4, borderRadius: 2, background: "#22c55e", boxShadow: "0 0 6px #22c55e80" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Argo optimal</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ fontSize: 26, color: i < stars ? "#facc15" : "rgba(255,255,255,0.1)", filter: i < stars ? "drop-shadow(0 0 6px #facc1580)" : "none" }}>★</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Your steps</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#60a5fa" }}>{score.player}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Argo optimal</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{score.optimal}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Efficiency</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: efficiency >= 90 ? "#22c55e" : efficiency >= 70 ? "#f59e0b" : "#ef4444" }}>{efficiency}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Time left</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#c9a962" }}>{timeLeft}s</div>
            </div>
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            {stars === 3 ? "Near-perfect — you think like a robot!" : stars === 2 ? "Good route. Argo found a slightly shorter way." : "Argo's algorithm found a much shorter path."}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={startNew} style={{ padding: "10px 28px", borderRadius: 999, border: "1.5px solid #c9a962", background: "rgba(201,169,98,0.12)", color: "#c9a962", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              New Maze
            </button>
            <button onClick={onExit} style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer" }}>
              Games Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
