"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./HomeExperience.module.css";
import { UPDATE_PREVIEWS } from "../lib/update-previews";

const ROBOTS = [
  {
    id: "sonic",
    name: "Argo Sonic",
    role: "Hospitality service",
    status: "Available",
    description: "For hotels, restaurants, and cafes where guest-facing service matters.",
    image: "/argo_sonic.webp",
    alt: "Argo Sonic hospitality service robot",
    width: 418,
    height: 597,
    href: "/sonic",
    cta: "Explore",
  },
  {
    id: "influence",
    name: "Argo Influence",
    role: "Events & brand presence",
    status: "Coming soon",
    description: "Autonomous advertisement robot for parties, corporate events, exhibitions, and brand activations.",
    image: "/argo_influence.webp",
    alt: "Argo Influence advertisement robot",
    width: 600,
    height: 800,
    href: "/influence",
    cta: "Explore",
  },
  {
    id: "flex",
    name: "Argo Flex",
    role: "Large venue delivery",
    status: "Coming soon",
    description: "Designed for the scale and pace of stadiums and other large venues.",
    image: "/ARGO_Flex.webp",
    alt: "Argo Flex rover robot",
    width: 601,
    height: 415,
    href: "/flex",
    cta: "Explore",
  },
  {
    id: "uno",
    name: "Argo Uno",
    role: "The next Argo model",
    status: "In development",
    description: "Our next robot is taking shape. Follow along as development continues.",
    image: "/argo_uno.webp",
    alt: "Argo Uno robot in development",
    width: 816,
    height: 1224,
    href: "/uno",
    cta: "Explore",
  },
] as const;

function FleetSlider({ robots, styles, revealClass }: { robots: typeof ROBOTS; styles: any; revealClass: (k: string) => string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : 1;
      setActiveIndex(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i: number) => {
    const el = gridRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : 0;
    el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className={styles.robotGrid} ref={gridRef}>
        {robots.map((robot, index) => (
          <article
            className={`${styles.robotCard} ${revealClass(`robot-${robot.id}`)}`}
            data-home-reveal={`robot-${robot.id}`}
            key={robot.id}
            style={{ "--robot-index": index } as React.CSSProperties}
          >
            <Link className={styles.robotCardLink} href={robot.href} aria-label={robot.cta}>
              <div className={styles.robotMedia}>
                <div className={styles.robotImageFrame}>
                  <Image
                    className={styles.robotCardImage}
                    src={robot.image}
                    alt={robot.alt}
                    width={robot.width}
                    height={robot.height}
                    loading="lazy"
                    sizes="(max-width: 680px) 90vw, (max-width: 1000px) 45vw, 30vw"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              </div>
              <div className={styles.robotCopy}>
                <h3>{robot.name}</h3>
                <p>{robot.description}</p>
                <span className={styles.cardCta}>{robot.cta} <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          </article>
        ))}
      </div>
      <div className={styles.sliderDots}>
        {robots.map((_, i) => (
          <button
            key={i}
            className={`${styles.sliderDot}${i === activeIndex ? ` ${styles.sliderDotActive}` : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeExperience() {
  const [motionReady, setMotionReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) {
      setIntroComplete(true);
      return;
    }

    const introTimer = window.setTimeout(() => setIntroComplete(true), 1300);
    const skipIntroForReducedMotion = (event: MediaQueryListEvent) => {
      if (event.matches) setIntroComplete(true);
    };

    motionPreference.addEventListener("change", skipIntroForReducedMotion);
    return () => {
      window.clearTimeout(introTimer);
      motionPreference.removeEventListener("change", skipIntroForReducedMotion);
    };
  }, []);

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-home-reveal]"),
    );
    const initiallyVisible = new Set(
      revealElements
        .filter((element) => element.getBoundingClientRect().top < window.innerHeight * 0.92)
        .map((element) => element.dataset.homeReveal ?? ""),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      setVisibleItems(new Set(revealElements.map((element) => element.dataset.homeReveal ?? "")));
      setMotionReady(true);
      return;
    }

    setVisibleItems(initiallyVisible);
    setMotionReady(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const revealId = (entry.target as HTMLElement).dataset.homeReveal ?? "";
          setVisibleItems((current) => {
            if (current.has(revealId)) return current;
            const next = new Set(current);
            next.add(revealId);
            return next;
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    revealElements.forEach((element) => {
      if (!initiallyVisible.has(element.dataset.homeReveal ?? "")) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const revealClass = (revealId: string) =>
    `${styles.reveal}${visibleItems.has(revealId) ? ` ${styles.visible}` : ""}`;

  // Nudge playback for browsers that skip the autoPlay attribute (it plays for everyone, muted and looping).
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (video?.paused) void video.play().catch(() => undefined);
  }, []);

  return (
    <main className={`${styles.page}${motionReady ? ` ${styles.motionReady}` : ""}`}>
      <div className={introComplete ? styles.introComplete : styles.introPending}>
      <section className={styles.hero} id="home" aria-labelledby="home-title">
        <div className={styles.heroMedia} aria-hidden="true">
          <video
            ref={heroVideoRef}
            className={styles.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/argo-sonic-hero-poster.jpg"
          >
            <source src="/argo-sonic-hero.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroShade} />
        </div>
        <div className={styles.heroInner}>
          <div className={`${styles.heroCopy} ${revealClass("hero-copy")}`} data-home-reveal="hero-copy">
            <h1 className={styles.heroTitle} id="home-title">
              Robots for the <span>real world.</span>
            </h1>
            <p className={styles.heroLead}>
              Meet the Argo fleet: purpose-built robots designed to make service and delivery feel
              effortless in the places people gather.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#fleet">
                Explore the Argo fleet <span aria-hidden="true">↘</span>
              </a>
              <Link className={styles.secondaryAction} href="/contact">
                Discuss your space <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className={styles.fleet} id="fleet" aria-labelledby="fleet-title">
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeading} ${revealClass("fleet-heading")}`} data-home-reveal="fleet-heading">
            <div>
              <h2 id="fleet-title">A model for every kind of movement.</h2>
            </div>
          </div>

          {/* Desktop / tablet: card slider */}
          <div className={styles.fleetDesktop}>
            <FleetSlider robots={ROBOTS} styles={styles} revealClass={revealClass} />
          </div>

          {/* Mobile only: team image + single paragraph */}
          <div className={styles.fleetMobile}>
            <Image
              src="/Argo_Team.webp"
              alt="The full Argo fleet"
              width={800}
              height={560}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
              loading="lazy"
            />
            <p className={styles.fleetMobileSummary}>
              The Argo fleet brings intelligent automation into the spaces where people live and work. Argo Sonic handles delivery and replenishment in hotels, restaurants, and cafes. Argo Influence engages crowds at events and brand activations. Argo Flex manages logistics in stadiums and large venues. Argo Uno is currently in development, with new capabilities on the way. Each model is purpose-built to make everyday operations smoother and more efficient.
            </p>
            <Link href="/products" className={styles.cardCta}>
              See all models <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.updatesSection} aria-labelledby="updates-title">
        <div className={styles.sectionInner}>
          <div
            className={`${styles.sectionHeading} ${revealClass("updates-heading")}`}
            data-home-reveal="updates-heading"
          >
            <div>
              <h2 id="updates-title">News, stories, and what’s next.</h2>
            </div>
          </div>

          <div className={styles.updatesGrid}>
            {/* Featured event  -  Tech EXPO Gujarat (soonest) */}
            {(() => {
              const now = new Date(); now.setHours(0,0,0,0);
              const s = new Date("2026-11-27"), e = new Date("2026-11-29");
              const live = now >= s && now <= e;
              return (
              <article
                className={`${styles.updatesCard} ${styles.updatesCardFeatured} ${revealClass("update-0")}`}
                data-home-reveal="update-0"
                style={{ "--robot-index": 0 } as React.CSSProperties}
              >
              <div className={styles.updatesCardLogo}>
                <Image src="/tech-expo-gujarat.png" alt="Tech EXPO Gujarat" width={52} height={52} className={styles.updatesEventLogo} />
              </div>
              <div className={styles.updatesCardBody}>
                <div className={styles.updatesCardTop}>
                  <span className={live ? styles.updatesBadgeLive : styles.updatesBadge}>{live ? "● Live now" : "Upcoming"}</span>
                </div>
                <p className={styles.updatesOrganizer}>Tech EXPO Gujarat · Gujarat University, Ahmedabad</p>
                <h3>Tech EXPO Gujarat 2026</h3>
                <p className={styles.updatesDescription}>
                  We're bringing the full Argo series to Tech EXPO Gujarat 2026. See Argo Sonic, Flex, and Influence live  -  come meet the team.
                </p>
                <div className={styles.updatesHighlights}>
                  <span>Argo Sonic</span>
                  <span>Argo Flex</span>
                  <span>Argo Influence</span>
                </div>
                <span className={styles.updatesStatus}>Nov 27 – 29, 2026 · Ahmedabad</span>
              </div>
            </article>
            );
            })()}

            {/* Second event  -  Techfest */}
            {(() => {
              const now = new Date(); now.setHours(0,0,0,0);
              const s = new Date("2026-12-16"), e = new Date("2026-12-18");
              const live = now >= s && now <= e;
              return (
              <article
                className={`${styles.updatesCard} ${revealClass("update-1")}`}
                data-home-reveal="update-1"
                style={{ "--robot-index": 1 } as React.CSSProperties}
              >
              <div className={styles.updatesCardLogo}>
                <Image src="/iit-bombay.png" alt="IIT Bombay" width={52} height={52} className={styles.updatesEventLogo} />
              </div>
              <div className={styles.updatesCardBody}>
                <div className={styles.updatesCardTop}>
                  <span className={live ? styles.updatesBadgeLive : styles.updatesBadge}>{live ? "● Live now" : "Upcoming"}</span>
                </div>
                <p className={styles.updatesOrganizer}>Techfest · IIT Bombay, Mumbai</p>
                <h3>Techfest 2026</h3>
                <p className={styles.updatesDescription}>
                  Argo Sonic and Argo Influence at one of India's largest tech festivals. Live demos for students and engineers.
                </p>
                <span className={styles.updatesStatus}>Dec 16 – 18, 2026 · IIT Bombay</span>
              </div>
            </article>
              );
            })()}

            {/* Third event  -  WOHXpo */}
            {(() => {
              const now = new Date(); now.setHours(0,0,0,0);
              const s = new Date("2027-02-02"), e = new Date("2027-02-04");
              const live = now >= s && now <= e;
              return (
              <article
                className={`${styles.updatesCard} ${revealClass("update-2")}`}
                data-home-reveal="update-2"
                style={{ "--robot-index": 2 } as React.CSSProperties}
              >
              <div className={styles.updatesCardLogo}>
                <Image src="/woh-expo.png" alt="World of Hospitality" width={52} height={52} className={styles.updatesEventLogo} />
              </div>
              <div className={styles.updatesCardBody}>
                <div className={styles.updatesCardTop}>
                  <span className={live ? styles.updatesBadgeLive : styles.updatesBadge}>{live ? "● Live now" : "Upcoming"}</span>
                </div>
                <p className={styles.updatesOrganizer}>WOHXpo · Nesco Hall 5, Goregaon, Mumbai</p>
                <h3>WOHXpo 2027</h3>
                <p className={styles.updatesDescription}>
                  Argo Sonic and Argo Influence live for hospitality professionals. Demo and custom quotes on site.
                </p>
                <span className={styles.updatesStatus}>Feb 2 – 4, 2027 · Mumbai</span>
              </div>
            </article>
              );
            })()}
          </div>

          <Link className={styles.updatesLink} href="/updates">
            Visit News &amp; Events <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className={`${styles.contactInner} ${revealClass("contact")}`} data-home-reveal="contact">
          <div>
            <h2 id="contact-title">Let’s find the right robot for your space.</h2>
          </div>
          <Link className={styles.primaryAction} href="/contact">
            Talk to ATSN <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      </div>
      {!introComplete ? (
        <div className={styles.introOverlay} aria-hidden="true">
          <span className={`${styles.introSmoke} ${styles.introSmokeOne}`} />
          <span className={`${styles.introSmoke} ${styles.introSmokeTwo}`} />
          <div className={styles.introBrand}>
            <p className={styles.introEyebrow}>ATSN Robotics</p>
            <h1 className={styles.introTitle}>
              <span className={styles.introTitleLine}>Intelligence</span>
              <span className={`${styles.introTitleLine} ${styles.introTitleAccent}`}>in motion</span>
            </h1>
            <span className={styles.introRule} />
          </div>
        </div>
      ) : null}
    </main>
  );
}