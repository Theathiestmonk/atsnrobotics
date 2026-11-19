import Image from "next/image";
import { createPageMetadata } from "../lib/seo";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export const metadata = createPageMetadata({
  title: "News & Events",
  description:
    "Follow ATSN Robotics for company stories, upcoming events, and Argo product updates.",
  path: "/updates",
});

function getStatus(start: Date, end: Date): { tag: string; liveColor: string; isLive: boolean; isPast: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (now >= start && now <= end) return { tag: "Live now", liveColor: "#22c55e", isLive: true, isPast: false };
  if (now > end) return { tag: "Past event", liveColor: "rgba(255,255,255,0.3)", isLive: false, isPast: true };
  return { tag: "Upcoming", liveColor: "", isLive: false, isPast: false };
}

const EVENTS = [
  {
    baseColor: "#c9a962",
    start: new Date("2026-11-27"),
    end: new Date("2026-11-29"),
    logo: null,
    logoAlt: null,
    organizer: "Tech EXPO Gujarat · Gujarat University, Ahmedabad",
    title: "ATSN Robotics at Tech EXPO Gujarat 2026",
    dates: "Nov 27 – 29, 2026",
    booth: null,
    instagram: null,
    description:
      "ATSN Robotics is exhibiting at Tech EXPO Gujarat 2026, Gujarat University. Visit our booth to explore our company, products, and services. See Argo Sonic in a live demo and get a first look at what’s coming next with Argo Flex and Argo Influence.",
    highlights: [
      { label: "Argo Sonic Live Demo" },
      { label: "Argo Flex & Influence" },
      { label: "Meet the ATSN Team" },
    ],
  },
  {
    baseColor: "#22d3ee",
    start: new Date("2026-12-16"),
    end: new Date("2026-12-18"),
    logo: null,
    logoAlt: null,
    organizer: "Techfest · IIT Bombay, Mumbai",
    title: "ATSN Robotics at Techfest 2026",
    dates: "Dec 16 – 18, 2026",
    booth: null,
    instagram: null,
    description:
      "We’re taking Argo Sonic and Argo Influence to Techfest — one of India’s largest science and technology festivals, hosted at IIT Bombay. Come see both robots working live on the floor. Our team will be there to demo, answer technical questions, and talk about how we build autonomous robots in India. Students, engineers, and innovators are all welcome.",
    highlights: [
      { label: "Argo Sonic Live Demo" },
      { label: "Argo Influence" },
      { label: "Meet the Team" },
    ],
  },
  {
    baseColor: "#fb923c",
    start: new Date("2027-02-02"),
    end: new Date("2027-02-04"),
    logo: null,
    logoAlt: null,
    organizer: "WOHXpo · Nesco Hall 5, Goregaon, Mumbai",
    title: "ATSN Robotics at WOHXpo 2027",
    dates: "Feb 2 – 4, 2027",
    booth: null,
    instagram: null,
    description:
      "Restaurant and hotel owners — this one is for you. We’ll be at WOHXpo 2027 with Argo Sonic and Argo Influence working live on the floor. Argo Sonic serves food and drinks, cuts wait times, and keeps service consistent during rush hours. Our team will be on hand to show how both robots fit into real hospitality operations and to arrange a custom demo for your venue.",
    highlights: [
      { label: "Argo Sonic" },
      { label: "Argo Influence" },
      { label: "Live Hospitality Demo" },
    ],
  },
  {
    baseColor: "rgba(255,255,255,0.3)",
    start: new Date("2026-10-31"),
    end: new Date("2026-11-01"),
    logo: "/amalthea-logo.png",
    logoAlt: "Amalthea IIT Gandhinagar",
    organizer: "Amalthea Tech Expo · IIT Gandhinagar",
    title: "Argo Sonic: Official Product Launch at Amalthea 2026",
    dates: "Oct 31 – Nov 1, 2026",
    booth: "Booth B-2, U Corridor",
    instagram: "https://www.instagram.com/amalthea_iitgn",
    description:
      "Argo Sonic made its official product debut at Amalthea 2026. The robot navigated live, delivered autonomously, and was on show at Booth B-2 throughout the event.",
    highlights: [
      { label: "Product Launch" },
      { label: "Live Navigation Demo" },
      { label: "Robotics in Action" },
    ],
  },
];

export default function UpdatesPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">News &amp; Events</p>
        <BlurText text="What’s happening at ATSN." as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            Follow our stories, upcoming events, and updates from across the Argo fleet.
          </p>
        </ScrollReveal>

        {/* Events */}
        <section aria-label="Events" style={{ marginTop: "3.5rem" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "1.25rem" }}>
            Events 2026 – 2027
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {EVENTS.map((event) => {
              const { tag, liveColor, isLive, isPast } = getStatus(event.start, event.end);
              const tagColor = isLive ? "#22c55e" : isPast ? "rgba(255,255,255,0.3)" : event.baseColor;
              const cardBorder = isLive ? "rgba(34,197,94,0.35)" : isPast ? "rgba(255,255,255,0.08)" : `${event.baseColor}40`;
              const cardBg = isLive ? "linear-gradient(145deg, rgba(34,197,94,0.1), rgba(255,255,255,0.02))" : isPast ? "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" : `linear-gradient(145deg, ${event.baseColor}0f, rgba(255,255,255,0.02))`;
              return (
              <article
                key={event.title}
                style={{
                  borderRadius: "20px",
                  border: `1px solid ${cardBorder}`,
                  background: cardBg,
                  overflow: "hidden",
                }}
              >
                {/* Top bar with tag */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.5rem",
                  borderBottom: `1px solid ${isLive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)"}`,
                  background: isLive ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
                }}>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: tagColor,
                  }}>
                    ● {tag}
                  </span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.45 }}>{event.dates}</span>
                </div>

                {/* Body */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: event.logo ? "1fr auto" : "1fr",
                  gap: "1.5rem",
                  padding: "1.75rem 1.5rem",
                  alignItems: "start",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Organizer */}
                    <p style={{ fontSize: "0.8rem", opacity: 0.45, margin: 0, fontWeight: 500 }}>
                      {event.organizer}
                    </p>

                    {/* Title */}
                    <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 1.7rem)", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                      {event.title}
                    </h2>

                    {/* Description */}
                    <p style={{ fontSize: "0.925rem", lineHeight: 1.7, opacity: 0.6, margin: 0, maxWidth: "55ch" }}>
                      {event.description}
                    </p>

                    {/* Highlights */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                      {event.highlights.map((h) => (
                        <span key={h.label} style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.4rem 0.85rem",
                          borderRadius: "999px",
                          border: `1px solid ${tagColor}33`,
                          background: `${tagColor}11`,
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.75)",
                        }}>
                          {h.label}
                        </span>
                      ))}
                    </div>

                    {/* Booth */}
                    {event.booth && (
                      <p style={{ fontSize: "0.82rem", opacity: 0.5, margin: 0 }}>
                        {event.booth}
                      </p>
                    )}

                    {/* Instagram link */}
                    {event.instagram && (
                      <a
                        href={event.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eventInstagramLink"
                      >
                        Follow Amalthea on Instagram →
                      </a>
                    )}
                  </div>

                  {/* Logo */}
                  {event.logo && (
                    <div style={{
                      width: 90,
                      height: 90,
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}>
                      <Image
                        src={event.logo}
                        alt={event.logoAlt ?? ""}
                        width={80}
                        height={80}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        </section>

        {/* Coming soon */}
        <section aria-label="Coming soon" style={{ marginTop: "3.5rem" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "1.25rem" }}>
            From the team
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Blog", title: "Stories from ATSN Robotics", body: "Insights on robotics, service, and the spaces where people gather.", status: "Articles coming soon" },
              { label: "Product updates", title: "What’s next for Argo", body: "Product news and milestones from across the Argo fleet.", status: "Updates coming soon" },
            ].map((item) => (
              <article key={item.label} className="atsnCard" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <p className="atsnCard__kicker">{item.label}</p>
                <h3 className="atsnCard__title">{item.title}</h3>
                <p className="atsnCard__body">{item.body}</p>
                <span className="updatesCard__status" style={{ marginTop: "auto" }}>{item.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
