"use client";

import Link from "next/link";

const LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

export function Footer() {
  return (
    <footer className="atsnFooter" aria-label="Footer">
      <div className="atsnFooter__inner">
        <nav className="atsnFooter__nav" aria-label="Footer navigation">
          {LINKS.map((l) => (
            <Link key={l.href} className="atsnFooter__link" href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="atsnFooter__copy">
          © {new Date().getFullYear()} ATSN Robotics. ARGO is a product of ATSN Robotics. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}

