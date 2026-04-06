import type { Metadata } from "next";
import { AboutUs } from "./AboutUs";

export const metadata: Metadata = {
  title: "About ATSN Robotics",
  description:
    "Our mission, vision, and engineering philosophy behind ARGO—technology that feels like it belongs.",
};

export default function AboutPage() {
  return <AboutUs />;
}

