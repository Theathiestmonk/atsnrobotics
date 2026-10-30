import type { Metadata } from "next";
import Link from "next/link";
import { OrderGallery, type ColorOption } from "../OrderGallery";
import { OrderModelSwitch } from "../OrderModelSwitch";

const UNO_COLORS: ColorOption[] = [
  {
    id: "uno",
    label: "Argo Uno",
    swatch: "#f5f5f5",
    images: [
      {
        src: "/argo_uno_upscaled_2x_file_size__1_-removebg-preview.png",
        alt: "Argo Uno robot concept",
        width: 408,
        height: 612,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Order Argo Uno | ATSN Robotics",
  description:
    "Discover Argo Uno, the next robot in the ATSN Robotics fleet. ₹12,00,000 plus 18% GST.",
};

export default function OrderUnoPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Order</p>
        <OrderModelSwitch active="uno" />

        <div className="orderLayout">
          <OrderGallery colors={UNO_COLORS} />

          <div>
            <p className="orderSegment">Next model in the ARGO fleet</p>
            <h1 className="orderName">Argo Uno</h1>
            <p className="orderPrice">
              ₹12,00,000 <span className="orderPrice__note">+ 18% GST (₹2,16,000)</span>
              <span className="orderPrice__total">Total: ₹14,16,000 including GST</span>
            </p>

            <p className="orderDescription">
              Argo Uno is in development as the next addition to the ATSN Robotics fleet. We’ll
              share its role, confirmed specifications, and availability as development progresses.
            </p>

            <ul className="orderSpecs">
              <li>
                <span className="orderSpecs__label">Category</span>
                <span className="orderSpecs__value">ARGO fleet robot</span>
              </li>
              <li>
                <span className="orderSpecs__label">Model status</span>
                <span className="orderSpecs__value">In development</span>
              </li>
              <li>
                <span className="orderSpecs__label">Base price</span>
                <span className="orderSpecs__value">₹12,00,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">18% GST</span>
                <span className="orderSpecs__value">₹2,16,000 · Total ₹14,16,000</span>
              </li>
              <li>
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">To be announced</span>
              </li>
            </ul>

            <p className="orderNotice">
              Specifications and availability will be shared as the model progresses through
              development.
            </p>

            <div className="atsnHero__ctaRow">
              <Link className="atsnBtn atsnBtn--primary" href="/talk-to-us">
                Register your interest
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
