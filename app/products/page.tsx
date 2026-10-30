import { Product } from "./Product";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "Argo Robot Fleet — Autonomous Service & Delivery Robots",
  description:
    "Explore the full Argo robot fleet by ATSN Robotics: autonomous service and delivery robots for hotels, restaurants, cafes, stadiums, and large venues. View available models and upcoming releases.",
  path: "/products",
  keywords: [
    "Argo robot fleet",
    "autonomous service robots",
    "delivery robots for sale",
    "hotel delivery robot",
    "restaurant robot",
    "stadium delivery robot",
    "robot for hospitality",
  ],
});

export default function ProductsPage() {
  return <Product />;
}
