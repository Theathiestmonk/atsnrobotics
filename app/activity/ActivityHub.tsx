"use client";

import { useState } from "react";
import { Game } from "./Game";
import { MazeGame } from "./MazeGame";

type GameId = "delivery" | "maze";

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
    detail: "BFS pathfinding · efficiency score · 3-star rating",
    color: "rgba(99,179,237,0.07)",
    border: "rgba(99,179,237,0.22)",
  },
];

export function ActivityHub() {
  const [active, setActive] = useState<GameId | null>(null);

  if (active === "delivery") return <Game onExit={() => setActive(null)} />;
  if (active === "maze") return <MazeGame onExit={() => setActive(null)} />;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#080810", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#c9a962", textTransform: "uppercase" }}>ATSN Robotics</p>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Activity Zone</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 15 }}>Choose a game and see what Argo can do.</p>
      </div>

      {/* Game cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 760 }}>
        {GAMES.map(g => (
          <div key={g.id}
            style={{ flex: "1 1 300px", maxWidth: 360, background: g.color, border: `1.5px solid ${g.border}`, borderRadius: 20, padding: "28px 28px 24px", cursor: "pointer", transition: "transform 0.15s, border-color 0.15s", position: "relative", overflow: "hidden" }}
            onClick={() => setActive(g.id)}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = g.id === "delivery" ? "rgba(201,169,98,0.55)" : "rgba(99,179,237,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = g.border; }}
          >
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: g.id === "delivery" ? "rgba(201,169,98,0.06)" : "rgba(99,179,237,0.06)", pointerEvents: "none" }} />

            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: g.id === "delivery" ? "rgba(201,169,98,0.15)" : "rgba(99,179,237,0.12)", color: g.id === "delivery" ? "#c9a962" : "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{g.tag}</span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.2rem,3vw,1.5rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{g.title}</h2>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.65 }}>{g.desc}</p>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.03em" }}>{g.detail}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: g.id === "delivery" ? "#c9a962" : "#60a5fa" }}>Play →</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 36, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>More games coming soon</p>
    </div>
  );
}
