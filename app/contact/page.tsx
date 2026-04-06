import type { Metadata } from "next";
import { Contact } from "./Contact";

export const metadata: Metadata = {
  title: "Let’s Talk",
  description:
    "Sales inquiries, press, and support—tell us about your space and we’ll explore how ARGO can help.",
};

export default function ContactPage() {
  return <Contact />;
}

