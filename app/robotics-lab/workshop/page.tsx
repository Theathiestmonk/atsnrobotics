import { createPageMetadata } from "../../lib/seo";
import { Workshop } from "./Workshop";

export const metadata = createPageMetadata({
  title: "Robot Workshop | Robotics Lab",
  description: "Assemble a robot from precision hardware, unlock autonomous capabilities and prepare it for simulation.",
  path: "/robotics-lab/workshop",
  index: false,
});

export default function WorkshopPage() {
  return <Workshop />;
}
