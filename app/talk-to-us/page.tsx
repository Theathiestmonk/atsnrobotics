import { createPageMetadata } from "../lib/seo";
import { TalkToUs } from "./TalkToUs";

export const metadata = createPageMetadata({
  title: "Talk to ATSN Robotics — Deploy an Argo Robot",
  description:
    "Tell us about your hotel, restaurant, stadium, or venue and we'll explore how Argo robots can help. Our team will follow up with a deployment plan tailored to your space.",
  path: "/talk-to-us",
  keywords: ["deploy robot", "robot for my business", "autonomous robot inquiry", "Argo robot demo"],
});

export default function TalkToUsPage() {
  return <TalkToUs />;
}
