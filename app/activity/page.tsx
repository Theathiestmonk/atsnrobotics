import { createPageMetadata } from "../lib/seo";
import { ActivityHub } from "./ActivityHub";

export const metadata = createPageMetadata({
  title: "Activity Zone",
  description:
    "Play Argo Delivery Run and Shortest Path Challenge — interactive mini games featuring ATSN Robotics Argo Sonic robot.",
  path: "/activity",
  index: false,
});

export default function ActivityPage() {
  return <ActivityHub />;
}
