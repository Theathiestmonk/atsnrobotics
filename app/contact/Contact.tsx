"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BlurText } from "../components/BlurText";
import { LightRays } from "../components/LightRays";
import { ScrollReveal } from "../components/ScrollReveal";

export function Contact() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;

    (async () => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (prefersReduced) return;

      const el = rootRef.current;
      if (!el) return;

      const gsapMod = await import("gsap");
      const gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;

      if (!mounted) return;

      const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-contact-anim]"));
      ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 14, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.06,
            delay: 0.05,
          },
        );
      }, el);
    })();

    return () => {
      mounted = false;
      ctx?.revert?.();
    };
  }, []);

  return (
    <main className="atsnPage">
      <div ref={rootRef} className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <LightRays intensity={0.75} />

        <p className="atsnHero__eyebrow" data-contact-anim>
          Contact
        </p>
        <BlurText text="Let’s Talk." as="h1" className="atsnHero__title" />

        <p className="atsnHero__lead" data-contact-anim>
          Let’s find your rhythm. We’d love to hear about the spaces you manage and explore how
          intelligent motion can quietly support your team's best work.
        </p>

        <section className="atsnSection" aria-label="Contact channels">
          <div className="atsnSmallGrid" data-contact-anim>
            <div className="atsnCard">
              <p className="atsnCard__kicker">Sales inquiries</p>
              <h3 className="atsnCard__title">Deploy ARGO in your venue.</h3>
              <p className="atsnCard__body">
                Share your space type, hours, and what “busy” looks like. We’ll outline a practical
                deployment path and what success metrics to track.
              </p>
              <div className="atsnCard__meta">
                <span className="atsnPill">
                  <span className="atsnPill__dot" aria-hidden="true" />
                  sales@atsnrobotics.com
                </span>
              </div>
            </div>

            <div className="atsnCard">
              <p className="atsnCard__kicker">Press</p>
              <h3 className="atsnCard__title">Stories, demos, and assets.</h3>
              <p className="atsnCard__body">
                For interviews, product images, and event coverage, reach out and we’ll respond with
                the right materials and a fast timeline.
              </p>
              <div className="atsnCard__meta">
                <span className="atsnPill">
                  <span className="atsnPill__dot" aria-hidden="true" />
                  press@atsnrobotics.com
                </span>
              </div>
            </div>

            <div className="atsnCard">
              <p className="atsnCard__kicker">Support</p>
              <h3 className="atsnCard__title">Help for operators.</h3>
              <p className="atsnCard__body">
                Already working with ARGO? Send a note with your venue name and a brief description
                of the issue. We’ll help you get back to smooth operation quickly.
              </p>
              <div className="atsnCard__meta">
                <span className="atsnPill">
                  <span className="atsnPill__dot" aria-hidden="true" />
                  support@atsnrobotics.com
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="atsnSection" aria-label="Contact form">
          <ScrollReveal>
            <h2 className="atsnSection__title">Tell us about your space.</h2>
            <p className="atsnSection__sub">
              A few details help us respond with something useful—whether that’s a deployment
              estimate, a workflow recommendation, or a short discovery call.
            </p>
          </ScrollReveal>

          <form
            className="atsnForm"
            data-contact-anim
            onSubmit={(e) => {
              e.preventDefault();
              if (status !== "idle") return;
              setStatus("sending");
              window.setTimeout(() => setStatus("sent"), 900);
            }}
          >
            <div>
              <label className="atsnLabel" htmlFor="name">
                Name
              </label>
              <input className="atsnInput" id="name" name="name" autoComplete="name" required />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="company">
                Company
              </label>
              <input
                className="atsnInput"
                id="company"
                name="company"
                autoComplete="organization"
                required
              />
            </div>

            <div className="atsnForm__full">
              <label className="atsnLabel" htmlFor="email">
                Email
              </label>
              <input
                className="atsnInput"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="atsnForm__full">
              <label className="atsnLabel" htmlFor="message">
                Message
              </label>
              <textarea className="atsnTextarea" id="message" name="message" required />
            </div>

            <button className="atsnSubmit" type="submit" disabled={status !== "idle"}>
              {status === "idle" ? "Send message" : status === "sending" ? "Sending…" : "Sent — we’ll reply soon"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

