import { createPageMetadata } from "../../lib/seo";
import { Lab } from "./Lab";

export const metadata = createPageMetadata({
  title: "Robot Lab | Robotics Lab",
  description: "Program your robot with visual blocks and test it in a browser simulation of real environments.",
  path: "/robotics-lab/lab",
  index: false,
});

export default function LabPage() {
  return <Lab />;
}
