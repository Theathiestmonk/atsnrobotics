"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type GalleryItem = {
  src: string;
  alt: string;
  tag: string;
  wide?: boolean;
};

const CATEGORIES = ["All", "Argo Sonic", "Argo Influence", "Argo Flex", "Argo Uno", "Fleet"] as const;
type Category = (typeof CATEGORIES)[number];

const ITEMS: GalleryItem[] = [
  { src: "/Argo_Team.webp",                                          alt: "Full Argo fleet",                              tag: "Fleet",          wide: true },
  { src: "/argo_sonic.webp",                                         alt: "Argo Sonic service robot",                     tag: "Argo Sonic" },
  { src: "/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png",  alt: "Argo Sonic upscaled view",                     tag: "Argo Sonic" },
  { src: "/Glossy Amber-Lit Service Robot Stand.png",                alt: "Argo Sonic amber-lit design",                  tag: "Argo Sonic" },
  { src: "/argo_influence.webp",                                     alt: "Argo Influence advertisement robot",           tag: "Argo Influence" },
  { src: "/argo_influence_nobg.png",                                 alt: "Argo Influence transparent background",        tag: "Argo Influence" },
  { src: "/ARGO_Flex.webp",                                          alt: "Argo Flex rover robot",                        tag: "Argo Flex" },
  { src: "/argo_flex_rover_3x_upscaled-removebg-preview.png",        alt: "Argo Flex rover upscaled",                     tag: "Argo Flex" },
  { src: "/argoflex_new_with_golf.webp",                             alt: "Argo Flex at a golf venue",                    tag: "Argo Flex",      wide: true },
  { src: "/argo_uno.webp",                                           alt: "Argo Uno robot in development",                tag: "Argo Uno" },
  { src: "/argo_uno_upscaled_2x_file_size__1_-removebg-preview.png", alt: "Argo Uno upscaled",                            tag: "Argo Uno" },
  { src: "/ARGO_fleet_group_HD_2.png",                               alt: "Argo fleet group high resolution",             tag: "Fleet",          wide: true },
  { src: "/argo-uno-hero.webp",                                      alt: "Argo Uno hero shot",                           tag: "Argo Uno" },
  { src: "/ATSN Robotics_ Autonomy Reimagined.png",                  alt: "ATSN Robotics - Autonomy Reimagined",          tag: "Fleet" },
];

export function Gallery() {
  const [active, setActive] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = active === "All" ? ITEMS : ITEMS.filter((i) => i.tag === active);

  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <p className="atsnHero__eyebrow">Gallery</p>
        <h1 className="atsnHero__title">The Argo fleet, up close.</h1>
        <p className="atsnHero__lead">
          Images from across the Argo product line — from design renders to real-world deployments.
        </p>

        {/* Filter tabs */}
        <div className="galleryFilters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`galleryFilter${active === cat ? " galleryFilter--active" : ""}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="galleryGrid">
          {filtered.map((item) => (
            <button
              key={item.src}
              className={`galleryCard${item.wide ? " galleryCard--wide" : ""}`}
              onClick={() => setLightbox(item)}
              aria-label={`View ${item.alt}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
                className="galleryCardImg"
              />
              <span className="galleryCardTag">{item.tag}</span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="atsnHero__ctaRow" style={{ marginTop: "clamp(40px, 6vw, 72px)" }}>
          <Link className="atsnBtn atsnBtn--primary" href="/products">Explore the fleet</Link>
          <Link className="atsnBtn" href="/contact">Get in touch</Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="galleryLightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.alt}>
          <button className="galleryLightboxClose" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
          <div className="galleryLightboxImgWrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
              priority
            />
          </div>
          <p className="galleryLightboxCaption">{lightbox.alt}</p>
        </div>
      )}
    </main>
  );
}
