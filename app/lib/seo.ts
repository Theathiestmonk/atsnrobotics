import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
};

const BASE_KEYWORDS = [
  "ATSN Robotics",
  "Argo robot",
  "autonomous service robot",
  "delivery robot",
  "hospitality robot",
];

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  index = true,
}: PageMetadataOptions): Metadata {
  const brandedTitle = `${title} | ATSN Robotics`;
  const allKeywords = [...BASE_KEYWORDS, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: { canonical: path },
    openGraph: {
      title: brandedTitle,
      description,
      url: path,
      siteName: "ATSN Robotics",
      locale: "en_US",
      type: "website",
      images: [{ url: "/logo.png", width: 1080, height: 1080, alt: "ATSN Robotics" }],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: ["/logo.png"],
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
