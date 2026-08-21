"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const panelId = useId();
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 80) {
        setBarHidden(false);
      } else if (delta > 4) {
        setBarHidden(true);
      } else if (delta < -4) {
        setBarHidden(false);
      }

      lastScrollY.current = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeIfDesktop = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", closeIfDesktop);
    closeIfDesktop();
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className="siteHeader">
      <div
        className={`siteHeader__bar${barHidden && !menuOpen ? " siteHeader__bar--hidden" : ""}`}
      >
        <Link className="siteHeader__logo" href="/" aria-label="Home">
          <img
            className="siteHeader__logoImg"
            src="/logo.png"
            alt=""
            width={320}
            height={82}
          />
          <span className="siteHeader__logoText">atsn robotics</span>
        </Link>

        <nav className="siteHeader__navDesktop" aria-label="Main navigation">
          <ul className="siteHeader__list">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    className={`siteHeader__link${active ? " siteHeader__link--active" : ""}`}
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className={`siteHeader__burger${menuOpen ? " siteHeader__burger--open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="siteHeader__burgerLines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="siteHeader__burgerLabel">Menu</span>
        </button>
      </div>

      <div
        id={panelId}
        className={`siteHeader__panel${menuOpen ? " siteHeader__panel--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="siteHeader__panelNav" aria-label="Mobile navigation">
          <ul className="siteHeader__panelList">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    className={`siteHeader__panelLink${active ? " siteHeader__panelLink--active" : ""}`}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="siteHeader__backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}
