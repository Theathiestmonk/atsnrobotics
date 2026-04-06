"use client";

import Link from "next/link";
import { BlurText } from "../components/BlurText";
import { LightRays } from "../components/LightRays";
import { ScrollReveal } from "../components/ScrollReveal";

export function Careers() {
  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <LightRays intensity={0.7} />

        <p className="atsnHero__eyebrow">Careers</p>
        <BlurText text="Build robots that belong." as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            ATSN Robotics exists to make intelligent motion feel calm, obvious, and trustworthy in
            real spaces. If you care about systems that work outside the lab—near people, under
            pressure, and with real consequences—we’d love to meet you.
          </p>
        </ScrollReveal>

        <section className="atsnSection" aria-label="How we work">
          <div className="atsnGrid">
            <div className="atsnCard" style={{ gridColumn: "span 6" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Principles</p>
                <h3 className="atsnCard__title">Reliability is a feature.</h3>
                <p className="atsnCard__body">
                  We optimize for deployments that feel effortless: clear interfaces, predictable
                  behavior, and engineering choices that reduce operational burden—because the real
                  product is trust.
                </p>
              </ScrollReveal>
            </div>
            <div className="atsnCard" style={{ gridColumn: "span 6" }}>
              <ScrollReveal>
                <p className="atsnCard__kicker">Craft</p>
                <h3 className="atsnCard__title">Quiet design, sharp thinking.</h3>
                <p className="atsnCard__body">
                  The best work is often invisible: the detail that prevents a failure mode, the
                  constraint that keeps a system safe, the UI that makes operation intuitive. We
                  value taste and rigor in equal measure.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="atsnSection" aria-label="Open roles">
          <ScrollReveal>
            <h2 className="atsnSection__title">Open roles</h2>
            <p className="atsnSection__sub">
              We’re always interested in people across robotics engineering, autonomy, embedded
              systems, product, and field operations. If you don’t see a perfect match, send a note
              anyway—we’ll read it.
            </p>
          </ScrollReveal>

          <div className="atsnSmallGrid">
            <div className="atsnCard">
              <p className="atsnCard__kicker">Autonomy</p>
              <h3 className="atsnCard__title">Perception & navigation</h3>
              <p className="atsnCard__body">
                Build robust behavior in dynamic spaces: localization, planning, and human-aware
                motion with safety-first constraints.
              </p>
            </div>
            <div className="atsnCard">
              <p className="atsnCard__kicker">Platform</p>
              <h3 className="atsnCard__title">Embedded & controls</h3>
              <p className="atsnCard__body">
                Own the system-level performance: control loops, sensor integration, power, and
                reliability under real-duty cycles.
              </p>
            </div>
            <div className="atsnCard">
              <p className="atsnCard__kicker">Field</p>
              <h3 className="atsnCard__title">Deployment & operations</h3>
              <p className="atsnCard__body">
                Translate robotics into outcomes: onsite rollout, fleet health, and workflows that
                keep customers in rhythm.
              </p>
            </div>
          </div>

          <div className="atsnHero__ctaRow" style={{ marginTop: "2rem" }}>
            <Link className="atsnBtn atsnBtn--primary" href="/contact">
              Reach out
            </Link>
            <a className="atsnBtn" href="mailto:careers@atsnrobotics.com">
              careers@atsnrobotics.com
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

