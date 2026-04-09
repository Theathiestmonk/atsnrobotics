"use client";

import Link from "next/link";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export function AboutUs() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <p className="atsnHero__eyebrow">About</p>
        <BlurText text="About ATSN Robotics" as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            We build robots that feel native to the spaces they serve. ARGO is our first expression
            of that belief: autonomous, quiet, and thoughtfully present—designed to move goods
            through real environments without asking people to change how they work.
          </p>
        </ScrollReveal>

        <div className="atsnHero__ctaRow">
          <Link className="atsnBtn atsnBtn--primary" href="/products">
            Meet ARGO
          </Link>
          <Link className="atsnBtn" href="/contact">
            Let’s talk
          </Link>
        </div>

        <section className="atsnSection" aria-label="Mission">
          <ScrollReveal>
            <h2 className="atsnSection__title">Mission</h2>
            <p className="atsnSection__sub">
              Build technology that feels like it belongs—without sharp learning curves. We design
              for the person who’s already busy. If a robot requires constant attention, it’s not
              support; it’s another task. Our mission is to create intelligent motion that reduces
              friction, respects the flow of a space, and earns trust through consistency.
            </p>
          </ScrollReveal>
        </section>

        <section className="atsnSection" aria-label="Vision">
          <ScrollReveal>
            <h2 className="atsnSection__title">Vision</h2>
            <p className="atsnSection__sub">
              We believe the future of work includes a quiet current of support for human teams.
              Not a replacement—an assist. The most valuable work in hospitality, retail, and live
              events is human: judgment, care, and presence. Our vision is a layer of robotics that
              carries the repetitive movement so people can stay in the moments that create quality.
            </p>
          </ScrollReveal>
        </section>

        <section className="atsnSection" aria-label="Engineering philosophy">
          <div className="atsnGrid">
            <div className="atsnCard" style={{ gridColumn: "span 7" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Engineering philosophy</p>
                <h3 className="atsnCard__title">Graceful mobility, unobtrusive presence.</h3>
                <p className="atsnCard__body">
                  ARGO is engineered around a simple standard: it should move as if it understands
                  the room. That means stable, fluid motion; human-aware behavior; and a presence
                  that doesn’t demand attention. We tune the details—approach speed, turning
                  confidence, noise profile, visual cues—because a robot in a shared space is
                  ultimately a social object.
                </p>
              </ScrollReveal>
            </div>

            <div className="atsnCard" style={{ gridColumn: "span 5" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">What we optimize for</p>
                <h3 className="atsnCard__title">Reliability over theater.</h3>
                <p className="atsnCard__body">
                  Robotics succeeds when it is dependable in the background. We prioritize real
                  uptime, predictable behavior, and operational clarity—so deployments don’t feel
                  like a project. They feel like capacity.
                </p>
                <div className="atsnCard__meta" aria-label="Principles">
                  <span className="atsnPill">
                    <span className="atsnPill__dot" aria-hidden="true" />
                    Calm motion
                  </span>
                  <span className="atsnPill">
                    <span className="atsnPill__dot" aria-hidden="true" />
                    Clear intent
                  </span>
                  <span className="atsnPill">
                    <span className="atsnPill__dot" aria-hidden="true" />
                    Low noise
                  </span>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="atsnSection" aria-label="Closing">
          <ScrollReveal>
            <h2 className="atsnSection__title">The work is movement—and movement is experience.</h2>
            <p className="atsnSection__sub">
              Whether it’s a hotel corridor, a retail aisle, or an arena concourse, the way goods
              move shapes how people feel. Our goal is simple: make that movement quieter, smoother,
              and more intelligent—so the human experience can stay front and center.
            </p>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

