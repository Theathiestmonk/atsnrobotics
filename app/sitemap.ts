import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.atsnrobotics.com";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sonic`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/flex`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/uno`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/custom`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/talk-to-us`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/updates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/careers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
