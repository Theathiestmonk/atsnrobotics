import { HeroSection } from "../components/HeroSection";
import { PerformanceSection } from "../components/PerformanceSection";
import { SonicScrollHero } from "../components/SonicScrollHero";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "Argo Sonic — Autonomous Robot for Hotels, Restaurants & Cafes",
  description:
    "Argo Sonic by ATSN Robotics is an autonomous hospitality robot for hotels, restaurants, and cafes. It delivers room service, amenities, and food orders — quietly, reliably, and without staff interruption.",
  path: "/sonic",
  keywords: [
    "Argo Sonic",
    "hotel robot",
    "autonomous hotel robot",
    "room service robot",
    "restaurant delivery robot",
    "cafe robot",
    "robot waiter hotel",
    "hospitality service robot",
    "guest-facing robot",
  ],
});

export default function SonicPage() {
  return (
    <main>
      <HeroSection
        heroVideoSrc="/argo_sonic.webm"
        heroTitle="Luxury in motion"
        heroTagline="Bringing intelligent autonomous presence into hotels, restaurants, and cafes—calm, capable, and present from the lobby to every corridor."
        hideFleet
      />
      <SonicScrollHero />
      <PerformanceSection />
    </main>
  );
}