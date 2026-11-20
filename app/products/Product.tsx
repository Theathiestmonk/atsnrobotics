"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BlurText } from "../components/BlurText";
import { CardSwap, type CardSwapItem } from "../components/CardSwap";
import { ScrollReveal } from "../components/ScrollReveal";

function ProductSliderDots({ count, activeIndex, onDotClick }: { count: number; activeIndex: number; onDotClick: (i: number) => void }) {
  return (
    <div className="productSliderDots">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          className={`productSliderDot${i === activeIndex ? " productSliderDotActive" : ""}`}
          onClick={() => onDotClick(i)}
          aria-label={`Go to card ${i + 1}`}
        />
      ))}
    </div>
  );
}

function ProductFleetGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileSlider, setIsMobileSlider] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    setIsMobileSlider(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileSlider(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el || !isMobileSlider) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      const cardWidth = first ? first.offsetWidth + 12 : 1;
      setActiveIndex(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobileSlider]);

  const scrollToCard = (i: number) => {
    const el = gridRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 12 : 0;
    el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
  };

  return (
    <>
      <div className="productRobotGrid" ref={gridRef}>
        {ARGO_MODELS.map((robot) => (
          <ProductRobotCard key={robot.id} robot={robot} />
        ))}
      </div>
      {isMobileSlider && (
        <ProductSliderDots count={ARGO_MODELS.length} activeIndex={activeIndex} onDotClick={scrollToCard} />
      )}
    </>
  );
}

/** Same image assets as home hero glass cards (`HeroSection` → `GLASS_CARDS`). */
const ARGO_MODELS = [
  {
    id: "argo-sonic",
    code: "Argo Sonic",
    modelCode: "ARGO‑H",
    name: "For hotels, restaurants, and cafes",
    segment: "Hotels, restaurants & cafes",
    status: "Available",
    body:
      "Tuned for lobbies, dining areas, and service rhythms where presence matters. Argo Sonic moves replenishment and guest-adjacent runs with the quiet confidence your brand expects.",
    capabilities: ["Guest-facing delivery", "Quiet replenishment runs", "Hospitality environments"],
    imageSrc: "/argo_sonic.webp",
    imageAlt: "Argo Sonic robot for hotels, restaurants, and cafes",
    imageWidth: 447,
    imageHeight: 558,
    href: "/sonic",
    cta: "Explore",
  },
  {
    id: "argo-influence",
    code: "Argo Influence",
    modelCode: "Argo Influence",
    name: "For events, parties & brand activations",
    segment: "Events & brand presence",
    status: "Coming soon",
    body:
      "Argo Influence roams autonomously through crowds, displaying your brand and engaging guests at parties, exhibitions, corporate events, and product launches.",
    capabilities: ["Dynamic digital display", "Autonomous crowd roaming", "Events, parties & brand activations"],
    imageSrc: "/argo_influence.webp",
    imageAlt: "Argo Influence advertisement robot for events",
    imageWidth: 600,
    imageHeight: 800,
    href: "/influence",
    cta: "Explore",
  },
  {
    id: "argo-flex",
    code: "ARGO Flex",
    modelCode: "ARGO‑S",
    name: "For stadiums & venues",
    segment: "Concourses & large venues",
    status: "Coming soon",
    body:
      "Sized for concourses, stands, and high-energy crowds. ARGO Flex supports crew logistics with repeatable routes that keep pace with the event - not the other way around.",
    capabilities: ["Venue-scale logistics", "Concourses & event-day workflows", "Repeatable crew routes"],
    imageSrc: "/ARGO_Flex.webp",
    imageAlt: "ARGO Flex robot for stadiums and large venues",
    imageWidth: 601,
    imageHeight: 415,
    href: "/flex",
    cta: "Explore",
  },
  {
    id: "argo-uno",
    code: "Argo Uno",
    modelCode: "Argo Uno",
    name: "The next Argo model",
    segment: "In development",
    status: "In development",
    body:
      "Our next robot is taking shape. Follow along as development continues and we share more about Argo Uno.",
    capabilities: ["Development in progress", "Role and capabilities to be announced", "Follow model updates"],
    imageSrc: "/argo_uno.webp",
    imageAlt: "Argo Uno robot in development",
    imageWidth: 408,
    imageHeight: 612,
    href: "/uno",
    cta: "Explore",
  },
] as const;

function ProductRobotCard({ robot }: { robot: (typeof ARGO_MODELS)[number] }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <article
      className={`productRobotCard${isFlipped ? " productRobotCard--flipped" : ""}`}
      aria-label={`${robot.code} product card`}
      onMouseEnter={() => { if (canHover()) setIsFlipped(true); }}
      onMouseLeave={() => { if (canHover()) setIsFlipped(false); }}
    >
      <div className="productRobotCard__inner">
        {/* Front */}
        <div className="productRobotCard__face productRobotCard__front" aria-hidden={isFlipped}>
          <div className="productRobotCard__media">
            <Image
              src={robot.imageSrc}
              alt={robot.imageAlt}
              width={robot.imageWidth}
              height={robot.imageHeight}
              sizes="(max-width: 620px) 90vw, (max-width: 900px) 44vw, 44vw"
            />
          </div>
          <div className="productRobotCard__info">
            <h3 className="productRobotCard__name">{robot.code}</h3>
            <p className="productRobotCard__body">{robot.body}</p>
            <Link className="productRobotCard__link" href={robot.href}>{robot.cta}</Link>
          </div>
        </div>

        {/* Back */}
        <div className="productRobotCard__face productRobotCard__back" aria-hidden={!isFlipped}>
          <Image
            className="productRobotCard__backImage"
            src={robot.imageSrc}
            alt=""
            fill
            sizes="(max-width: 620px) 90vw, (max-width: 900px) 44vw, 44vw"
            aria-hidden="true"
          />
          <div className="productRobotCard__backContent">
            <h3 className="productRobotCard__name">{robot.code}</h3>
            <p className="productRobotCard__body">{robot.body}</p>
            <ul className="productRobotCard__capabilities">
              {robot.capabilities.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <Link className="productRobotCard__link" href={robot.href}>{robot.cta}</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const featureCards: CardSwapItem[] = [
  {
    id: "natural-interaction",
    kicker: "Experience",
    title: "Natural Interaction",
    body:
      "ARGO understands shared spaces. It moves with intention - yielding, signaling, and arriving with the calm confidence of a great teammate. No spectacle. No awkward choreography. Just intelligent motion that feels familiar.",
    pills: ["Human-aware navigation", "Predictable approach", "Clear intent cues"],
  },
  {
    id: "fluid-mobility",
    kicker: "Mobility",
    title: "Fluid Mobility",
    body:
      "Built for real floors, real corners, and real foot traffic. ARGO’s motion is smooth under pressure - threading through lobbies, aisles, and concourses without jolts that disrupt guests or the payload you’re moving.",
    pills: ["Tight turning", "Stable motion", "Crowd-tolerant routing"],
  },
  {
    id: "quiet-confidence",
    kicker: "Presence",
    title: "Quiet Confidence",
    body:
      "ARGO operates with a low acoustic profile and an unobtrusive silhouette - support that doesn’t announce itself. The result is a robot that can work nearby without pulling focus from the experience you’re delivering.",
    pills: ["Low-noise operation", "Guest-friendly design", "Distraction-free"],
  },
  {
    id: "purpose-built",
    kicker: "Built for work",
    title: "Purpose‑Built",
    body:
      "ARGO is designed specifically for goods movement: dependable delivery runs, back-of-house support, and repeatable workflows. It’s the quiet engine behind consistent service - reducing trips, smoothing peaks, and freeing people for higher-value work.",
    pills: ["Delivery workflows", "Fleet-ready", "Operational insight"],
  },
];

export function Product() {
  const handleScrollToFleet = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#fleet")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <p className="atsnHero__eyebrow">Product</p>
        <BlurText text="Meet ARGO." as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            ARGO is an autonomous, silent, intelligent robot line designed for goods movement. Choose
            the build that matches your space, or discover Argo Uno, the next model in development.
            Every model shares the same calm engineering philosophy.
          </p>
        </ScrollReveal>

        <div className="atsnHero__ctaRow">
          <Link className="atsnBtn atsnBtn--primary" href="/contact">
            Let’s talk
          </Link>
          <button className="atsnBtn" onClick={handleScrollToFleet} type="button">
            See the fleet
          </button>
        </div>

        <section className="atsnSection" id="fleet" aria-label="ARGO models">
          <ScrollReveal>
            <h2 className="atsnSection__title">Four robots. One platform.</h2>
          </ScrollReveal>

          <ProductFleetGrid />
        </section>

        <section className="atsnSection" id="capabilities" aria-label="Capabilities">
          <ScrollReveal>
            <h2 className="atsnSection__title">Designed to disappear into your workflow.</h2>
            <p className="atsnSection__sub">
              The best robotics doesn’t demand attention - it earns trust. ARGO blends graceful motion
              with human-aware behavior so it can operate in public-facing environments without
              forcing people to adapt. Think of it as intelligent motion with manners.
            </p>
          </ScrollReveal>

          <CardSwap items={featureCards} autoPlay start="top 72%" />
        </section>

        <section className="atsnSection" aria-label="Operational detail">
          <div className="atsnGrid">
            <div className="atsnCard" style={{ gridColumn: "span 7" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Operations</p>
                <h3 className="atsnCard__title">A calm layer of capacity.</h3>
                <p className="atsnCard__body">
                  ARGO is designed to absorb the invisible workload: the trips that interrupt flow,
                  the runs that steal staffing bandwidth, and the repetitive movement that stacks up
                  when a venue gets busy. Deploy it for consistent routes, scheduled runs, and
                  on-demand support - then let your team stay where they’re most valuable.
                </p>
              </ScrollReveal>
            </div>

            <div className="atsnCard" style={{ gridColumn: "span 5" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Design intent</p>
                <h3 className="atsnCard__title">Presence without pressure.</h3>
                <p className="atsnCard__body">
                  Quiet operation, graceful approach, and predictable motion - so ARGO can work near
                  guests and staff without turning the space into a demo. Robotics should feel like
                  it belongs.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
