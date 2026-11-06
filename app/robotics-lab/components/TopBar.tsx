"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { levelFromXp } from "../data/catalog";
import type { Profile } from "../data/store";
import { Icon } from "./Icon";
import { useRLTheme } from "./Theme";

const TABS = [
  { href: "/robotics-lab/workshop", label: "Workshop", icon: "wrench" as const },
  { href: "/robotics-lab/lab", label: "Robot Lab", icon: "play" as const },
];

export function TopBar({ profile }: { profile: Profile }) {
  const path = usePathname();
  const level = levelFromXp(profile.xp);
  const { theme, toggle } = useRLTheme();
  const into = profile.xp % 1000;
  return (
    <header className="rl-top">
      <Link href="/robotics-lab/workshop" className="rl-brand">
        <img src="/logo.png" alt="" width={34} height={34} />
        <span>
          <strong>Robotics Lab</strong>
          <small>Build · Simulate · Master</small>
        </span>
      </Link>
      <nav className="rl-tabs" aria-label="Robotics Lab sections">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`rl-tab ${path?.startsWith(t.href) ? "is-active" : ""}`}>
            <Icon name={t.icon} />
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="rl-top__stats">
        <button
          type="button"
          className="rl-iconbtn rl-theme-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <div className="rl-chip" title="Experience earned from missions">
          <Icon name="spark" className="rl-gold" />
          <strong>{profile.xp.toLocaleString("en-US")}</strong>
          <span>XP</span>
        </div>
        <div className="rl-chip rl-level" title={`${into} / 1000 XP to next level`}>
          <span>Lv.</span>
          <strong>{level}</strong>
          <i style={{ width: `${into / 10}%` }} />
        </div>
      </div>
    </header>
  );
}
