"use client";

import type React from "react";
import { useLayoutEffect, useMemo, useRef } from "react";

type BlurTextProps = {
  text: string;
  as?: React.ElementType;
  className?: string;
  stagger?: number;
};

export function BlurText({
  text,
  as: Tag = "h1",
  className,
  stagger = 0.018,
}: BlurTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const words = useMemo(() => {
    // Keep punctuation attached to the preceding token for nicer rhythm.
    return text.split(" ").filter(Boolean);
  }, [text]);

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;
    (async () => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (prefersReduced) return;

      const el = rootRef.current;
      if (!el) return;

      const gsapMod = await import("gsap");
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;

      if (!mounted) return;

      const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-blur-word]"));
      ctx = gsap.context(() => {
        gsap.set(spans, { opacity: 0, y: 14, filter: "blur(10px)" });
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power3.out",
          duration: 0.9,
          stagger,
          delay: 0.05,
        });
      }, el);
    })();

    return () => {
      mounted = false;
      ctx?.revert?.();
    };
  }, [stagger, text]);

  return (
    <Tag ref={rootRef as any} className={className}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          data-blur-word
          style={{
            display: "inline-block",
            marginRight: i === words.length - 1 ? 0 : "0.28em",
            willChange: "transform, opacity, filter",
          }}
        >
          {w}
        </span>
      ))}
    </Tag>
  );
}

