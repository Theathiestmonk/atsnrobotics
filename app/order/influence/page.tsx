import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, type ColorOption } from "../OrderGallery";
import { OrderModelSwitch } from "../OrderModelSwitch";

const INFLUENCE_COLORS: ColorOption[] = [
  {
    id: "influence",
    label: "Argo Influence",
    swatch: "#a78bfa",
    images: [
      { src: "/argo_influence.webp", alt: "Argo Influence autonomous advertisement robot", width: 600, height: 800 },
    ],
  },
];

export const metadata: Metadata = {
  title: "Inquire — Argo Influence | ATSN Robotics",
  description:
    "Get in touch to learn more about Argo Influence — the autonomous advertisement robot for events, parties, and brand activations. Talk to the ATSN team for pricing and availability.",
};

export default function OrderInfluencePage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Inquire</p>
        <OrderModelSwitch active="influence" />

        <div className="orderLayout">
          <OrderGallery colors={INFLUENCE_COLORS} />

          <div>
            <p className="orderSegment">Events, parties &amp; brand activations</p>
            <h1 className="orderName">Argo Influence</h1>

            <p className="orderDescription">
              Argo Influence is an autonomous advertisement and engagement robot built for parties,
              corporate events, exhibitions, and brand activations. It roams independently through
              crowds, displays dynamic content, and draws attention — turning any venue into an
              experience.
            </p>

            <ul className="orderSpecs">
              <li>
                <span className="orderSpecs__label">Category</span>
                <span className="orderSpecs__value">Autonomous advertisement robot</span>
              </li>
              <li>
                <span className="orderSpecs__label">Best for</span>
                <span className="orderSpecs__value">Events, parties &amp; brand activations</span>
              </li>
              <li>
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">Coming soon</span>
              </li>
              <li>
                <span className="orderSpecs__label">Pricing</span>
                <span className="orderSpecs__value">Contact us for a quote</span>
              </li>
            </ul>

            <div className="atsnHero__ctaRow">
              <Link className="atsnBtn atsnBtn--primary" href="/talk-to-us">
                Talk to us
              </Link>
              <Link className="atsnBtn" href="/products">
                View all models
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
