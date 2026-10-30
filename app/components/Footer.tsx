"use client";

import Link from "next/link";

const LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "News & Events", href: "/updates" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/atsnrobotics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1CpPB7aHPM/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
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

        <div className="atsnFooter__bottom">
          <p className="atsnFooter__copy">
            © {new Date().getFullYear()} ATSN Robotics. ARGO is a product of ATSN Robotics. All
            rights reserved.
          </p>
          <div className="atsnFooter__social" aria-label="Social media">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="atsnFooter__socialLink"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
