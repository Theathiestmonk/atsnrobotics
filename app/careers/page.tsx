import type { Metadata } from "next";
import { Careers } from "./Careers";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join ATSN Robotics. Build quiet, intelligent systems that help people move work forward.",
};

export default function CareersPage() {
  return <Careers />;
}

