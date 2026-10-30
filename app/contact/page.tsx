import { createPageMetadata } from "../lib/seo";
import { Contact } from "./Contact";

export const metadata = createPageMetadata({
  title: "Contact ATSN Robotics — Sales, Press & Support",
  description:
    "Get in touch with ATSN Robotics for sales inquiries, robot deployment consultations, press, or support. Tell us about your hotel, restaurant, or venue and we’ll explore how Argo can help.",
  path: "/contact",
  keywords: [
    "contact ATSN Robotics",
    "robot deployment inquiry",
    "buy hospitality robot",
    "robot sales",
  ],
});

export default function ContactPage() {
  return <Contact />;
}

