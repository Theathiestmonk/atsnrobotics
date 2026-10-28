import type { Metadata } from "next";
import { RobotProductPage } from "../components/RobotProductPage";

export const metadata: Metadata = {
  title: "Argo Flex | ATSN Robotics",
  description:
    "Meet Argo Flex, ATSN Robotics' autonomous delivery robot designed for stadiums and large venues. Coming soon.",
};

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
