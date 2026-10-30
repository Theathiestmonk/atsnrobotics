import { AboutUs } from "./AboutUs";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "About ATSN Robotics — Autonomous Robot Manufacturer",
  description:
    "ATSN Robotics designs and manufactures the Argo fleet of autonomous service robots. Learn about our mission to bring intelligent, human-aware robotics to hospitality, retail, and live events.",
  path: "/about",
  keywords: [
    "autonomous robot manufacturer",
    "robotics company",
    "hospitality robotics",
    "indoor autonomous robots",
    "robot company",
  ],
});

export default function AboutPage() {
  return <AboutUs />;
}
