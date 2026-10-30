"use client";

import { useEffect, useRef, useCallback, useState, FormEvent } from "react";

const LANES = 4;
const TOTAL_TABLES = 5;
const GAME_TIME = 60;
const MIN_SPEED = 2;
const MAX_SPEED = 14;
const DEFAULT_SPEED = 4;

type ObstacleType = "luggage" | "wetfloor" | "guest";
interface Obstacle { x: number; lane: number; w: number; h: number; type: ObstacleType; }
interface Table { x: number; lane: number; delivered: boolean; id: number; }
interface Particle { x: number; y: number; vx: number; vy: number; alpha: number; color: string; size: number; }
type GameState = "idle" | "playing" | "won" | "lost";

function getRating(timeLeft: number): { stars: number; label: string } {
  if (timeLeft > 38) return { stars: 3, label: "Perfect Run!" };
  if (timeLeft > 20) return { stars: 2, label: "Good Delivery!" };
  return { stars: 1, label: "Just Made It!" };
}

export function Game({ onExit }: { onExit?: () => void } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const touchY = useRef<number | null>(null);
  const sonicImg = useRef<HTMLImageElement | null>(null);
  const braking = useRef(false);

  const [uiState, setUiState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [hud, setHud] = useState({ time: GAME_TIME, deliveries: 0, speed: DEFAULT_SPEED });
  const [result, setResult] = useState({ stars: 0, label: "", time: 0, deliveries: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.src = "/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png";
    img.onload = () => { sonicImg.current = img; };
  }, []);

  const G = useRef({
    cw: 0, ch: 0, laneH: 0,
    robotX: 0, robotY: 0, targetLane: 1,
    scrollX: 0, speed: DEFAULT_SPEED, manualSpeed: DEFAULT_SPEED,
    obstacles: [] as Obstacle[], tables: [] as Table[], particles: [] as Particle[],
    timeLeft: GAME_TIME, deliveries: 0,
    state: "idle" as GameState,
    lastObstacleSpawn: 0, nextTableX: 0, tableCount: 0,
    lastTime: 0, deliveryFlash: 0, bgOffset: 0,
  });

  const laneY = useCallback((lane: number) => {
    return G.current.laneH * lane + G.current.laneH / 2;
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      const spd = 2 + Math.random() * 4;
      G.current.particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, alpha: 1, color, size: 3 + Math.random() * 5 });
    }
  }, []);

  const resetGame = useCallback(() => {
    const g = G.current;
    g.targetLane = 1; g.robotY = laneY(1);
    g.scrollX = 0; g.speed = DEFAULT_SPEED; g.manualSpeed = DEFAULT_SPEED;
    g.obstacles = []; g.tables = []; g.particles = [];
    g.timeLeft = GAME_TIME; g.deliveries = 0; g.state = "playing";
    g.lastObstacleSpawn = 0; g.nextTableX = g.cw + 500; g.tableCount = 0;
    g.lastTime = performance.now(); g.deliveryFlash = 0; g.bgOffset = 0;
    braking.current = false;
    setUiState("playing");
    setHud({ time: GAME_TIME, deliveries: 0, speed: DEFAULT_SPEED });
  }, [laneY]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const g = G.current;
    if (e.code === "Space" || e.code === "Enter") {
      if (g.state !== "playing") return;
      e.preventDefault();
    }
    if (g.state !== "playing") return;
    if ((e.code === "ArrowUp" || e.code === "KeyW") && g.targetLane > 0) { g.targetLane--; e.preventDefault(); }
    if ((e.code === "ArrowDown" || e.code === "KeyS") && g.targetLane < LANES - 1) { g.targetLane++; e.preventDefault(); }
    if (e.code === "ArrowRight" || e.code === "Equal") g.manualSpeed = Math.min(MAX_SPEED, g.manualSpeed + 1);
    if (e.code === "ArrowLeft" || e.code === "Minus") g.manualSpeed = Math.max(MIN_SPEED, g.manualSpeed - 1);
    if (e.code === "KeyB" || e.code === "ShiftLeft") braking.current = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "KeyB" || e.code === "ShiftLeft") braking.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("keyup", handleKeyUp); };
  }, [handleKey, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;
    const g = G.current;

    function resize() {
      canvas!.width = container!.clientWidth;
      canvas!.height = container!.clientHeight;
      g.cw = canvas!.width; g.ch = canvas!.height;
      g.laneH = g.ch / LANES;
      g.robotX = g.cw * 0.13;
      if (g.state === "idle") g.robotY = laneY(1);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function drawCorridor() {
      const { cw, ch, bgOffset } = g;
      ctx.fillStyle = "#0d0d10";
      ctx.fillRect(0, 0, cw, ch);
      const tw = 100;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      const ox = bgOffset % tw;
      for (let x = -ox; x < cw + tw; x += tw) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
      }
      for (let i = 0; i <= LANES; i++) {
        const y = i * g.laneH;
        ctx.strokeStyle = (i === 0 || i === LANES) ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.05)";
        ctx.lineWidth = (i === 0 || i === LANES) ? 2 : 1;
        ctx.setLineDash(i === 0 || i === LANES ? [] : [22, 16]);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
      }
      ctx.setLineDash([]);
      // walls
      const wg1 = ctx.createLinearGradient(0, 0, 0, 20);
      wg1.addColorStop(0, "rgba(201,169,98,0.1)"); wg1.addColorStop(1, "transparent");
      ctx.fillStyle = wg1; ctx.fillRect(0, 0, cw, 20);
      const wg2 = ctx.createLinearGradient(0, ch - 20, 0, ch);
      wg2.addColorStop(0, "transparent"); wg2.addColorStop(1, "rgba(201,169,98,0.1)");
      ctx.fillStyle = wg2; ctx.fillRect(0, ch - 20, cw, 20);
    }

    function drawObstacle(o: Obstacle) {
      const sx = o.x - g.scrollX;
      if (sx < -120 || sx > g.cw + 80) return;
      const sy = laneY(o.lane);
      const sc = g.laneH / 110;
      ctx.save(); ctx.translate(sx, sy);
      if (o.type === "luggage") {
        ctx.fillStyle = "#6b5e4e";
        ctx.beginPath(); ctx.roundRect(-o.w / 2, -o.h / 2 + 4, o.w, o.h - 10, 6); ctx.fill();
        ctx.strokeStyle = "#4a3f31"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = "#8a7b6a"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-o.w / 2 + 6, -o.h / 2 + 4); ctx.lineTo(-o.w / 2 + 6, -o.h / 2 - 10);
        ctx.lineTo(o.w / 2 - 6, -o.h / 2 - 10); ctx.lineTo(o.w / 2 - 6, -o.h / 2 + 4); ctx.stroke();
        ctx.fillStyle = "#333";
        [-o.w / 2 + 8, o.w / 2 - 8].forEach(wx => { ctx.beginPath(); ctx.ellipse(wx, o.h / 2 - 6, 5 * sc, 4 * sc, 0, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `bold ${Math.max(8, o.w * 0.16)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("BAG", 0, 3);
      } else if (o.type === "wetfloor") {
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.moveTo(0, -o.h / 2); ctx.lineTo(o.w / 2, o.h / 2); ctx.lineTo(-o.w / 2, o.h / 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#0a0a0b"; ctx.font = `bold ${Math.max(9, o.w * 0.24)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("!", 0, o.h / 4);
        ctx.font = `${Math.max(6, o.w * 0.14)}px sans-serif`; ctx.fillText("WET", 0, o.h / 2 - 5);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(0, o.h / 2, 12 * sc, 4 * sc, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.roundRect(-11 * sc, -o.h / 4, 22 * sc, o.h * 0.6, 5 * sc); ctx.fill();
        ctx.fillStyle = "#f8d7a0"; ctx.beginPath(); ctx.arc(0, -o.h / 2 + 12 * sc, 10 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5a3e28"; ctx.beginPath(); ctx.arc(0, -o.h / 2 + 9 * sc, 10 * sc, Math.PI, 0); ctx.fill();
      }
      ctx.restore();
    }

    function drawTable(t: Table) {
      const sx = t.x - g.scrollX;
      if (sx < -80 || sx > g.cw + 80) return;
      const sy = laneY(t.lane);
      const tw2 = g.laneH * 0.7, th = g.laneH * 0.55;
      ctx.save(); ctx.translate(sx, sy);
      if (!t.delivered) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 280);
        ctx.shadowColor = "rgba(201,169,98,0.8)"; ctx.shadowBlur = 20 * pulse;
      }
      ctx.fillStyle = t.delivered ? "rgba(34,197,94,0.2)" : "rgba(201,169,98,0.1)";
      ctx.strokeStyle = t.delivered ? "rgba(34,197,94,0.8)" : "rgba(201,169,98,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-tw2 / 2, -th / 2, tw2, th, 10); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      if (!t.delivered) {
        ctx.strokeStyle = "rgba(201,169,98,0.35)"; ctx.lineWidth = 1.5;
        [[-tw2 / 2 + 8, th / 2], [tw2 / 2 - 8, th / 2]].forEach(([lx, ly]) => {
          ctx.beginPath(); ctx.moveTo(lx, -th / 2 + 4); ctx.lineTo(lx, ly); ctx.stroke();
        });
      }
      ctx.textAlign = "center";
      if (t.delivered) {
        ctx.fillStyle = "#22c55e"; ctx.font = `bold ${Math.max(14, tw2 * 0.3)}px sans-serif`; ctx.fillText("✓", 0, 6);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `bold ${Math.max(10, tw2 * 0.2)}px sans-serif`; ctx.fillText(`TABLE ${t.id}`, 0, -4);
        ctx.fillStyle = "rgba(201,169,98,0.7)"; ctx.font = `${Math.max(8, tw2 * 0.15)}px sans-serif`; ctx.fillText("deliver here", 0, 11);
      }
      ctx.restore();
    }

    function drawRobot() {
      const { robotX: rx, robotY: ry, deliveryFlash, speed, manualSpeed } = g;
      const brakeOn = braking.current;
      const dflash = deliveryFlash > 0;
      const imgH = g.laneH * 0.84;
      const imgW = sonicImg.current ? (sonicImg.current.naturalWidth / sonicImg.current.naturalHeight) * imgH : imgH * 0.55;
      ctx.save(); ctx.translate(rx, ry);
      ctx.shadowColor = brakeOn ? "rgba(239,68,68,0.7)" : dflash ? "rgba(34,197,94,0.9)" : "rgba(201,169,98,0.5)";
      ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.ellipse(0, imgH * 0.42, imgW * 0.38, imgH * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = brakeOn ? "rgba(239,68,68,0.2)" : "rgba(201,169,98,0.15)"; ctx.fill(); ctx.shadowBlur = 0;
      if (dflash) ctx.filter = "brightness(1.4) saturate(0) sepia(1) hue-rotate(80deg)";
      if (brakeOn) ctx.filter = "brightness(0.7) sepia(1) hue-rotate(320deg)";
      if (sonicImg.current) ctx.drawImage(sonicImg.current, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.filter = "none";
      // speed trail lines when fast
      if (speed > 8) {
        ctx.globalAlpha = (speed - 8) / (MAX_SPEED - 8) * 0.5;
        ctx.strokeStyle = "#c9a962"; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const trailX = -imgW / 2 - 10 - i * 14;
          const trailY = -imgH * 0.2 + i * (imgH * 0.2);
          ctx.beginPath(); ctx.moveTo(trailX, trailY); ctx.lineTo(trailX - 20, trailY); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      if (playerName) {
        ctx.filter = "none"; ctx.globalAlpha = 1;
        const fs = Math.max(10, g.laneH * 0.13);
        ctx.font = `bold ${fs}px sans-serif`; ctx.textAlign = "center";
        const tw = ctx.measureText(playerName).width + 14;
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.beginPath(); ctx.roundRect(-tw / 2, -imgH / 2 - 24, tw, 18, 5); ctx.fill();
        ctx.fillStyle = "#c9a962"; ctx.fillText(playerName, 0, -imgH / 2 - 10);
      }
      ctx.restore();
    }

    function drawParticles() {
      g.particles.forEach(p => { ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
    }

    function tick(ts: number) {
      const dt = Math.min(ts - g.lastTime, 50);
      g.lastTime = ts;

      if (g.state !== "playing") {
        drawCorridor(); drawParticles(); rafRef.current = requestAnimationFrame(tick); return;
      }

      g.timeLeft -= dt / 1000;
      if (g.timeLeft <= 0) {
        g.timeLeft = 0; g.state = "lost";
        setUiState("lost");
        setResult({ stars: 0, label: "Time's Up!", time: 0, deliveries: g.deliveries });
        drawCorridor(); drawParticles();
        rafRef.current = requestAnimationFrame(tick); return;
      }

      // speed: manual control + optional brake
      const targetSpeed = braking.current ? Math.max(MIN_SPEED, g.manualSpeed * 0.3) : g.manualSpeed;
      g.speed += (targetSpeed - g.speed) * 0.12;
      g.bgOffset += g.speed; g.scrollX += g.speed;

      const targetY = laneY(g.targetLane);
      g.robotY += (targetY - g.robotY) * 0.15;
      g.deliveryFlash = Math.max(0, g.deliveryFlash - dt);

      // obstacle spawn — interval based on speed
      g.lastObstacleSpawn += g.speed;
      const spawnInt = Math.max(130, 480 - g.speed * 22);
      if (g.lastObstacleSpawn >= spawnInt) {
        g.lastObstacleSpawn = 0;
        const types: ObstacleType[] = ["luggage", "wetfloor", "guest"];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * LANES);
        const sc = g.laneH / 110;
        const w = (type === "luggage" ? 54 : type === "wetfloor" ? 36 : 28) * sc;
        const h = (type === "luggage" ? 44 : type === "wetfloor" ? 54 : 62) * sc;
        g.obstacles.push({ x: g.scrollX + g.cw + 80, lane, w, h, type });
      }
      g.obstacles = g.obstacles.filter(o => o.x - g.scrollX > -120);

      // spawn tables
      if (g.tableCount < TOTAL_TABLES && g.scrollX + g.cw * 0.75 >= g.nextTableX) {
        g.tableCount++;
        g.tables.push({ x: g.nextTableX + g.cw * 0.5, lane: Math.floor(Math.random() * LANES), delivered: false, id: g.tableCount });
        g.nextTableX += g.cw * 0.85 + 350;
      }

      // particles
      g.particles = g.particles.filter(p => p.alpha > 0.02);
      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.025; p.size *= 0.97; });

      // collision
      const sc2 = g.laneH / 110;
      const rw = 56 * sc2, rh = 34 * sc2;
      for (const o of g.obstacles) {
        const ox = o.x - g.scrollX, oy = laneY(o.lane);
        if (Math.abs(g.robotX - ox) < (rw / 2 + o.w / 2) * 0.7 && Math.abs(g.robotY - oy) < (rh / 2 + o.h / 2) * 0.65) {
          spawnParticles(g.robotX, g.robotY, "#ef4444");
          g.state = "lost";
          setUiState("lost");
          setResult({ stars: 0, label: "Delivery Failed!", time: 0, deliveries: g.deliveries });
          drawCorridor(); drawParticles();
          rafRef.current = requestAnimationFrame(tick); return;
        }
      }

      // delivery
      for (const t of g.tables) {
        if (!t.delivered) {
          const tx = t.x - g.scrollX, ty = laneY(t.lane);
          const dw = g.laneH * 0.7, dh = g.laneH * 0.55;
          if (Math.abs(g.robotX - tx) < dw / 2 + rw * 0.4 && Math.abs(g.robotY - ty) < dh / 2 + rh * 0.4) {
            t.delivered = true; g.deliveries++; g.deliveryFlash = 300;
            spawnParticles(tx, ty, "#22c55e");
            if (g.deliveries >= TOTAL_TABLES) {
              const r = getRating(g.timeLeft);
              g.state = "won";
              setUiState("won");
              setResult({ stars: r.stars, label: r.label, time: Math.ceil(g.timeLeft), deliveries: g.deliveries });
              drawCorridor(); g.tables.forEach(drawTable); drawParticles();
              rafRef.current = requestAnimationFrame(tick); return;
            }
          }
        }
      }

      setHud({ time: Math.ceil(g.timeLeft), deliveries: g.deliveries, speed: Math.round(g.speed * 10) / 10 });

      drawCorridor();
      g.tables.forEach(drawTable);
      g.obstacles.forEach(drawObstacle);
      drawRobot();
      drawParticles();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [laneY, spawnParticles, playerName]);

  const handleSwipe = useCallback((dir: "up" | "down") => {
    const g = G.current;
    if (g.state !== "playing") return;
    if (dir === "up" && g.targetLane > 0) g.targetLane--;
    if (dir === "down" && g.targetLane < LANES - 1) g.targetLane++;
  }, []);

  const changeSpeed = useCallback((delta: number) => {
    const g = G.current;
    g.manualSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, g.manualSpeed + delta));
  }, []);

  const handleStart = useCallback((e?: FormEvent) => {
    e?.preventDefault();
    setPlayerName(nameInput.trim());
    resetGame();
  }, [nameInput, resetGame]);

  const speedPct = Math.round(((hud.speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100);

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, background: "#0d0d10", fontFamily: "system-ui, sans-serif" }}
      onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        if (touchY.current === null) return;
        const dy = e.changedTouches[0].clientY - touchY.current;
        if (Math.abs(dy) > 20) handleSwipe(dy < 0 ? "up" : "down");
        touchY.current = null;
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* ── HUD ── */}
      {uiState === "playing" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 20px", display: "flex", alignItems: "center", gap: 20, background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)", pointerEvents: "none" }}>
          {/* Timer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Time</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: hud.time > 20 ? "#fff" : hud.time > 10 ? "#f59e0b" : "#ef4444", fontVariantNumeric: "tabular-nums" }}>{hud.time}s</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${(hud.time / GAME_TIME) * 100}%`, background: hud.time > 20 ? "#22c55e" : hud.time > 10 ? "#f59e0b" : "#ef4444", transition: "width 0.5s linear, background 0.3s" }} />
            </div>
          </div>

          {/* Deliveries */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Deliveries</span>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: TOTAL_TABLES }).map((_, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < hud.deliveries ? "#22c55e" : "rgba(255,255,255,0.12)", border: i < hud.deliveries ? "none" : "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                  {i < hud.deliveries && <span style={{ fontSize: 8, color: "#fff", fontWeight: 800 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Speed meter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Speed</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: hud.speed > 10 ? "#f59e0b" : "#fff", fontVariantNumeric: "tabular-nums" }}>{hud.speed.toFixed(1)}x</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${speedPct}%`, background: speedPct > 75 ? "#f59e0b" : "#3b82f6", transition: "width 0.15s, background 0.2s" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Idle screen ── */}
      {uiState === "idle" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {onExit && <button onClick={onExit} style={{ position: "absolute", top: 16, right: 20, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Games</button>}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#c9a962", textTransform: "uppercase", margin: "0 0 8px" }}>ATSN Robotics</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Argo Delivery Run</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0 }}>Dodge obstacles. Deliver to 5 tables. Beat the clock.</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 40, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {[["↑ ↓", "Switch lane"], ["+ −", "Speed up / down"], ["B / Shift", "Brake"]].map(([key, label]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px", marginBottom: 5, fontWeight: 700, color: "#fff", fontSize: 14 }}>{key}</div>
                <div style={{ fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleStart} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <input
              type="text" placeholder="Your name (optional)" value={nameInput}
              onChange={e => setNameInput(e.target.value)} maxLength={20} autoComplete="off"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "10px 20px", color: "#fff", fontSize: 15, textAlign: "center", outline: "none", width: 240 }}
            />
            <button type="submit" style={{ padding: "12px 40px", borderRadius: 999, border: "1.5px solid #c9a962", background: "rgba(201,169,98,0.15)", color: "#c9a962", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em" }}>
              Start Game
            </button>
          </form>
        </div>
      )}

      {/* ── Win screen ── */}
      {uiState === "won" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.78)" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#22c55e", textTransform: "uppercase" }}>All Deliveries Complete</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              {playerName ? `Well done, ${playerName}!` : "Perfect Delivery!"}
            </h2>
            <div style={{ display: "flex", gap: 8, margin: "4px 0" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: i < result.stars ? "#facc15" : "rgba(255,255,255,0.15)", filter: i < result.stars ? "drop-shadow(0 0 8px #facc1580)" : "none", transition: "all 0.3s" }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 600 }}>{result.label}</p>
            <div style={{ display: "flex", gap: 24, margin: "4px 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Time left</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{result.time}s</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Deliveries</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{result.deliveries}/{TOTAL_TABLES}</div>
              </div>
            </div>
            <button onClick={resetGame} style={{ marginTop: 8, padding: "12px 36px", borderRadius: 999, border: "1.5px solid #22c55e", background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em" }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* ── Lost screen ── */}
      {uiState === "lost" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.78)" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✕</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#ef4444", margin: 0, letterSpacing: "-0.02em" }}>{result.label}</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: 0 }}>
              {result.deliveries > 0 ? `Delivered ${result.deliveries} of ${TOTAL_TABLES} tables.` : "No deliveries made."}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button onClick={resetGame} style={{ padding: "12px 36px", borderRadius: 999, border: "1.5px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                Try Again
              </button>
              <button onClick={() => setUiState("idle")} style={{ padding: "12px 24px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Playing controls ── */}
      {uiState === "playing" && (
        <div style={{ position: "absolute", bottom: 24, right: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {/* Lane controls */}
          <div style={{ display: "flex", gap: 8 }}>
            {[["↑", "up"], ["↓", "down"]].map(([arrow, dir]) => (
              <button key={dir} onPointerDown={e => { e.preventDefault(); handleSwipe(dir as "up" | "down"); }}
                style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 20, cursor: "pointer", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {arrow}
              </button>
            ))}
          </div>
          {/* Speed controls */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onPointerDown={e => { e.preventDefault(); changeSpeed(-1); }}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.12)", color: "#60a5fa", fontSize: 22, cursor: "pointer", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              −
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", minWidth: 32, textAlign: "center" }}>SPEED</span>
            <button onPointerDown={e => { e.preventDefault(); changeSpeed(1); }}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.12)", color: "#60a5fa", fontSize: 22, cursor: "pointer", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              +
            </button>
          </div>
          {/* Brake */}
          <button
            onPointerDown={e => { e.preventDefault(); braking.current = true; }}
            onPointerUp={() => { braking.current = false; }}
            onPointerLeave={() => { braking.current = false; }}
            style={{ padding: "10px 22px", borderRadius: 999, border: "1.5px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 13, fontWeight: 800, cursor: "pointer", backdropFilter: "blur(8px)", letterSpacing: "0.08em", userSelect: "none" }}>
            BRAKE
          </button>
        </div>
      )}
    </div>
  );
}
