import { createPageMetadata } from "./lib/seo";
import { HomeExperience } from "./components/HomeExperience";

export const metadata = createPageMetadata({
  title: "Autonomous Service & Delivery Robots for Hotels, Restaurants & Venues",
  description:
    "ATSN Robotics builds the Argo fleet — autonomous service and delivery robots for hotels, restaurants, cafes, stadiums, and large venues. Reduce labor costs and elevate the guest experience.",
  path: "/",
  keywords: [
    "hotel robot",
    "restaurant delivery robot",
    "autonomous robot for hospitality",
    "service robot hotel",
    "food delivery robot restaurant",
    "robot waiter",
    "Argo Sonic",
    "Argo Flex",
    "venue delivery robot",
    "autonomous indoor delivery",
  ],
});

export default function Home() {
  return <HomeExperience />;
}
