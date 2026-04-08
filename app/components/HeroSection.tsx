"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";

/** Glass cards row */
const HERO_GLASS_MS = 8500;

type GlassCardData = {
  id: string;
  href: string;
  featured?: boolean;
  title?: string;
  headline?: [string, string];
  body: string | string[];
  imageSrc?: string;
  imageAlt?: string;
  watermark?: string;
};

const GLASS_CARDS: GlassCardData[] = [
  {
    id: "hotels-hospitality",
    href: "/luxury",
    imageSrc: "/argo_suave.png",
    imageAlt: "Argo Suave",
    title: "Hotels & hospitality",
    body: "Designed for lobbies, corridors, and guest-facing service.",
    watermark: "Luxury",
  },
  {
    id: "retail-spaces",
    href: "/influence",
    imageSrc: "/Argo_lux.png",
    imageAlt: "Argo Lux",
    title: "Retail spaces",
    body: "Built for aisles, atriums, and shifting shopper flow.",
    watermark: "Influence",
    featured: true,
  },
  {
    id: "support",
    href: "/flex",
    imageSrc: "/argo-flex.png",
    imageAlt: "Argo Flex",
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
};

const DEFAULT_HERO_VIDEO = "/hero.mp4";

export function HeroSection({
  heroVideoSrc = DEFAULT_HERO_VIDEO,
  heroTitle = DEFAULT_HERO_TITLE,
  heroTagline = DEFAULT_HERO_TAGLINE,
}: HeroSectionProps) {
  const [showGlassCards, setShowGlassCards] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const glassId = window.setTimeout(() => setShowGlassCards(true), HERO_GLASS_MS);
    return () => {
      window.clearTimeout(glassId);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (!showGlassCards) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      root.style.overscrollBehavior = "none";
      lenis?.stop();
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
      root.style.overscrollBehavior = "";
      lenis?.start();
    }
    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      root.style.overscrollBehavior = "";
      lenis?.start();
    };
  }, [showGlassCards, lenis]);

  return (
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
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        <div className="hero__overlay" />
      </div>

      <div className="hero__inner">
        <div className="hero__content">
          <div className="hero__copy">
            <h1 className="hero__title">{heroTitle}</h1>
            <p className="hero__tagline">{heroTagline}</p>
            <div className="hero__ctaRow">
              <Link className="hero__btn hero__btn--primary" href="#pre-order">
                Pre-Order
              </Link>
              <Link className="hero__btn hero__btn--secondary" href="#fleet">
                Explore our fleet
              </Link>
            </div>
          </div>
        </div>

        {showGlassCards ? (
          <div className="hero__glassRow">
            <div className="hero__glassRowTrack">
              {GLASS_CARDS.map((card) => (
                <Link
                  key={card.id}
                  href={card.href}
                  className="hero__glassCardLink"
                  aria-label={`${card.title ?? "Learn more"} — ${card.watermark ?? "details"}`}
                >
                <article
                  className={`hero__glassCard${card.featured ? " hero__glassCard--featured" : ""}${card.imageSrc ? " hero__glassCard--hasImage" : ""}`}
                >
                  <div className="hero__glassCardSurface">
                  {card.imageSrc ? (
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
                      <div className="hero__glassMedia">
                        <img
                          src={card.imageSrc}
                          alt={card.imageAlt ?? ""}
                          className="hero__glassImage"
                          loading="lazy"
                          decoding="async"
                        />
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
