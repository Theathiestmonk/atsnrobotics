import type { Metadata } from "next";
import { HeroSection } from "../components/HeroSection";
import { PerformanceSection } from "../components/PerformanceSection";
import { SonicScrollHero } from "../components/SonicScrollHero";

export const metadata: Metadata = {
  title: "Luxury in motion",
  description:
    "Bringing intelligent autonomous presence into hotels, restaurants, and cafes—calm, capable, and tuned to lobbies, corridors, and guest-facing moments.",
};

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