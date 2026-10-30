"use client";

import { useState } from "react";
import { Game } from "./Game";
import { MazeGame } from "./MazeGame";
import { ProgramGame } from "./ProgramGame";

type GameId = "delivery" | "maze" | "program";

const GAMES: { id: GameId; title: string; tag: string; desc: string; detail: string; color: string; border: string }[] = [
  {
    id: "delivery",
    title: "Argo Delivery Run",
    tag: "Obstacle Dodge",
    desc: "Steer Argo Sonic through a hotel corridor, dodge luggage carts, wet floor signs and guests, and deliver orders to every table before time runs out.",
    detail: "4 lanes · 5 deliveries · speed controls",
    color: "rgba(201,169,98,0.08)",
    border: "rgba(201,169,98,0.25)",
  },
  {
    id: "maze",
    title: "Shortest Path Challenge",
    tag: "Smart Navigation",
    desc: "Draw your route through a maze from start to end — then watch Argo reveal the algorithmically optimal path it would have chosen. How close can you get?",
    detail: "BFS pathfinding · efficiency score · 45s timer",
    color: "rgba(99,179,237,0.07)",
    border: "rgba(99,179,237,0.22)",
  },
  {
    id: "program",
    title: "Program the Robot",
    tag: "Code & Logic",
    desc: "Stack Forward, Turn Left, and Turn Right commands to build a program — then press Run and watch Argo execute your instructions step by step. Can you reach every delivery point?",
    detail: "5 levels · 12 commands · real robot logic",
    color: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.22)",
  },
];

export function ActivityHub() {
  const [active, setActive] = useState<GameId | null>(null);

  if (active === "delivery") return <Game onExit={() => setActive(null)} />;
  if (active === "maze") return <MazeGame onExit={() => setActive(null)} />;
  if (active === "program") return <ProgramGame onExit={() => setActive(null)} />;

  const accentColor = (id: GameId) =>
    id === "delivery" ? "#c9a962" : id === "maze" ? "#60a5fa" : "#a78bfa";
  const hoverBorder = (id: GameId) =>
    id === "delivery" ? "rgba(201,169,98,0.55)" : id === "maze" ? "rgba(99,179,237,0.5)" : "rgba(167,139,250,0.5)";

  return (
    <>
      <style>{`
        .hub-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .hub-scroll::-webkit-scrollbar { display: none; }
        .game-card { transition: transform 0.15s, border-color 0.15s; }
        .game-card:active { transform: scale(0.97); }
        @media (hover: hover) {
          .game-card:hover { transform: translateY(-3px); }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, background: "#080810", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

        {/* Header — compact */}
        <div style={{ flexShrink: 0, textAlign: "center", padding: "20px 16px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#c9a962", textTransform: "uppercase" }}>ATSN Robotics</p>
          <h1 style={{ margin: "0 0 4px", fontSize: "clamp(1.5rem,6vw,2.4rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Activity Zone</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Choose a game and see what Argo can do.</p>
        </div>

        {/* Cards — scrollable, compact on mobile */}
        <div className="hub-scroll" style={{ flex: 1, padding: "8px 14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {GAMES.map(g => (
            <div key={g.id} className="game-card"
              style={{ background: g.color, border: `1.5px solid ${g.border}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }}
              onClick={() => setActive(g.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = hoverBorder(g.id); }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = g.border; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                {/* Left: text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: g.id === "delivery" ? "rgba(201,169,98,0.15)" : g.id === "maze" ? "rgba(99,179,237,0.12)" : "rgba(167,139,250,0.12)", color: accentColor(g.id), fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{g.tag}</span>
                  <h2 style={{ margin: "0 0 5px", fontSize: "clamp(1rem,4vw,1.25rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{g.title}</h2>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.55 }}>{g.desc}</p>
                </div>
                {/* Right: play arrow */}
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, border: `1.5px solid ${g.border}`, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: accentColor(g.id) }}>→</span>
                </div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.03em" }}>{g.detail}</span>
              </div>
            </div>
          ))}

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.15)", margin: "6px 0 0" }}>More games coming soon</p>
        </div>
      </div>
    </>
  );
}
