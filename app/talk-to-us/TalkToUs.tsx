"use client";

import { useState, useRef, useEffect } from "react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import intlTelInput from "intl-tel-input";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export function TalkToUs({ model }: { model: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [phoneError, setPhoneError] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("in");
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<any>(null);

  useEffect(() => {
    if (phoneInputRef.current && !itiRef.current) {
      itiRef.current = intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        preferredCountries: ["in", "us", "gb", "de", "fr", "au", "ca"],
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.0.0/build/js/utils.js",
      });

      phoneInputRef.current.addEventListener("countrychange", () => {
        setSelectedCountry(itiRef.current.getSelectedCountryData().iso2);
        setPhoneError("");
      });
    }

    return () => {
      if (phoneInputRef.current) {
        phoneInputRef.current.removeEventListener("countrychange", () => {});
      }
    };
  }, []);

  const validatePhone = (phoneNumber: string, countryCode: string): boolean => {
    if (!phoneNumber.trim()) return false;
    return isValidPhoneNumber(phoneNumber, countryCode.toUpperCase() as any);
  };

  const formatPhoneToE164 = (phoneNumber: string, countryCode: string): string | null => {
    try {
      const parsed = parsePhoneNumber(phoneNumber, countryCode.toUpperCase() as any);
      return parsed?.format("E.164") || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;

    const formData = new FormData(e.currentTarget);
    const phoneInput = formData.get("phone") as string;
    const countryCode = selectedCountry.toUpperCase();

    if (!validatePhone(phoneInput, selectedCountry)) {
      setPhoneError(`Invalid phone number for ${countryCode}. Please check and try again.`);
      return;
    }

    const e164Phone = formatPhoneToE164(phoneInput, selectedCountry);
    if (!e164Phone) {
      setPhoneError("Unable to format phone number. Please check and try again.");
      return;
    }

    setStatus("sending");

    const data = {
      model,
      name: formData.get("name"),
      businessName: formData.get("businessName"),
      email: formData.get("email"),
      phone: e164Phone,
      phoneCountry: countryCode,
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
                Full name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input className="atsnInput" id="name" name="name" autoComplete="name" required />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="businessName">
                Company name
              </label>
              <input
                className="atsnInput"
                id="businessName"
                name="businessName"
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="atsnLabel" htmlFor="email">
                Email <span style={{ color: "#dc2626" }}>*</span>
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
                Contact Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                ref={phoneInputRef}
                className="atsnInput"
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number"
                required
              />
              {phoneError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {phoneError}
                </p>
              )}
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

      <style>{`
        .iti {
          width: 100%;
        }
        .iti__input {
          width: 100%;
          padding: 12px 16px 12px 50px;
          font-size: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          background-color: transparent;
          color: #f5f5f5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .iti__input:focus {
          outline: none;
          border-color: #c9a962;
          box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.1);
        }
        .iti__country-list {
          background-color: #0c0c0e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f5f5f5;
          max-height: 200px;
          overflow-y: auto;
        }
        .iti__country {
          padding: 8px 12px;
          cursor: pointer;
        }
        .iti__country:hover,
        .iti__country.iti__highlighted {
          background-color: rgba(201, 169, 98, 0.1);
        }
        .iti__flag {
          margin-right: 8px;
        }
        .iti__dial-code {
          color: rgba(245, 245, 245, 0.6);
        }
        .iti__arrow {
          border-color: #f5f5f5 transparent transparent transparent;
        }
        @media (max-width: 640px) {
          .iti {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
