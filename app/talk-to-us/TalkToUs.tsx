"use client";

import { useState } from "react";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export function TalkToUs({ model }: { model: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;

    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    const data = {
      model,
      name: formData.get("name"),
      businessName: formData.get("businessName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
    };

    try {
      const response = await fetch("/api/talk-to-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setStatus(response.ok ? "sent" : "error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero">
        <p className="atsnHero__eyebrow">Talk to us</p>
        <BlurText text="Let’s bring ARGO on board." as="h1" className="atsnHero__title" />

        <p className="atsnHero__lead">
          Share a few details about your business and where you’d like to deploy your robot. Our
          team will follow up with next steps.
        </p>

        <div className="atsnCard__meta" style={{ marginTop: "1.25rem" }}>
          <span className="atsnPill">
            <span className="atsnPill__dot" aria-hidden="true" />
            Model selected: {model}
          </span>
        </div>

        <section className="atsnSection" aria-label="Order inquiry form">
          <ScrollReveal>
            <h2 className="atsnSection__title">Your details.</h2>
            <p className="atsnSection__sub">
              We accept inquiries from businesses anywhere in the world—just let us know where to
              reach you.
            </p>
          </ScrollReveal>

          <form className="atsnForm" onSubmit={handleSubmit}>
            <input type="hidden" name="model" value={model} />

            <div>
              <label className="atsnLabel" htmlFor="name">
                Full name
              </label>
              <input className="atsnInput" id="name" name="name" autoComplete="name" required />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="businessName">
                Business name
              </label>
              <input
                className="atsnInput"
                id="businessName"
                name="businessName"
                autoComplete="organization"
                required
              />
            </div>

            <div>
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

            <div>
              <label className="atsnLabel" htmlFor="phone">
                Contact number
              </label>
              <input
                className="atsnInput"
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
              />
            </div>

            <div className="atsnForm__full">
              <label className="atsnLabel" htmlFor="address">
                Address
              </label>
              <input
                className="atsnInput"
                id="address"
                name="address"
                autoComplete="street-address"
                required
              />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="city">
                City
              </label>
              <input
                className="atsnInput"
                id="city"
                name="city"
                autoComplete="address-level2"
                required
              />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="state">
                State / Province
              </label>
              <input
                className="atsnInput"
                id="state"
                name="state"
                autoComplete="address-level1"
                required
              />
            </div>

            <div className="atsnForm__full">
              <label className="atsnLabel" htmlFor="country">
                Country
              </label>
              <input
                className="atsnInput"
                id="country"
                name="country"
                autoComplete="country-name"
                required
              />
            </div>

            <button
              className="atsnSubmit"
              type="submit"
              disabled={status === "sending" || status === "sent"}
            >
              {status === "idle"
                ? "Submit"
                : status === "sending"
                ? "Sending…"
                : status === "sent"
                ? "Sent — we’ll reply soon"
                : "Error — please try again"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
