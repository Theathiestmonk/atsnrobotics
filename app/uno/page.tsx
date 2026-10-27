import type { Metadata } from "next";
import { RobotProductPage } from "../components/RobotProductPage";

export const metadata: Metadata = {
  title: "Argo Uno | ATSN Robotics",
  description:
    "Follow the development of Argo Uno, the next robot in the ATSN Robotics fleet.",
};

export default function UnoPage() {
  return (
    <RobotProductPage
      model="Argo Uno"
      eyebrow="The next Argo model"
      status="In development"
      headline="A new model is taking shape."
      introduction="Argo Uno is currently in development. We’ll share its role, product details, and availability as the design progresses."
      detailTitle="A work in progress, by design."
      detail="We are developing Argo Uno as the next addition to the Argo fleet. The product render and confirmed specifications are not available yet."
      nextHref="/flex"
      nextLabel="Explore Argo Flex"
    />
  );
}