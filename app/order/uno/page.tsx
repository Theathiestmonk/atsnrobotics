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
        src: "/argo_uno.webp",
        alt: "Argo Uno robot concept",
        width: 408,
        height: 612,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Inquire — Argo Uno | ATSN Robotics",
  description:
    "Get in touch to register your interest in Argo Uno — the next robot in the ATSN Robotics fleet, currently in development.",
};

export default function OrderUnoPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Inquire</p>
        <OrderModelSwitch active="uno" />

        <div className="orderLayout">
          <OrderGallery colors={UNO_COLORS} />

          <div>
            <p className="orderSegment">Next model in the ARGO fleet</p>
            <h1 className="orderName">Argo Uno</h1>

            <p className="orderDescription">
              Argo Uno is in development as the next addition to the ATSN Robotics fleet. We'll
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
                <span className="orderSpecs__label">Availability</span>
                <span className="orderSpecs__value">To be announced</span>
              </li>
              <li>
                <span className="orderSpecs__label">Pricing</span>
                <span className="orderSpecs__value">Contact us for details</span>
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
