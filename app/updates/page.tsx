import type { Metadata } from "next";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";
import { UPDATE_PREVIEWS } from "../lib/update-previews";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "Follow ATSN Robotics for company stories, upcoming events, and Argo product updates.",
};

export default function UpdatesPage() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">News &amp; Events</p>
        <BlurText text="What’s happening at ATSN." as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            Follow our stories, upcoming events, and updates from across the Argo fleet. We’re
            preparing our first announcements—check back soon.
          </p>
        </ScrollReveal>

        <section className="atsnSection updatesGrid" aria-label="News and events previews">
          {UPDATE_PREVIEWS.map((item) => (
            <article className="atsnCard updatesCard" key={item.category}>
              <p className="atsnCard__kicker">{item.category}</p>
              <h2 className="atsnCard__title">{item.title}</h2>
              <p className="atsnCard__body">{item.description}</p>
              <span className="updatesCard__status">{item.status}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
