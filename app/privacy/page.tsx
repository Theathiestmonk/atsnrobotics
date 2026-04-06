import type { Metadata } from "next";
import { Privacy } from "./Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ATSN Robotics handles website data and robotics operational data, including spatial mapping and camera navigation data.",
};

export default function PrivacyPage() {
  return <Privacy />;
}

