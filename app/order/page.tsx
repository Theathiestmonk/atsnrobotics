import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, SONIC_COLORS } from "./OrderGallery";
import { OrderModelSwitch } from "./OrderModelSwitch";

export const metadata: Metadata = {
  title: "Inquire  -  Argo Sonic | ATSN Robotics",
  description:
    "Get in touch to learn more about Argo Sonic  -  the autonomous hospitality robot for hotels, restaurants, and cafes. Talk to the ATSN team for pricing and availability.",
};

export default function OrderPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Inquire</p>
        <OrderModelSwitch active="sonic" />

        <div className="orderLayout">
          <OrderGallery colors={SONIC_COLORS} />

          <div>
            <p className="orderSegment">ARGO‑H · Hotels, restaurants &amp; cafes</p>
            <h1 className="orderName">ARGO Sonic</h1>

            <p className="orderDescription">
              ARGO Sonic is our autonomous, silent, intelligent robot tuned for lobbies, dining
              areas, and service rhythms where presence matters. It moves replenishment and
              guest-adjacent runs with the quiet confidence your brand expects  -  reducing trips,
              smoothing peaks, and freeing your team for higher-value work.
            </p>

            <ul className="orderSpecs">
              <li>
                <span className="orderSpecs__label">Category</span>
                <span className="orderSpecs__value">Autonomous delivery robot</span>
              </li>
              <li>
                <span className="orderSpecs__label">Best for</span>
                <span className="orderSpecs__value">Hotels, restaurants &amp; cafes</span>
              </li>
              <li>
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">Available now</span>
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
