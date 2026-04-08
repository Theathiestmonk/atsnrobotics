"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

export type CardSwapItem = {
  id: string;
  kicker?: string;
  title: string;
  body: string;
  pills?: string[];
};

type CardSwapProps = {
  items: CardSwapItem[];
  className?: string;
  /** Autoplay swaps while the section is in view */
  autoPlay?: boolean;
  /** ScrollTrigger: start position */
  start?: string;
};

export function CardSwap({ items, className, autoPlay = true, start = "top 75%" }: CardSwapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);

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
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? (stMod as any).default ?? stMod;
      gsap.registerPlugin(ScrollTrigger);

      if (!mounted) return;

      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-cardswap-card]"));
      const dots = Array.from(el.querySelectorAll<HTMLElement>("[data-cardswap-dot]"));
      if (cards.length === 0) return;

      let internalIdx = 0;

      const show = (i: number) => {
        const idx = ((i % cards.length) + cards.length) % cards.length;
        const isMobile = window.matchMedia("(max-width: 900px)").matches;
        internalIdx = idx;
        setActiveIndex(idx);

        cards.forEach((c, ci) => {
          const isActive = ci === idx;
          c.style.pointerEvents = isActive ? "auto" : "none";
          c.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
        dots.forEach((d, di) => d.setAttribute("data-active", di === idx ? "true" : "false"));

        gsap.to(cards, {
          opacity: (ci: number) => (ci === idx ? 1 : 0),
          y: (ci: number) => (isMobile ? 0 : (ci === idx ? 0 : 10)),
          filter: "none", // Remove blur entirely to fix "blurry type" issue
          duration: isMobile ? 0.35 : 0.5,
          ease: "power2.out",
          overwrite: true,
        });
      };

      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0, y: 10 });
        show(0);

        const trigger = ScrollTrigger.create({
          trigger: el,
          start,
          end: "bottom 35%",
          onEnter: () => show(internalIdx),
        });

        let intervalId: number | undefined;
        let isMobile = false;
        if (typeof window !== "undefined") {
          isMobile = window.matchMedia("(max-width: 900px)").matches;
        }

        const startInterval = () => {
          if (!autoPlay || cards.length <= 1 || isMobile) return;
          if (intervalId) window.clearInterval(intervalId);
          intervalId = window.setInterval(() => show((internalIdx + 1) % cards.length), 3200);
        };

        const stopInterval = () => {
          if (intervalId) window.clearInterval(intervalId);
          intervalId = undefined;
        };

        ScrollTrigger.create({
          trigger: el,
          start,
          end: "bottom 35%",
          onEnter: () => startInterval(),
          onEnterBack: () => startInterval(),
          onLeave: () => stopInterval(),
          onLeaveBack: () => stopInterval(),
        });

        // Hover to pause
        el.addEventListener("mouseenter", stopInterval);
        el.addEventListener("mouseleave", startInterval);

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        const handleTouchStart = (e: TouchEvent) => {
          touchStartX = e.changedTouches[0].screenX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
          touchEndX = e.changedTouches[0].screenX;
          const deltaX = touchStartX - touchEndX;
          if (Math.abs(deltaX) > 40) {
            if (deltaX > 0) {
              // swipe left (next)
              show(internalIdx + 1);
            } else {
              // swipe right (prev)
              show(internalIdx - 1);
            }
            startInterval();
          }
        };

        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });

        // Clickable dots
        dots.forEach((d, i) => {
          d.addEventListener("click", () => {
            show(i);
            startInterval();
          });
        });

        return () => {
          stopInterval();
          trigger?.kill?.();
          el.removeEventListener("mouseenter", stopInterval);
          el.removeEventListener("mouseleave", startInterval);
          el.removeEventListener("touchstart", handleTouchStart);
          el.removeEventListener("touchend", handleTouchEnd);
          dots.forEach((d, i) => {
            d.replaceWith(d.cloneNode(true));
          });
        };
      }, el);
    })();

    return () => {
      mounted = false;
      ctx?.revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, safeItems.length, start]);

  return (
    <div ref={rootRef} className={className}>
      <div className="cardSwap">
        <div className="cardSwap__stack" role="region" aria-label="Feature highlights">
          {safeItems.map((item, idx) => (
            <article
              key={item.id}
              data-cardswap-card
              className="atsnCard cardSwap__card"
              aria-hidden={idx === 0 ? "false" : "true"}
            >
              {item.kicker ? <p className="atsnCard__kicker">{item.kicker}</p> : null}
              <h3 className="atsnCard__title">{item.title}</h3>
              <p className="atsnCard__body">{item.body}</p>
              {item.pills?.length ? (
                <div className="atsnCard__meta" aria-label="Key traits">
                  {item.pills.map((p) => (
                    <span key={p} className="atsnPill">
                      <span className="atsnPill__dot" aria-hidden="true" />
                      {p}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="cardSwap__dots" aria-label="Swap cards">
          {safeItems.map((i, idx) => (
            <button
              key={i.id}
              type="button"
              data-cardswap-dot
              className="cardSwap__dot"
              aria-label={`Show ${i.title}`}
              aria-pressed={activeIndex === idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

