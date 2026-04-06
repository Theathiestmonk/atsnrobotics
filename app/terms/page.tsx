import type { Metadata } from "next";
import { Terms } from "./Terms";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms governing the use of ATSN Robotics hardware and software, including ARGO autonomous operations and software licensing.",
};

export default function TermsPage() {
  return <Terms />;
}

