"use client";

import { useId } from "react";
import type { ComponentId } from "../data/catalog";

// Hand-built metallic illustrations (black / gold / silver) so every part matches the ATSN palette.
// viewBox is 120 × 100; each art sits on a soft floor shadow.

export function ComponentArt({ id, className }: { id: ComponentId; className?: string }) {
  const p = useId().replace(/:/g, "");
  const S = `url(#${p}s)`; // silver
  const S2 = `url(#${p}s2)`; // darker silver
  const G = `url(#${p}g)`; // gold
  const B = `url(#${p}b)`; // black
  const GL = `url(#${p}gl)`; // gold glow

  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset="0.5" stopColor="#c9cbd0" />
          <stop offset="1" stopColor="#8d9097" />
        </linearGradient>
        <linearGradient id={`${p}s2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9bcc2" />
          <stop offset="1" stopColor="#5d6067" />
        </linearGradient>
        <linearGradient id={`${p}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e2a8" />
          <stop offset="0.5" stopColor="#c9a962" />
          <stop offset="1" stopColor="#7d5e30" />
        </linearGradient>
        <linearGradient id={`${p}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38383d" />
          <stop offset="1" stopColor="#0c0c0e" />
        </linearGradient>
        <radialGradient id={`${p}gl`}>
          <stop offset="0" stopColor="#f6e2a8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c9a962" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="88" rx="40" ry="6" fill="#000" opacity="0.45" />
      {ART[id]({ S, S2, G, B, GL })}
    </svg>
  );
}

const r2 = (n: number) => Math.round(n * 100) / 100;

type Fills = { S: string; S2: string; G: string; B: string; GL: string };

const ART: Record<ComponentId, (f: Fills) => React.ReactNode> = {
  lidar: ({ S, G, B, GL }) => (
    <>
      <ellipse cx="60" cy="68" rx="44" ry="14" fill={GL} />
      <path d="M26 50v22a34 9 0 0 0 68 0V50" fill={B} />
      <path d="M26 64a34 9 0 0 0 68 0" stroke={G} strokeWidth="3" fill="none" />
      <ellipse cx="60" cy="50" rx="34" ry="9" fill={S} />
      <path d="M40 30v20a20 5.5 0 0 0 40 0V30" fill={B} />
      <ellipse cx="60" cy="30" rx="20" ry="5.5" fill={S} />
      <rect x="49" y="37" width="22" height="7" rx="2" fill="#050506" stroke={G} strokeWidth="1" />
      <circle cx="60" cy="40.5" r="1.8" fill="#f6e2a8" />
    </>
  ),
  lidar3d: ({ S, G, B, GL }) => (
    <>
      <ellipse cx="60" cy="74" rx="40" ry="12" fill={GL} />
      <path d="M32 26v48a28 8 0 0 0 56 0V26" fill={B} />
      <ellipse cx="60" cy="26" rx="28" ry="8" fill={S} />
      <path d="M32 44a28 8 0 0 0 56 0v14a28 8 0 0 1-56 0z" fill="#050506" />
      <path d="M32 44a28 8 0 0 0 56 0" stroke={G} strokeWidth="2.5" fill="none" />
      <path d="M32 58a28 8 0 0 0 56 0" stroke={G} strokeWidth="1.2" fill="none" opacity="0.7" />
      {[40, 50, 60, 70, 80].map((x) => (
        <circle key={x} cx={x} cy={51 + Math.abs(x - 60) * -0.08} r="1.6" fill="#f6e2a8" />
      ))}
      <ellipse cx="60" cy="74" rx="28" ry="8" fill="none" stroke={S} strokeWidth="1.5" />
    </>
  ),
  depth: ({ S, G, B }) => (
    <>
      <rect x="12" y="38" width="96" height="34" rx="11" fill={B} />
      <rect x="15" y="41" width="90" height="28" rx="9" fill="#18181b" stroke={S} strokeWidth="1.2" />
      {[30, 60, 90].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy="55" r={i === 1 ? 6 : 8} fill="#050506" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="55" r={i === 1 ? 2.5 : 3.5} fill={i === 1 ? "#7d5e30" : "#2a2a33"} />
          <circle cx={cx - 2} cy="53" r="1.2" fill="#fff" opacity="0.6" />
        </g>
      ))}
      <rect x="44" y="72" width="32" height="5" rx="2" fill={G} />
      <rect x="54" y="77" width="12" height="7" fill={S} />
    </>
  ),
  rgb: ({ S, G, B }) => (
    <>
      <path d="M34 34h44l10 8v32H34z" fill={B} />
      <path d="M78 34l10 8H44l-10-8z" fill="#46464c" />
      <circle cx="60" cy="58" r="17" fill={S} />
      <circle cx="60" cy="58" r="13" fill="#050506" stroke={G} strokeWidth="2" />
      <circle cx="60" cy="58" r="6" fill="#1a1a2a" />
      <circle cx="56" cy="54" r="2.5" fill="#fff" opacity="0.55" />
      <circle cx="82" cy="48" r="2" fill="#f6e2a8" />
    </>
  ),
  imu: ({ S, G, B }) => (
    <>
      <rect x="24" y="30" width="72" height="50" rx="5" fill="#141416" stroke={S} strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={30 + i * 8} y="24" width="3" height="7" fill={G} />
          <rect x={30 + i * 8} y="79" width="3" height="7" fill={G} />
        </g>
      ))}
      <rect x="40" y="40" width="40" height="30" rx="3" fill={B} stroke={G} strokeWidth="1.5" />
      <rect x="50" y="48" width="20" height="14" rx="1.5" fill={G} />
      <path d="M53 55h14M60 50v10" stroke="#3a2c14" strokeWidth="1.2" />
    </>
  ),
  encoder: ({ S, S2, G }) => (
    <>
      <ellipse cx="60" cy="56" rx="32" ry="30" fill={S2} />
      <circle cx="60" cy="54" r="30" fill={S} />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r2(60 + Math.cos(a) * 20)}
            y1={r2(54 + Math.sin(a) * 20)}
            x2={r2(60 + Math.cos(a) * 27)}
            y2={r2(54 + Math.sin(a) * 27)}
            stroke="#1a1a1d"
            strokeWidth="2.2"
          />
        );
      })}
      <circle cx="60" cy="54" r="12" fill="#1a1a1d" stroke={G} strokeWidth="2" />
      <circle cx="60" cy="54" r="4" fill={G} />
    </>
  ),
  gps: ({ S, G, B }) => (
    <>
      <rect x="54" y="52" width="12" height="30" fill={B} />
      <rect x="40" y="78" width="40" height="7" rx="3" fill={S} />
      <path d="M30 52a30 22 0 0 1 60 0z" fill={S} />
      <ellipse cx="60" cy="52" rx="30" ry="6" fill="#d8d9dd" />
      <path d="M38 40a26 14 0 0 1 22-10" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
      <rect x="44" y="56" width="32" height="4" rx="2" fill={G} />
    </>
  ),
  ultrasonic: ({ S, S2, G }) => (
    <>
      <rect x="14" y="40" width="92" height="38" rx="4" fill="#141416" stroke={G} strokeWidth="1.2" />
      {[38, 82].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="60" rx="18" ry="18" fill={S2} />
          <circle cx={cx} cy="58" r="17" fill={S} />
          <circle cx={cx} cy="58" r="11" fill="#2a2a2e" />
          <circle cx={cx} cy="58" r="11" fill="none" stroke="#000" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        </g>
      ))}
      <rect x="54" y="44" width="12" height="8" rx="1" fill={G} />
    </>
  ),
  bumper: ({ S, G, B }) => (
    <>
      <path d="M8 46q52-22 104 0v18q-52-22-104 0z" fill={B} />
      <path d="M8 46q52-22 104 0" stroke={S} strokeWidth="2.5" fill="none" />
      <path d="M8 64q52-22 104 0" stroke={G} strokeWidth="3" fill="none" />
      <circle cx="60" cy="44" r="4" fill={G} />
    </>
  ),
  motors: ({ S, S2, G, B }) => (
    <>
      {[34, 86].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="56" rx="22" ry="26" fill={B} />
          <ellipse cx={cx + 3} cy="56" rx="18" ry="22" fill="#1d1d20" />
          <ellipse cx={cx + 5} cy="56" rx="12" ry="15" fill={S} />
          <ellipse cx={cx + 6} cy="56" rx="6" ry="7.5" fill={S2} />
          <ellipse cx={cx + 6} cy="56" rx="2.5" ry="3" fill={G} />
        </g>
      ))}
      <rect x="54" y="52" width="12" height="8" fill={G} />
    </>
  ),
  arm: ({ S, G, B }) => (
    <>
      <rect x="30" y="72" width="40" height="12" rx="3" fill={B} />
      <rect x="40" y="62" width="20" height="12" rx="2" fill={S} />
      <path d="M48 64l10-30 8 3-10 30z" fill={S} />
      <circle cx="52" cy="64" r="6" fill={G} />
      <path d="M60 36l30-6 1 8-30 6z" fill={S} />
      <circle cx="62" cy="36" r="6" fill={G} />
      <path d="M88 32l6 18-7 2-6-18z" fill={S} />
      <circle cx="90" cy="33" r="5" fill={G} />
      <path d="M88 52h10v8h-3v-4h-4v4h-3z" fill={B} />
    </>
  ),
  gripper: ({ S, G, B }) => (
    <>
      <rect x="40" y="26" width="40" height="18" rx="4" fill={B} />
      <rect x="52" y="18" width="16" height="10" rx="2" fill={S} />
      <rect x="36" y="40" width="48" height="8" rx="2" fill={G} />
      <path d="M38 48h12v18l-5 14h-7z" fill={S} />
      <path d="M82 48H70v18l5 14h7z" fill={S} />
      <path d="M44 50v16M76 50v16" stroke="#6b6e75" strokeWidth="1.5" />
    </>
  ),
  rpi: ({ S, G }) => (
    <>
      <path d="M14 46l48-16 46 16-48 18z" fill="#17171a" stroke={G} strokeWidth="1.2" />
      <path d="M14 46v6l46 18v-6z" fill="#0c0c0e" />
      <path d="M60 64v6l48-18v-6z" fill="#232327" />
      <path d="M48 42l14-5 14 5-14 5z" fill={S} />
      <path d="M30 44l6-2 4 1.5-6 2z" fill={G} />
      <path d="M80 50l14-5 6 2-14 5z" fill={S} />
      <path d="M22 47l26 9M70 34l24 8" stroke={G} strokeWidth="0.8" opacity="0.7" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={26 + i * 3.4} y={39 - i * 1.15} width="1.6" height="3" fill={G} />
      ))}
    </>
  ),
  jetson: ({ S, S2, G }) => (
    <>
      <path d="M12 52l48-18 48 18-48 18z" fill="#141416" stroke={G} strokeWidth="1.2" />
      <path d="M12 52v6l48 18v-6z" fill="#0b0b0d" />
      <path d="M60 70v6l48-18v-6z" fill="#202024" />
      <path d="M34 44l26-10 26 10-26 10z" fill={S2} />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M${38 + i * 6} ${46 - i * 2.3}v-14l3-1.1v14z`} fill={S} />
      ))}
      <path d="M34 44v-12l26-10v12z" fill="none" />
      <rect x="52" y="54" width="16" height="4" rx="1" fill={G} />
    </>
  ),
  esp32: ({ S, G }) => (
    <>
      <path d="M30 50l30-12 30 12-30 12z" fill="#17171a" stroke={G} strokeWidth="1.2" />
      <path d="M30 50v5l30 12v-5z" fill="#0c0c0e" />
      <path d="M60 62v5l30-12v-5z" fill="#232327" />
      <path d="M48 46l14-5 12 4-14 6z" fill={S} />
      <path d="M68 40l10-4 6 2-10 4z" fill={G} />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={34 + i * 3.4} y={52 + i * 1.3} width="1.6" height="3" fill={G} />
      ))}
    </>
  ),
  arduino: ({ S, G }) => (
    <>
      <path d="M18 50l42-16 42 16-42 16z" fill="#14161a" stroke={G} strokeWidth="1.2" />
      <path d="M18 50v6l42 16v-6z" fill="#0b0b0d" />
      <path d="M60 66v6l42-16v-6z" fill="#202024" />
      <path d="M26 50l12-4 10 3-12 5z" fill={S} />
      <path d="M52 48l18-6 8 3-18 6z" fill="#050506" stroke={S} strokeWidth="0.8" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={46 + i * 3.2} y={34 + i * 1.2} width="1.6" height="3" fill={G} />
      ))}
      <circle cx="84" cy="54" r="2" fill="#f6e2a8" />
    </>
  ),
  battery24: ({ S, G, B }) => (
    <>
      <path d="M22 40l38-12 38 12v36l-38 12-38-12z" fill={B} />
      <path d="M22 40l38-12 38 12-38 12z" fill="#3a3a40" />
      <path d="M60 52v36" stroke="#000" strokeWidth="1" />
      <rect x="36" y="34" width="8" height="5" rx="1" fill={G} />
      <rect x="74" y="34" width="8" height="5" rx="1" fill={S} />
      <text x="40" y="74" fontSize="11" fontWeight="700" fill="#c9a962" fontFamily="Roboto, sans-serif" transform="skewY(-17) translate(0 14)">
        24V
      </text>
    </>
  ),
  battery48: ({ S, G, B }) => (
    <>
      <path d="M16 38l44-14 44 14v40l-44 14-44-14z" fill={B} />
      <path d="M16 38l44-14 44 14-44 14z" fill="#3a3a40" />
      <path d="M60 52v40" stroke="#000" strokeWidth="1" />
      <rect x="30" y="32" width="9" height="5" rx="1" fill={G} />
      <rect x="80" y="32" width="9" height="5" rx="1" fill={S} />
      <path d="M20 58l40 13 40-13" stroke={G} strokeWidth="1.5" fill="none" opacity="0.8" />
      <text x="34" y="76" fontSize="11" fontWeight="700" fill="#c9a962" fontFamily="Roboto, sans-serif" transform="skewY(-17) translate(0 14)">
        48V
      </text>
    </>
  ),
  tray: ({ S, S2, G }) => (
    <>
      <path d="M14 56l46-18 46 18-46 18z" fill={S} />
      <path d="M14 56v8l46 18v-8z" fill={S2} />
      <path d="M60 74v8l46-18v-8z" fill="#7b7e85" />
      <path d="M24 56l36-14 36 14-36 14z" fill="#e3e4e7" stroke={G} strokeWidth="1.2" />
    </>
  ),
};
