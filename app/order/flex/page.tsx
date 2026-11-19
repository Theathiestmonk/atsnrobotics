import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, type ColorOption } from "../OrderGallery";
import { OrderModelSwitch } from "../OrderModelSwitch";

const FLEX_COLORS: ColorOption[] = [
  {
    id: "flex",
    label: "ARGO Flex",
    swatch: "#8a8f98",
    images: [
      {
        src: "/ARGO_Flex.webp",
        alt: "ARGO Flex rover robot",
        width: 601,
        height: 415,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Inquire  -  Argo Flex | ATSN Robotics",
  description:
    "Get in touch to learn more about Argo Flex  -  the autonomous robot for stadiums, concourses, and large venues. Talk to the ATSN team for pricing and availability.",
};

export default function OrderFlexPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Inquire</p>
        <OrderModelSwitch active="flex" />

        <div className="orderLayout">
          <OrderGallery colors={FLEX_COLORS} />

          <div>
            <p className="orderSegment">ARGO‑S · Stadiums &amp; large venues</p>
            <h1 className="orderName">ARGO Flex</h1>

            <p className="orderDescription">
              ARGO Flex is our rugged, all-terrain robot built for concourses, stands, and
              high-energy crowds. Sized for large venues, it supports crew logistics with
              repeatable routes that keep pace with the event  -  from equipment runs to
              on-demand carrying, like ferrying a golf kit across a course.
            </p>

            <ul className="orderSpecs">
              <li>
                <span className="orderSpecs__label">Category</span>
                <span className="orderSpecs__value">Autonomous utility robot</span>
              </li>
              <li>
                <span className="orderSpecs__label">Best for</span>
                <span className="orderSpecs__value">Stadiums &amp; large venues</span>
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
