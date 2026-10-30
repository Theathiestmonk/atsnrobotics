"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./HomeExperience.module.css";
import { UPDATE_PREVIEWS } from "../lib/update-previews";

const ROBOTS = [
  {
    id: "flex",
    name: "Argo Flex",
    role: "Large venue delivery",
    status: "Coming soon",
    description: "Designed for the scale and pace of stadiums and other large venues.",
    image: "/argo_flex_rover_3x_upscaled-removebg-preview.png",
    alt: "Argo Flex rover robot",
    width: 601,
    height: 415,
    href: "/flex",
    cta: "Explore Argo Flex",
  },
  {
    id: "sonic",
    name: "Argo Sonic",
    role: "Hospitality service",
    status: "Available",
    description: "For hotels, restaurants, and cafes where guest-facing service matters.",
    image: "/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png",
    alt: "Argo Sonic hospitality service robot",
    width: 418,
    height: 597,
    href: "/sonic",
    cta: "Explore Argo Sonic",
  },
  {
    id: "uno",
    name: "Argo Uno",
    role: "The next Argo model",
    status: "In development",
    description: "Our next robot is taking shape. Follow along as development continues.",
    image: "/argo-uno-hero.webp",
    alt: "Argo Uno robot in development",
    width: 816,
    height: 1224,
    href: "/uno",
    cta: "Explore Argo Uno",
  },
] as const;

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
  const heroRobot = ROBOTS.find((robot) => robot.id === "uno");

  return (
    <main className={`${styles.page}${motionReady ? ` ${styles.motionReady}` : ""}`}>
      <div className={introComplete ? styles.introComplete : styles.introPending}>
      <section className={styles.hero} id="home" aria-labelledby="home-title">
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

          <div className={`${styles.heroVisual} ${revealClass("hero-robots")}`} data-home-reveal="hero-robots">
            <div className={styles.heroRobots}>
              {heroRobot ? (
                <figure className={`${styles.heroRobot} ${styles.heroRobotuno}`}>
                  <Image
                    className={styles.heroRobotImage}
                    src={heroRobot.image}
                    alt={heroRobot.alt}
                    width={heroRobot.width}
                    height={heroRobot.height}
                    priority
                    quality={90}
                    sizes="(max-width: 700px) 78vw, (max-width: 1100px) 48vw, 42vw"
                  />
                </figure>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.fleet} id="fleet" aria-labelledby="fleet-title">
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeading} ${revealClass("fleet-heading")}`} data-home-reveal="fleet-heading">
            <div>
              <p className={styles.eyebrow}>01 / The Argo fleet</p>
              <h2 id="fleet-title">A model for every kind of movement.</h2>
            </div>
            <p>See what is available, what is coming soon, and what is in development.</p>
          </div>

          <div className={styles.robotGrid}>
            {ROBOTS.map((robot, index) => (
              <article
                className={`${styles.robotCard} ${revealClass(`robot-${robot.id}`)}`}
                data-home-reveal={`robot-${robot.id}`}
                key={robot.id}
                style={{ "--robot-index": index } as React.CSSProperties}
              >
                <Link className={styles.robotCardLink} href={robot.href} aria-label={robot.cta}>
                  <div className={styles.robotMedia}>
                    <span className={styles.robotIndex}>0{index + 1} — {robot.role}</span>
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
                    <div className={styles.robotMeta}>
                      <span>{robot.role}</span>
                      <span>{robot.status}</span>
                    </div>
                    <h3>{robot.name}</h3>
                    <p>{robot.description}</p>
                    <span className={styles.cardCta}>{robot.cta} <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </article>
            ))}
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
              <p className={styles.eyebrow}>02 / From ATSN</p>
              <h2 id="updates-title">News, stories, and what’s next.</h2>
            </div>
            <p>Follow company news, upcoming events, and updates from the Argo fleet.</p>
          </div>

          <div className={styles.updatesGrid}>
            {UPDATE_PREVIEWS.map((item, index) => (
              <article
                className={`${styles.updatesCard} ${revealClass(`update-${index}`)}`}
                data-home-reveal={`update-${index}`}
                key={item.category}
                style={{ "--robot-index": index } as React.CSSProperties}
              >
                <p className={styles.updatesCategory}>{item.category}</p>
                <h3>{item.title}</h3>
                <p className={styles.updatesDescription}>{item.description}</p>
                <span className={styles.updatesStatus}>{item.status}</span>
              </article>
            ))}
          </div>

          <Link className={styles.updatesLink} href="/updates">
            Visit News &amp; Events <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className={`${styles.contactInner} ${revealClass("contact")}`} data-home-reveal="contact">
          <div>
            <p className={styles.eyebrow}>03 / Start a conversation</p>
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