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

const EVENTS = [
  {
    tag: "Live now",
    tagColor: "#22c55e",
    logo: "/amalthea-logo.png",
    logoAlt: "Amalthea IIT Gandhinagar",
    organizer: "Amalthea Tech Expo · IIT Gandhinagar",
    title: "Visit Us at Amalthea Tech Expo 2026",
    dates: "Oct 31 – Nov 1, 2026",
    booth: "Booth B-2, U Corridor",
    instagram: "https://www.instagram.com/amalthea_iitgn",
    description:
      "We're officially launching Argo Sonic at Amalthea 2026. Come see the robot live: outdoor navigation, demos, and robotics in action. Stop by Booth B-2 to explore our company, products, and services.",
    highlights: [
      { label: "Live Demos" },
      { label: "Our Products & Services" },
      { label: "Robotics in Action" },
    ],
  },
  {
    tag: "Coming up",
    tagColor: "#3b82f6",
    logo: null,
    logoAlt: null,
    organizer: "Tech EXPO Gujarat · Gujarat University, Ahmedabad",
    title: "ATSN Robotics at Tech EXPO Gujarat 2026",
    dates: "Nov 27 – 29, 2026",
    booth: null,
    instagram: null,
    description:
      "ATSN Robotics is exhibiting at Tech EXPO Gujarat 2026, Gujarat University. Visit our booth to explore our company, products, and services. See Argo Sonic in a live demo and get a first look at what’s coming next with Argo Flex and Uno.",
    highlights: [
      { label: "Argo Sonic Live Demo" },
      { label: "Sneak Peek: Argo Flex & Uno" },
      { label: "Meet the ATSN Team" },
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
            Events 2026
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {EVENTS.map((event) => (
              <article
                key={event.title}
                style={{
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Top bar with tag */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: event.tagColor,
                  }}>
                    ● {event.tag}
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
                          border: `1px solid ${event.tagColor}33`,
                          background: `${event.tagColor}11`,
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
            ))}
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
