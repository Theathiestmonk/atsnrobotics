"use client";

import { PropsWithChildren, useLayoutEffect, useRef } from "react";

type ScrollRevealProps = PropsWithChildren<{
  className?: string;
  once?: boolean;
  start?: string; // ScrollTrigger start
}>;

export function ScrollReveal({ children, className, once = true, start = "top 86%" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;

    (async () => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (prefersReduced) return;

      const el = ref.current;
      if (!el) return;

      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? (stMod as any).default ?? stMod;

      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 18, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
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
    <div ref={ref} className={className} style={{ willChange: "transform, opacity, filter" }}>
      {children}
    </div>
  );
}

