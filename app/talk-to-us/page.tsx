import type { Metadata } from "next";
import { TalkToUs } from "./TalkToUs";

export const metadata: Metadata = {
  title: "Talk to us",
  description:
    "Tell us about your business and where you'd like to deploy ARGO. Our team will follow up with next steps.",
};

export default async function TalkToUsPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const params = await searchParams;
  const model = params.model?.trim() || "ARGO Sonic";

  return <TalkToUs model={model} />;
}
