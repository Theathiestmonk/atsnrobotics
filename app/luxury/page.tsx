import type { Metadata } from "next";
import { HeroSection } from "../components/HeroSection";
import { PerformanceSection } from "../components/PerformanceSection";

export const metadata: Metadata = {
  title: "Luxury in motion",
  description:
    "Bringing intelligent autonomous presence into hotels and hospitality—calm, capable, and tuned to lobbies, corridors, and guest-facing moments.",
};

export default function LuxuryPage() {
  return (
    <main>
      <HeroSection
        heroVideoSrc="/luxury.mp4"
        heroTitle="Luxury in motion"
        heroTagline="Bringing intelligent autonomous presence into hotels and hospitality—calm, capable, and present from the lobby to every corridor."
      />
      <PerformanceSection />
    </main>
  );
}
