import type { Metadata } from "next";
import { HeroSection } from "../components/HeroSection";
import { PerformanceSection } from "../components/PerformanceSection";

export const metadata: Metadata = {
  title: "Flex — Intelligence in motion",
  description:
    "Bringing intelligent autonomous robots into the spaces where people live, work, and interact.",
};

export default function FlexPage() {
  return (
    <main>
      <HeroSection heroVideoSrc="/hero.mp4" />
      <PerformanceSection />
    </main>
  );
}
