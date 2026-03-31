import type { Metadata } from "next";
import { HeroSection } from "../components/HeroSection";
import { PerformanceSection } from "../components/PerformanceSection";

export const metadata: Metadata = {
  title: "Influence in motion",
  description:
    "Bringing intelligent autonomous presence into retail and high-traffic spaces—aisles, atriums, and the flow of people who shop, browse, and connect.",
};

export default function InfluencePage() {
  return (
    <main>
      <HeroSection
        heroVideoSrc="/influence.mp4"
        heroTitle="Influence in motion"
        heroTagline="Bringing intelligent autonomous presence into retail and public spaces—built for aisles, atriums, and the shifting flow of people who discover, decide, and connect."
      />
      <PerformanceSection />
    </main>
  );
}
