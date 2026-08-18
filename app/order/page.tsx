import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, SONIC_COLORS } from "./OrderGallery";

export const metadata: Metadata = {
  title: "Order ARGO Sonic",
  description:
    "Order the ARGO Sonic — an autonomous, silent, intelligent robot for hotels, restaurants, and cafes. Starting at ₹5,00,000 onwards.",
};

export default function OrderPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Order</p>

        <div className="orderLayout">
          <OrderGallery colors={SONIC_COLORS} />

          <div>
            <p className="orderSegment">Hotels, restaurants &amp; cafes</p>
            <h1 className="orderName">ARGO Sonic</h1>
            <p className="orderPrice">
              ₹5,00,000 onwards
              <span className="orderPrice__note">(final price depends on configuration)</span>
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
                <span className="orderSpecs__label">Starting price</span>
                <span className="orderSpecs__value">₹5,00,000 onwards</span>
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
              <Link className="atsnBtn atsnBtn--primary" href="/talk-to-us?model=ARGO%20Sonic">
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
