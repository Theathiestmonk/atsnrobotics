"use client";

import Link from "next/link";
import Image from "next/image";
import { BlurText } from "../components/BlurText";
import { CardSwap, type CardSwapItem } from "../components/CardSwap";
import { ScrollReveal } from "../components/ScrollReveal";

/** Same image assets as home hero glass cards (`HeroSection` → `GLASS_CARDS`). */
const ARGO_MODELS = [
  {
    id: "argo-sonic",
    code: "Argo Sonic",
    name: "For hotels, restaurants, and cafes",
    segment: "Hotels, restaurants & cafes",
    body:
      "Tuned for lobbies, dining areas, and service rhythms where presence matters. Argo Sonic moves replenishment and guest-adjacent runs with the quiet confidence your brand expects.",
    imageSrc: "/sonic_black_without_food.webp",
    imageAlt: "Argo Sonic robot for hotels, restaurants, and cafes",
    href: "/sonic",
    cta: "View hospitality",
  },
  {
    id: "argo-flex",
    code: "ARGO Flex",
    name: "For stadiums & venues",
    segment: "Concourses & large venues",
    body:
      "Sized for concourses, stands, and high-energy crowds. ARGO Flex supports crew logistics with repeatable routes that keep pace with the event—not the other way around.",
    imageSrc: "/argo_flex_new.webp",
    imageAlt: "ARGO Flex robot for stadiums and large venues",
    href: "/flex",
    cta: "View venues",
  },
] as const;

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
            the build that matches your space—hospitality or stadium-scale venues—with the same
            calm engineering philosophy across every model.
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
            <h2 className="atsnSection__title">Two robots. One platform.</h2>
            <p className="atsnSection__sub">
              <strong>ARGO‑H</strong> for hotels and hospitality, and <strong>ARGO‑S</strong> for
              stadiums and large venues. Each variant uses the same intelligent motion
              stack—optimized for the constraints of your environment.
            </p>
          </ScrollReveal>

          <div className="productRobotGrid">
            {ARGO_MODELS.map((robot) => (
              <article key={robot.id} className="atsnCard productRobotCard">
                <div className="productRobotCard__media">
                  <Image
                    src={robot.imageSrc}
                    alt={robot.imageAlt}
                    width={640}
                    height={480}
                    sizes="(max-width: 900px) 90vw, 33vw"
                    style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  />
                </div>
                <p className="productRobotCard__code">{robot.code}</p>
                <h3 className="productRobotCard__name">{robot.name}</h3>
                <p className="productRobotCard__segment">{robot.segment}</p>
                <p className="productRobotCard__body">{robot.body}</p>
                <Link className="productRobotCard__link" href={robot.href}>
                  {robot.cta}
                </Link>
              </article>
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
