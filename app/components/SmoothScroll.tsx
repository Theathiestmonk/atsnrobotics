"use client";

import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { ReactNode, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

function GSAPSync() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    gsap.registerPlugin(ScrollTrigger);
    
    // Sync GSAP's scroll updates with Lenis
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);
  
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <GSAPSync />
      {children as any}
    </ReactLenis>
  );
}
