import { RobotProductPage } from "../components/RobotProductPage";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "Argo Flex — Autonomous Delivery Robot for Stadiums & Large Venues",
  description:
    "Argo Flex by ATSN Robotics is an autonomous delivery robot built for stadiums, arenas, concourses, and large event venues. Designed for scale, high foot traffic, and event-day operations.",
  path: "/flex",
  keywords: [
    "Argo Flex",
    "stadium delivery robot",
    "large venue robot",
    "arena delivery robot",
    "autonomous venue robot",
    "event robot",
    "concourse delivery robot",
  ],
});

export default function FlexPage() {
  return (
    <RobotProductPage
      model="Argo Flex"
      eyebrow="Large venue delivery"
      status="Coming soon"
      headline="Delivery built for the scale of big venues."
      introduction="Argo Flex is being developed for the pace and footprint of stadiums, arenas, and other large venues."
      imageSrc="/argo_flex_rover_3x_upscaled-removebg-preview.png"
      imageAlt="Argo Flex autonomous delivery robot"
      emphasizeImage
      detailTitle="Made for larger spaces."
      detail="From concourses to event-day operations, Argo Flex is designed around the movement demands of busy venues. Product details will be shared as the model moves toward launch."
      nextHref="/uno"
      nextLabel="Explore Argo Uno"
    />
  );
}
