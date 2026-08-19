"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Glass cards row */
const HERO_GLASS_MS = 8500;

type GlassCardData = {
  id: string;
  href: string;
  featured?: boolean;
  title?: string;
  headline?: [string, string];
  body: string | string[];
  images?: { src: string; alt: string }[];
  watermark?: string;
};

const GLASS_CARDS: GlassCardData[] = [
  {
    id: "hotels-hospitality",
    href: "/luxury",
    images: [{ src: "/sonic_black_without_food.webp", alt: "Argo Suave" }],
    title: "Hotels, restaurants & cafes",
    body: "Designed for lobbies, dining areas, and guest-facing service.",
    watermark: "Sonic",
  },
  {
    id: "support",
    href: "/flex",
    images: [{ src: "/argo_flex_new.webp", alt: "Argo Flex" }],
    title: "Cricket stadiums & large venues",
    body: "Sized for concourses, stands, and high-energy crowds.",
    watermark: "Flex",
  },
];

const DEFAULT_HERO_TITLE = "Intelligence in motion";
const DEFAULT_HERO_TAGLINE =
  "Bringing intelligent autonomous robots into the spaces where people live, work, and interact.";

export type HeroSectionProps = {
  /** Hero background video in `/public` (e.g. `/luxury.mp4`) */
  heroVideoSrc?: string;
  heroTitle?: string;
  heroTagline?: string;
  /** Hide the fleet/glass cards section */
  hideFleet?: boolean;
};

const DEFAULT_HERO_VIDEO = "/hero.mp4";

export function HeroSection({
  heroVideoSrc = DEFAULT_HERO_VIDEO,
  heroTitle = DEFAULT_HERO_TITLE,
  heroTagline = DEFAULT_HERO_TAGLINE,
  hideFleet = false,
}: HeroSectionProps) {
  const [showGlassCards, setShowGlassCards] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const gsapModulesRef = useRef<Promise<[any, any]> | null>(null);

  useEffect(() => {
    // Show glass cards after 6.5 seconds
    const glassId = window.setTimeout(() => setShowGlassCards(true), 6500);
    return () => window.clearTimeout(glassId);
  }, []);

  useEffect(() => {
    // Preload gsap + ScrollTrigger in parallel with the intro video, so they're
    // already available the instant the fleet cards mount — avoids a race where
    // a fast scroll right as the video unlocks could outrun the async import and
    // leave the cards stuck in their hidden "before" state.
    gsapModulesRef.current = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  }, []);

  useEffect(() => {
    if (!showGlassCards) return;

    let ctx: any;
    let mounted = true;

    (async () => {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      const track = trackRef.current;
      if (!track) return;

      const cards = track.querySelectorAll<HTMLElement>(".hero__glassCard");
      const sheens = track.querySelectorAll<HTMLElement>(".hero__glassSheen");

      if (isMobile) {
        cards.forEach((card) => {
          card.style.opacity = "1";
          card.style.transform = "none";
          card.style.filter = "none";
        });
        return;
      }

      const [gsapMod, stMod] = await (gsapModulesRef.current ??
        Promise.all([import("gsap"), import("gsap/ScrollTrigger")]));
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? (stMod as any).default ?? stMod;

      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // toggleActions: play on the way down, reverse on the way past it, and the
        // same again scrolling back up — so the reveal replays every time the
        // section crosses into or out of view, in either scroll direction.
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32, scale: 0.94, filter: "blur(12px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: track,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
            },
          },
        );

        gsap.fromTo(
          sheens,
          { xPercent: -130, opacity: 0 },
          {
            xPercent: 230,
            opacity: 1,
            duration: 1.6,
            ease: "sine.inOut",
            scrollTrigger: {
              trigger: track,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
            },
          },
        );

        // Parallax: robot photos drift slowly against their card as the section
        // scrolls. A higher scrub value means the motion lags gently behind the
        // scroll instead of snapping to it, which reads as smoother.
        const images = track.querySelectorAll<HTMLElement>(".hero__glassImage");
        gsap.fromTo(
          images,
          { y: -18 },
          {
            y: 18,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.4,
            },
          },
        );

        ScrollTrigger.refresh();
      }, track);
    })();

    return () => {
      mounted = false;
      ctx?.revert?.();
    };
  }, [showGlassCards]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (!showGlassCards) {
      // Disable scrolling for 6.5 seconds while video plays
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      root.style.overscrollBehavior = "none";
      // Ensure smooth interaction
      body.style.position = "fixed";
      body.style.width = "100%";
    } else {
      // Re-enable scrolling after 6.5 seconds
      root.style.overflow = "";
      body.style.overflow = "";
      root.style.overscrollBehavior = "";
      body.style.position = "";
      body.style.width = "";
    }
    
    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      root.style.overscrollBehavior = "";
      body.style.position = "";
      body.style.width = "";
    };
  }, [showGlassCards]);

  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="hero__media" aria-hidden="true">
          <video
            key={heroVideoSrc}
            className="hero__video"
            autoPlay
            muted
            playsInline
            preload="metadata"
          >
            <source
              src={heroVideoSrc}
              type={heroVideoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"}
            />
          </video>
          <div className="hero__overlay" />
        </div>

        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__copy">
              <h1 className="hero__title">{heroTitle}</h1>
              <p className="hero__tagline">{heroTagline}</p>
              <div className="hero__ctaRow">
                <Link className="hero__btn hero__btn--primary" href="/order">
                  Order
                </Link>
                <Link className="hero__btn hero__btn--secondary" href="#fleet">
                  Explore our fleet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showGlassCards && !hideFleet ? (
        <section className="hero__glassRow" id="fleet" aria-label="Our fleet">
          <div className="hero__glassRowTrack" ref={trackRef}>
            {GLASS_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="hero__glassCardLink"
                aria-label={`${card.title ?? "Learn more"} — ${card.watermark ?? "details"}`}
              >
              <article
                className={`hero__glassCard${card.featured ? " hero__glassCard--featured" : ""}${card.images?.length ? " hero__glassCard--hasImage" : ""}`}
              >
                <div className="hero__glassCardSurface">
                <span className="hero__glassSheen" aria-hidden="true" />
                {card.images?.length ? (
                  <div className="hero__glassCardSplit">
                    <div className="hero__glassCopy">
                      {card.title ? (
                        <h2 className="hero__glassTitle">{card.title}</h2>
                      ) : null}
                      {Array.isArray(card.body) ? (
                        <div className="hero__glassBodies">
                          {card.body.map((para, i) => (
                            <p key={i} className="hero__glassBody">
                              {para}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="hero__glassBody">{card.body}</p>
                      )}
                    </div>
                    <div
                      className={`hero__glassMedia${card.images.length > 1 ? " hero__glassMedia--multi" : ""}`}
                    >
                      {card.images.map((img) => (
                        <img
                          key={img.src}
                          src={img.src}
                          alt={img.alt}
                          className="hero__glassImage"
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {card.headline ? (
                      <div className="hero__glassHeadline">
                        <p className="hero__glassHeadlineLine">{card.headline[0]}</p>
                        <p className="hero__glassHeadlineLine hero__glassHeadlineLine--accent">
                          {card.headline[1]}
                        </p>
                      </div>
                    ) : (
                      <h2 className="hero__glassTitle">{card.title}</h2>
                    )}
                    {Array.isArray(card.body) ? (
                      <div className="hero__glassBodies">
                        {card.body.map((para, i) => (
                          <p key={i} className="hero__glassBody">
                            {para}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="hero__glassBody">{card.body}</p>
                    )}
                  </>
                )}
                {card.watermark ? (
                  <p className="hero__glassWatermark" aria-hidden="true">
                    {card.watermark}
                  </p>
                ) : null}
                </div>
              </article>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
