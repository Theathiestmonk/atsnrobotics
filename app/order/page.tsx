import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, SONIC_COLORS } from "./OrderGallery";
import { OrderModelSwitch } from "./OrderModelSwitch";

export const metadata: Metadata = {
  title: "Order ARGO‑H (Argo Sonic)",
  description:
    "Order ARGO‑H (Argo Sonic), an autonomous hospitality robot for hotels, restaurants, and cafes. ₹4,00,000 plus 18% GST.",
};

export default function OrderPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Order</p>
        <OrderModelSwitch active="sonic" />

        <div className="orderLayout">
          <OrderGallery colors={SONIC_COLORS} />

          <div>
            <p className="orderSegment">ARGO‑H · Hotels, restaurants &amp; cafes</p>
            <h1 className="orderName">ARGO Sonic</h1>
            <p className="orderPrice">
              ₹4,00,000 <span className="orderPrice__note">+ 18% GST (₹72,000)</span>
              <span className="orderPrice__total">Total: ₹4,72,000 including GST</span>
            </p>

            <p className="orderDescription">
              ARGO Sonic is our autonomous, silent, intelligent robot tuned for lobbies, dining
              areas, and service rhythms where presence matters. It moves replenishment and
              guest-adjacent runs with the quiet confidence your brand expects — reducing trips,
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
                <span className="orderSpecs__label">Base price</span>
                <span className="orderSpecs__value">₹4,00,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">18% GST</span>
                <span className="orderSpecs__value">₹72,000 · Total ₹4,72,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">Pre-order now</span>
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
