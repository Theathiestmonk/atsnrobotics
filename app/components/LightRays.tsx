"use client";

import { useEffect, useRef } from "react";

type LightRaysProps = {
  className?: string;
  intensity?: number; // 0..1
};

/** Soft depth lighting — charcoal + warm neutral (matches home hero, not cyan). */
export function LightRays({ className, intensity = 0.85 }: LightRaysProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--lr-intensity", String(Math.max(0, Math.min(1, intensity))));
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-20%",
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(700px 420px at 18% 16%, rgba(255, 255, 255, calc(var(--lr-intensity, 0.85) * 0.05)) 0%, rgba(255, 255, 255, 0) 58%)," +
          "radial-gradient(620px 380px at 72% 18%, rgba(201, 169, 98, calc(var(--lr-intensity, 0.85) * 0.09)) 0%, rgba(201, 169, 98, 0) 55%)," +
          "conic-gradient(from 210deg at 50% 35%, rgba(255, 255, 255, calc(var(--lr-intensity, 0.85) * 0.04)), rgba(255, 255, 255, 0) 38%, rgba(18, 18, 20, calc(var(--lr-intensity, 0.85) * 0.15)) 62%, rgba(255, 255, 255, 0) 82%)",
        filter: "blur(28px)",
        opacity: 1,
        transform: "translate3d(0,0,0)",
        animation: "lightRaysFloat 10s ease-in-out infinite",
      }}
    />
  );
}
