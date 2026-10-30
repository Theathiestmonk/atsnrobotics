import { createPageMetadata } from "../lib/seo";
import { Game } from "./Game";

export const metadata = createPageMetadata({
  title: "Argo Delivery Run",
  description:
    "Play Argo Delivery Run — dodge obstacles and deliver to every table before time runs out. An ATSN Robotics mini game.",
  path: "/activity",
  index: false,
});

export default function ActivityPage() {
  return <Game />;
}
