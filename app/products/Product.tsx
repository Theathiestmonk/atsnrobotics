"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BlurText } from "../components/BlurText";
import { CardSwap, type CardSwapItem } from "../components/CardSwap";
import { ScrollReveal } from "../components/ScrollReveal";

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
    imageSrc: "/sonic_black-removebg-preview.png",
    imageAlt: "Argo Sonic robot for hotels, restaurants, and cafes",
    href: "/sonic",
    cta: "View hospitality",
  },
  {
    id: "argo-flex",
    code: "ARGO Flex",
    modelCode: "ARGO‑S",
    name: "For stadiums & venues",
    segment: "Concourses & large venues",
    status: "Coming soon",
    body:
      "Sized for concourses, stands, and high-energy crowds. ARGO Flex supports crew logistics with repeatable routes that keep pace with the event—not the other way around.",
    capabilities: ["Venue-scale logistics", "Concourses & event-day workflows", "Repeatable crew routes"],
    imageSrc: "/argo_flex_new-removebg-preview.png",
    imageAlt: "ARGO Flex robot for stadiums and large venues",
    href: "/flex",
    cta: "View venues",
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
    imageSrc: "/argo_uno_upscaled_2x_file_size__1_-removebg-preview.png",
    imageAlt: "Argo Uno robot in development",
    href: "/uno",
    cta: "Explore Argo Uno",
  },
] as const;

function ProductRobotCard({ robot }: { robot: (typeof ARGO_MODELS)[number] }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!restoreFocus.current) return;
    (isFlipped ? backButtonRef.current : frontButtonRef.current)?.focus();
    restoreFocus.current = false;
  }, [isFlipped]);

  const flipTo = (flipped: boolean) => {
    restoreFocus.current = true;
    setIsFlipped(flipped);
  };

  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <article
      className={`atsnCard productRobotCard${isFlipped ? " productRobotCard--flipped" : ""}`}
      aria-label={`${robot.code} product card`}
      onMouseEnter={(event) => {
        if (canHover() && !event.currentTarget.contains(document.activeElement)) {
          setIsFlipped(true);
        }
      }}
      onMouseLeave={(event) => {
        if (canHover() && !event.currentTarget.contains(document.activeElement)) {
          setIsFlipped(false);
        }
      }}
    >
      <div className="productRobotCard__inner">
        <div
          className="productRobotCard__face productRobotCard__front"
          aria-hidden={isFlipped}
        >
          <div className="productRobotCard__media">
            <Image
              src={robot.imageSrc}
              alt={robot.imageAlt}
              width={640}
              height={480}
              sizes="(max-width: 620px) 90vw, (max-width: 900px) 44vw, 30vw"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <p className="productRobotCard__code">{robot.code}</p>
          <h3 className="productRobotCard__name">{robot.name}</h3>
          <p className="productRobotCard__status">{robot.status}</p>
          <button
            ref={frontButtonRef}
            className="productRobotCard__flip"
            type="button"
            aria-pressed={isFlipped}
            aria-label={`Show ${robot.code} capabilities`}
            tabIndex={isFlipped ? -1 : 0}
            onClick={() => flipTo(true)}
          >
            View capabilities <span aria-hidden="true">↻</span>
          </button>
        </div>

        <div
          className="productRobotCard__face productRobotCard__back"
          aria-hidden={!isFlipped}
        >
          <Image
            className="productRobotCard__backImage"
            src={robot.imageSrc}
            alt=""
            fill
            sizes="(max-width: 620px) 90vw, (max-width: 900px) 44vw, 30vw"
            aria-hidden="true"
          />
          <div className="productRobotCard__backContent">
            <p className="productRobotCard__backKicker">{robot.segment}</p>
            <h3 className="productRobotCard__backTitle">{robot.modelCode}</h3>
            <p className="productRobotCard__body">{robot.body}</p>
            <ul className="productRobotCard__capabilities">
              {robot.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
            <div className="productRobotCard__backActions">
              <button
                ref={backButtonRef}
                className="productRobotCard__flipBack"
                type="button"
                aria-pressed={isFlipped}
                aria-label={`Show ${robot.code} robot image`}
                tabIndex={isFlipped ? 0 : -1}
                onClick={() => flipTo(false)}
              >
                <span aria-hidden="true">↶</span>
              </button>
              <Link
                className="productRobotCard__link"
                href={robot.href}
                tabIndex={isFlipped ? 0 : -1}
              >
                {robot.cta}
              </Link>
            </div>
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
      "ARGO understands shared spaces. It moves with intention—yielding, signaling, and arriving with the calm confidence of a great teammate. No spectacle. No awkward choreography. Just intelligent motion that feels familiar.",
    pills: ["Human-aware navigation", "Predictable approach", "Clear intent cues"],
  },
  {
    id: "fluid-mobility",
    kicker: "Mobility",
    title: "Fluid Mobility",
    body:
      "Built for real floors, real corners, and real foot traffic. ARGO’s motion is smooth under pressure—threading through lobbies, aisles, and concourses without jolts that disrupt guests or the payload you’re moving.",
    pills: ["Tight turning", "Stable motion", "Crowd-tolerant routing"],
  },
  {
    id: "quiet-confidence",
    kicker: "Presence",
    title: "Quiet Confidence",
    body:
      "ARGO operates with a low acoustic profile and an unobtrusive silhouette—support that doesn’t announce itself. The result is a robot that can work nearby without pulling focus from the experience you’re delivering.",
    pills: ["Low-noise operation", "Guest-friendly design", "Distraction-free"],
  },
  {
    id: "purpose-built",
    kicker: "Built for work",
    title: "Purpose‑Built",
    body:
      "ARGO is designed specifically for goods movement: dependable delivery runs, back-of-house support, and repeatable workflows. It’s the quiet engine behind consistent service—reducing trips, smoothing peaks, and freeing people for higher-value work.",
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
            <h2 className="atsnSection__title">Three robots. One platform.</h2>
            <p className="atsnSection__sub">
              <strong>ARGO‑H (Argo Sonic)</strong> is built for hotels and hospitality, while{" "}
              <strong>ARGO‑S (Argo Flex)</strong> is designed for stadiums and large venues. Argo
              Uno is in development, with details to come.
            </p>
          </ScrollReveal>

          <div className="productRobotGrid">
            {ARGO_MODELS.map((robot) => (
              <ProductRobotCard key={robot.id} robot={robot} />
            ))}
          </div>
        </section>

        <section className="atsnSection" id="capabilities" aria-label="Capabilities">
          <ScrollReveal>
            <h2 className="atsnSection__title">Designed to disappear into your workflow.</h2>
            <p className="atsnSection__sub">
              The best robotics doesn’t demand attention—it earns trust. ARGO blends graceful motion
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
                  on-demand support—then let your team stay where they’re most valuable.
                </p>
              </ScrollReveal>
            </div>

            <div className="atsnCard" style={{ gridColumn: "span 5" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Design intent</p>
                <h3 className="atsnCard__title">Presence without pressure.</h3>
                <p className="atsnCard__body">
                  Quiet operation, graceful approach, and predictable motion—so ARGO can work near
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
