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
        src: "/argo_flex_rover_3x_upscaled-removebg-preview.png",
        alt: "ARGO Flex rover robot",
        width: 601,
        height: 415,
      },
      {
        src: "/argoflex_new_with_golf.webp",
        alt: "ARGO Flex robot carrying a golf kit",
        width: 561,
        height: 701,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Order ARGO‑S (Argo Flex)",
  description:
    "Order ARGO‑S (Argo Flex), an autonomous robot designed for stadiums, concourses, and large venues. ₹8,00,000 plus 18% GST.",
};

export default function OrderFlexPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Order</p>
        <OrderModelSwitch active="flex" />

        <div className="orderLayout">
          <OrderGallery colors={FLEX_COLORS} />

          <div>
            <p className="orderSegment">ARGO‑S · Stadiums &amp; large venues</p>
            <h1 className="orderName">ARGO Flex</h1>
            <p className="orderPrice">
              ₹8,00,000 <span className="orderPrice__note">+ 18% GST (₹1,44,000)</span>
              <span className="orderPrice__total">Total: ₹9,44,000 including GST</span>
            </p>

            <p className="orderDescription">
              ARGO Flex is our rugged, all-terrain robot built for concourses, stands, and
              high-energy crowds. Sized for large venues, it supports crew logistics with
              repeatable routes that keep pace with the event — from equipment runs to
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
                <span className="orderSpecs__label">Base price</span>
                <span className="orderSpecs__value">₹8,00,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">18% GST</span>
                <span className="orderSpecs__value">₹1,44,000 · Total ₹9,44,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">Coming soon</span>
              </li>
            </ul>

            <p className="orderNotice">
              Details on this page are placeholders and will be updated soon.
            </p>

            <div className="atsnHero__ctaRow">
              <Link className="atsnBtn atsnBtn--primary" href="/talk-to-us">
                Let's Connect
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
