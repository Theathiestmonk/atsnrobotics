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
    tag: "Live event",
    tagColor: "#22c55e",
    title: "Amalthea Tech Expo 2026",
    venue: "IIT Gandhinagar",
    dates: "Oct 31 – Nov 1, 2026",
    booth: "Booth B-2, U Corridor",
    description:
      "We’re launching the Argo Sonic prototype at Amalthea Tech Expo 2026. Come see outdoor navigation demos and robotics in action at our stall.",
    highlights: ["Argo Sonic Prototype Launch", "Outdoor Navigation Demo", "Robotics in Action"],
  },
  {
    tag: "Upcoming event",
    tagColor: "#3b82f6",
    title: "Tech EXPO Gujarat 2026",
    venue: "Gujarat University, Ahmedabad",
    dates: "Nov 27 – 29, 2026",
    booth: null,
    description:
      "ATSN Robotics will showcase the full Argo fleet at Tech EXPO Gujarat 2026. Meet the team and experience autonomous service and delivery robots up close.",
    highlights: ["Full Argo Fleet Showcase", "Live Robot Demos", "Meet the Team"],
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

        <section className="atsnSection" aria-label="Events" style={{ marginTop: "3rem" }}>
          <p className="atsnCard__kicker" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", letterSpacing: "0.08em", opacity: 0.5, textTransform: "uppercase" }}>Upcoming Events</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {EVENTS.map((event) => (
              <article
                key={event.title}
                className="atsnCard"
                style={{ display: "flex", flexDirection: "column", gap: "1.2rem", padding: "clamp(1.4rem, 3vw, 2rem)" }}
              >
                {/* Tag */}
                <span style={{
                  alignSelf: "flex-start",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: `${event.tagColor}22`,
                  color: event.tagColor,
                  border: `1px solid ${event.tagColor}44`,
                }}>
                  {event.tag}
                </span>

                {/* Title */}
                <div>
                  <h2 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.55rem)", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                    {event.title}
                  </h2>
                  <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", opacity: 0.55, margin: "0.4rem 0 0" }}>
                    {event.venue}
                  </p>
                </div>

                {/* Date & Booth */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.35rem 0.75rem", borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "0.8rem", color: "rgba(255,255,255,0.7)",
                  }}>
                    📅 {event.dates}
                  </span>
                  {event.booth && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      padding: "0.35rem 0.75rem", borderRadius: "999px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: "0.8rem", color: "rgba(255,255,255,0.7)",
                    }}>
                      📍 {event.booth}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.95rem", lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
                  {event.description}
                </p>

                {/* Highlights */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                  {event.highlights.map((h) => (
                    <li key={h} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", opacity: 0.8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: event.tagColor, flexShrink: 0, display: "inline-block" }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="atsnSection" aria-label="Coming soon" style={{ marginTop: "3rem" }}>
          <p className="atsnCard__kicker" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", letterSpacing: "0.08em", opacity: 0.5, textTransform: "uppercase" }}>From the team</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem" }}>
            {[
              { label: "Blog", title: "Stories from ATSN Robotics", body: "Insights on robotics, service, and the spaces where people gather.", status: "Articles coming soon" },
              { label: "Product updates", title: "What’s next for Argo", body: "Product news and milestones from across the Argo fleet.", status: "Updates coming soon" },
            ].map((item) => (
              <article key={item.label} className="atsnCard" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
