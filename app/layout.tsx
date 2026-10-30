import type { Metadata } from "next";
import "./globals.css";
import "./atsn-pages.css";
import { Footer } from "./components/Footer";
import { SiteHeader } from "./components/SiteHeader";

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
    images: [{ url: "/logo.png", width: 1080, height: 1080, alt: "ATSN Robotics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATSN Robotics | Autonomous Service & Delivery Robots",
    description:
      "Meet the Argo fleet of autonomous service and delivery robots from ATSN Robotics — built for hotels, restaurants, cafes, and stadiums.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
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
                    url: "https://www.atsnrobotics.com/logo.png",
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
                  image: "https://www.atsnrobotics.com/argo_sonic_tall_robot_3x_upscaled-removebg-preview.png",
                  category: "Autonomous Service Robot",
                  offers: {
                    "@type": "Offer",
                    availability: "https://schema.org/InStock",
                    url: "https://www.atsnrobotics.com/contact",
                  },
                },
                {
                  "@type": "Product",
                  "@id": "https://www.atsnrobotics.com/flex#product",
                  name: "Argo Flex",
                  description:
                    "Autonomous delivery robot for stadiums, arenas, concourses, and large event venues. Built for high foot traffic and event-day scale.",
                  brand: { "@id": "https://www.atsnrobotics.com/#organization" },
                  url: "https://www.atsnrobotics.com/flex",
                  image: "https://www.atsnrobotics.com/argo_flex_rover_3x_upscaled-removebg-preview.png",
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
        <div className="siteShell">
          <SiteHeader />
          <div className="siteMain">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
