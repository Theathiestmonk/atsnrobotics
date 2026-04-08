"use client";

import { PropsWithChildren, useLayoutEffect, useRef } from "react";

type ScrollRevealProps = PropsWithChildren<{
  className?: string;
  once?: boolean;
  start?: string; // ScrollTrigger start
}>;

export function ScrollReveal({ children, className, once = true, start = "top 88%" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;

    (async () => {
      // Check for mobile or reduced motion preference
      const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
      const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      
      if (!mounted) return;

      const el = ref.current;
      if (!el) return;

      // If mobile, don't do reveal animations to speed up content loading as requested
      if (isMobile || prefersReduced) {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.filter = "none";
        return;
      }

      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? (stMod as any).default ?? stMod;

      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 15, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: once ? "play none none none" : "play reverse play reverse",
            },
          },
        );
      }, el);
    })();

    return () => {
      mounted = false;
      ctx?.revert?.();
    };
  }, [once, start]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
