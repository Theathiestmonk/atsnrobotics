import type { Metadata } from "next";
import "./globals.css";
import "./atsn-pages.css";
import { Footer } from "./components/Footer";
import { SiteHeader } from "./components/SiteHeader";


export const metadata: Metadata = {
  title: "Intelligence in motion",
  description:
    "Bringing intelligent autonomous robots into the spaces where people live, work, and interact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="siteShell">
          <SiteHeader />
          <div className="siteMain">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
