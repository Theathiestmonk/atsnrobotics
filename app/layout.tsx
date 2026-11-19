import type { Metadata } from "next";
import "./globals.css";
import "./atsn-pages.css";
import { Footer } from "./components/Footer";
import { SiteHeader } from "./components/SiteHeader";
import { ShellGuard } from "./components/ShellGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atsnrobotics.com"),
  title: {
    default: "ATSN Robotics | Autonomous Service & Delivery Robots",
    template: "%s | ATSN Robotics",
  },
  description:
    "ATSN Robotics manufactures the Argo fleet of autonomous service and delivery robots for hotels, restaurants, cafes, stadiums, and large venues. Reduce labor costs and improve guest experience.",
  keywords: [
    "ATSN Robotics",
    "autonomous service robots",
    "delivery robots",
    "hotel robot",
    "restaurant robot",
    "hospitality robot",
    "Argo robot",
    "Argo Sonic",
    "Argo Flex",
    "robot manufacturer",
    "indoor delivery robot",
  ],
  applicationName: "ATSN Robotics",
  openGraph: {
    title: "ATSN Robotics | Autonomous Service & Delivery Robots",
    description:
      "Meet the Argo fleet — autonomous service and delivery robots from ATSN Robotics, built for hotels, restaurants, cafes, stadiums, and large venues.",
    url: "https://www.atsnrobotics.com",
    siteName: "ATSN Robotics",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ATSN Robotics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATSN Robotics | Autonomous Service & Delivery Robots",
    description:
      "Meet the Argo fleet of autonomous service and delivery robots from ATSN Robotics — built for hotels, restaurants, cafes, and stadiums.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.atsnrobotics.com/#organization",
                  name: "ATSN Robotics",
                  url: "https://www.atsnrobotics.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.atsnrobotics.com/favicon-512.png",
                    width: 512,
                    height: 512,
                  },
                  description:
                    "ATSN Robotics manufactures the Argo fleet of autonomous service and delivery robots for hotels, restaurants, cafes, stadiums, and large venues.",
                  sameAs: [],
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "services@atsnai.com",
                    contactType: "sales",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.atsnrobotics.com/#website",
                  name: "ATSN Robotics",
                  url: "https://www.atsnrobotics.com",
                  publisher: { "@id": "https://www.atsnrobotics.com/#organization" },
                },
                {
                  "@type": "Product",
                  "@id": "https://www.atsnrobotics.com/sonic#product",
                  name: "Argo Sonic",
                  description:
                    "Autonomous hospitality service robot for hotels, restaurants, and cafes. Delivers room service, amenities, and food orders quietly and reliably.",
                  brand: { "@id": "https://www.atsnrobotics.com/#organization" },
                  url: "https://www.atsnrobotics.com/sonic",
                  image: "https://www.atsnrobotics.com/argo_sonic.webp",
                  category: "Autonomous Service Robot",
                  offers: {
                    "@type": "Offer",
                    availability: "https://schema.org/InStock",
                    url: "https://www.atsnrobotics.com/contact",
                  },
                },
                {
                  "@type": "Event",
                  name: "Amalthea Tech Expo 2026 — ATSN Robotics",
                  startDate: "2026-10-31",
                  endDate: "2026-11-01",
                  description:
                    "Visit ATSN Robotics at Amalthea Tech Expo 2026 at IIT Gandhinagar. Witness the official product launch of Argo Sonic — outdoor navigation demos and robotics in action at Booth B-2, U Corridor.",
                  location: {
                    "@type": "Place",
                    name: "IIT Gandhinagar",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Gandhinagar",
                      addressRegion: "Gujarat",
                      addressCountry: "IN",
                    },
                  },
                  organizer: { "@id": "https://www.atsnrobotics.com/#organization" },
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                },
                {
                  "@type": "Event",
                  name: "Tech EXPO Gujarat 2026 — ATSN Robotics",
                  startDate: "2026-11-27",
                  endDate: "2026-11-29",
                  description:
                    "See the Argo fleet live at Tech EXPO Gujarat 2026 at Gujarat University, Ahmedabad. ATSN Robotics will showcase autonomous service and delivery robots at our booth.",
                  location: {
                    "@type": "Place",
                    name: "Gujarat University",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Ahmedabad",
                      addressRegion: "Gujarat",
                      addressCountry: "IN",
                    },
                  },
                  organizer: { "@id": "https://www.atsnrobotics.com/#organization" },
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                },
                {
                  "@type": "Event",
                  name: "Techfest 2026 — ATSN Robotics",
                  startDate: "2026-12-16",
                  endDate: "2026-12-18",
                  description:
                    "ATSN Robotics is exhibiting at Techfest 2026, one of India's largest science and technology festivals at IIT Bombay. See Argo Sonic and Argo Influence working live.",
                  location: {
                    "@type": "Place",
                    name: "IIT Bombay",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Mumbai",
                      addressRegion: "Maharashtra",
                      addressCountry: "IN",
                    },
                  },
                  organizer: { "@id": "https://www.atsnrobotics.com/#organization" },
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                },
                {
                  "@type": "Event",
                  name: "WOHXpo 2027 — ATSN Robotics",
                  startDate: "2027-02-02",
                  endDate: "2027-02-04",
                  description:
                    "ATSN Robotics is exhibiting at WOHXpo 2027 at Nesco Hall 5, Goregaon, Mumbai. See Argo Sonic and Argo Influence live — built for hospitality professionals.",
                  location: {
                    "@type": "Place",
                    name: "Nesco Exhibition Centre, Hall 5",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Mumbai",
                      addressRegion: "Maharashtra",
                      addressCountry: "IN",
                    },
                  },
                  organizer: { "@id": "https://www.atsnrobotics.com/#organization" },
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                },
                {
                  "@type": "Product",
                  "@id": "https://www.atsnrobotics.com/flex#product",
                  name: "Argo Flex",
                  description:
                    "Autonomous delivery robot for stadiums, arenas, concourses, and large event venues. Built for high foot traffic and event-day scale.",
                  brand: { "@id": "https://www.atsnrobotics.com/#organization" },
                  url: "https://www.atsnrobotics.com/flex",
                  image: "https://www.atsnrobotics.com/ARGO_Flex.webp",
                  category: "Autonomous Delivery Robot",
                  offers: {
                    "@type": "Offer",
                    availability: "https://schema.org/PreOrder",
                    url: "https://www.atsnrobotics.com/contact",
                  },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <ShellGuard header={<SiteHeader />} footer={<Footer />}>
          {children}
        </ShellGuard>
      </body>
    </html>
  );
}
