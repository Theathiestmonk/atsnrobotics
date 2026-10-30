import { UnoContribution } from "../components/UnoContribution";
import { RobotProductPage } from "../components/RobotProductPage";
import { createPageMetadata } from "../lib/seo";

export const metadata = createPageMetadata({
  title: "Argo Uno Robot",
  description:
    "Follow Argo Uno, the next autonomous robot in development for the ATSN Robotics fleet. Product details and availability will be announced as development progresses.",
  path: "/uno",
});

export default function UnoPage() {
  return (
    <>
      <RobotProductPage
        model="Argo Uno"
        eyebrow="The next Argo model"
        status="In development"
        headline="A new model is taking shape."
        introduction="Argo Uno is currently in development. We’ll share its role, product details, and availability as the design progresses."
        imageSrc="/argo_uno_upscaled_2x_file_size__1_-removebg-preview.png"
        imageAlt="Argo Uno robot concept"
        detailTitle="A work in progress, by design."
        detail="We are developing Argo Uno as the next addition to the Argo fleet. This concept render offers a first look; final specifications and availability will be shared as development progresses."
        nextHref="/flex"
        nextLabel="Explore Argo Flex"
      />
      <UnoContribution />
    </>
  );
}