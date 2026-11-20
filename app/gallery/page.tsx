import { createPageMetadata } from "../lib/seo";
import { Gallery } from "./Gallery";

export const metadata = createPageMetadata({
  title: "Gallery - ATSN Robotics",
  description:
    "Explore the Argo fleet in action. Photos of Argo Sonic, Argo Influence, Argo Flex, and Argo Uno across hotels, events, stadiums, and more.",
  path: "/gallery",
  keywords: [
    "argo robot gallery",
    "atsn robotics photos",
    "hospitality robot images",
    "autonomous robot pictures",
  ],
});

export default function GalleryPage() {
  return <Gallery />;
}
