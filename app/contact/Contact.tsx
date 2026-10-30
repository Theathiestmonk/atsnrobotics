"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

type GeoOption = { id: number; name: string };

export function Contact() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<GeoOption | null>(null);
  const [selectedState, setSelectedState] = useState<GeoOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<GeoOption | null>(null);
  const [countries, setCountries] = useState<GeoOption[]>([]);
  const [states, setStates] = useState<GeoOption[]>([]);
  const [cities, setCities] = useState<GeoOption[]>([]);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let active = true;

    GetCountries()
      .then((result) => {
        if (active) setCountries(result);
        if (active) setLocationError("");
      })
      .catch((error: unknown) => {
        console.error("Contact form country options failed to load:", error);
        if (active) setLocationError("Unable to load countries. Please refresh and try again.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const countryId = selectedCountry?.id;
    setStates([]);
    setSelectedState(null);
    setCities([]);
    setSelectedCity(null);
    if (!countryId) return;

    let active = true;
    GetState(countryId)
      .then((result) => {
        if (active) setStates(result);
        if (active) setLocationError("");
      })
      .catch((error: unknown) => {
        console.error("Contact form state options failed to load:", error);
        if (active) setLocationError("Unable to load states. Please try selecting the country again.");
      });

    return () => {
      active = false;
    };
  }, [selectedCountry?.id]);

  useEffect(() => {
    const countryId = selectedCountry?.id;
    const stateId = selectedState?.id;
    setCities([]);
    setSelectedCity(null);
    if (!countryId || !stateId) return;

    let active = true;
    GetCity(countryId, stateId)
      .then((result) => {
        if (active) setCities(result);
        if (active) setLocationError("");
      })
      .catch((error: unknown) => {
        console.error("Contact form city options failed to load:", error);
        if (active) setLocationError("Unable to load cities. Please try selecting the state again.");
      });

    return () => {
      active = false;
    };
  }, [selectedCountry?.id, selectedState?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;

    setStatus("sending");
    setSubmissionError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      model: formData.get("model"),
      mobile: formData.get("mobile"),
      country: selectedCountry?.name ?? "",
      state: selectedState?.name ?? "",
      city: selectedCity?.name ?? "",
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as { error?: unknown };
      if (!response.ok) {
        setSubmissionError(
          typeof result.error === "string"
            ? result.error
            : "Unable to send your message. Please try again.",
        );
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setSubmissionError("Unable to send your message. Please try again.");
      setStatus("error");
    }
  };

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;

    (async () => {
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
                  services@atsnai.com
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
                  services@atsnai.com
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
                  services@atsnai.com
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
            onSubmit={handleSubmit}
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

            <div>
              <label className="atsnLabel" htmlFor="mobile">
                Mobile Number
              </label>
              <input
                className="atsnInput"
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                required
              />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="country">
                Country
              </label>
              <select
                className="atsnInput"
                id="country"
                required
                value={selectedCountry?.id ?? ""}
                onChange={(event) => {
                  const country = countries.find((option) => option.id === Number(event.target.value));
                  setSelectedCountry(country ?? null);
                  setSelectedState(null);
                  setSelectedCity(null);
                }}
              >
                <option value="" disabled>
                  {countries.length ? "Select country" : "Loading countries…"}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="atsnLabel" htmlFor="state">
                State / Province
              </label>
              <select
                className="atsnInput"
                id="state"
                disabled={!selectedCountry}
                value={selectedState?.id ?? ""}
                onChange={(event) => {
                  const state = states.find((option) => option.id === Number(event.target.value));
                  setSelectedState(state ?? null);
                  setSelectedCity(null);
                }}
              >
                <option value="" disabled>
                  {!selectedCountry
                    ? "Select country first"
                    : states.length
                      ? "Select state / province"
                      : "No states available"}
                </option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="atsnLabel" htmlFor="city">
                City
              </label>
              <select
                className="atsnInput"
                id="city"
                disabled={!selectedState}
                value={selectedCity?.id ?? ""}
                onChange={(event) => {
                  const city = cities.find((option) => option.id === Number(event.target.value));
                  setSelectedCity(city ?? null);
                }}
              >
                <option value="" disabled>
                  {!selectedState ? "Select state first" : cities.length ? "Select city" : "No cities available"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            {locationError ? (
              <p role="alert" style={{ gridColumn: "1 / -1", color: "#dc2626" }}>
                {locationError}
              </p>
            ) : null}

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

            <button className="atsnSubmit" type="submit" disabled={status === "sending" || status === "sent"}>
              {status === "idle"
                ? "Send message"
                : status === "sending"
                ? "Sending…"
                : status === "sent"
                ? "Sent — we’ll reply soon"
                : "Error — please try again"}
            </button>
            {submissionError ? (
              <p role="alert" style={{ gridColumn: "1 / -1", color: "#dc2626" }}>
                {submissionError}
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
