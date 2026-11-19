import { RobotProductPage } from "../components/RobotProductPage";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "Argo Influence — Autonomous Advertisement Robot for Events & Parties",
  description:
    "Argo Influence by ATSN Robotics is an autonomous advertisement and engagement robot built for parties, corporate events, exhibitions, and brand activations. Dynamic displays, roaming presence, and crowd interaction — all in one robot.",
  path: "/influence",
  keywords: [
    "Argo Influence",
    "advertisement robot",
    "event robot",
    "party robot",
    "brand activation robot",
    "exhibition robot",
    "autonomous display robot",
    "interactive event robot",
    "ATSN Robotics",
  ],
});

export default function InfluencePage() {
  return (
    <RobotProductPage
      model="Argo Influence"
      eyebrow="Events & brand presence"
      status="Coming soon"
      headline="Your brand, moving through the crowd."
      introduction="Argo Influence is an autonomous advertisement and engagement robot built for parties, corporate events, exhibitions, and brand activations. It roams, displays, and interacts — turning any venue into an experience."
      imageSrc="/argo_influence.webp"
      imageAlt="Argo Influence autonomous advertisement robot"
      emphasizeImage
      detailTitle="Built for every kind of event."
      detail="From product launches and brand activations to weddings, concerts, and trade shows — Argo Influence brings dynamic digital displays and autonomous crowd presence to any space. It moves through guests independently, drawing attention and delivering your message on the move. Detailed specifications will be shared as the model approaches launch."
      nextHref="/sonic"
      nextLabel="Explore Argo Sonic"
    />
  );
}
