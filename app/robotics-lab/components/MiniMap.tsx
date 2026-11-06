import type { EnvId } from "../data/catalog";
import { ENVIRONMENTS } from "../data/environments";

// Top-down blueprint thumbnail of an environment with the start → goal route marker.
export function MiniMap({ env, className }: { env: EnvId; className?: string }) {
  const e = ENVIRONMENTS[env];
  return (
    <svg viewBox={`-0.4 -0.4 ${e.w + 0.8} ${e.h + 0.8}`} className={className} aria-hidden="true">
      <defs>
        <pattern id={`mm-grid-${env}`} width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0H0V1" fill="none" stroke="rgba(201,169,98,0.10)" strokeWidth="0.03" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={e.w} height={e.h} fill="#0d0d0f" />
      <rect x="0" y="0" width={e.w} height={e.h} fill={`url(#mm-grid-${env})`} />
      {e.obstacles.map((o, i) =>
        o.kind === "rect" ? (
          <rect
            key={i}
            x={o.x}
            y={o.y}
            width={o.w}
            height={o.h}
            rx={o.style === "wall" ? 0 : 0.08}
            fill={o.style === "wall" ? "#55575d" : o.style === "rack" ? "#2a2a2e" : "#8a7350"}
            stroke={o.style === "rack" ? "#c9a962" : "none"}
            strokeWidth="0.06"
          />
        ) : (
          <circle key={i} cx={o.x} cy={o.y} r={o.r} fill="#3a3a3f" stroke="#a7a9ae" strokeWidth="0.05" />
        ),
      )}
      <path
        d={`M${e.start.x} ${e.start.y} L${e.goal.x} ${e.goal.y}`}
        stroke="#f6e2a8"
        strokeWidth="0.12"
        strokeDasharray="0.35 0.3"
        opacity="0.5"
      />
      <circle cx={e.start.x} cy={e.start.y} r="0.45" fill="none" stroke="#e8e8ea" strokeWidth="0.12" />
      <circle cx={e.goal.x} cy={e.goal.y} r="0.5" fill="#c9a962" />
      <circle cx={e.goal.x} cy={e.goal.y} r="0.9" fill="none" stroke="#c9a962" strokeWidth="0.08" opacity="0.6" />
    </svg>
  );
}
