"use client";

import { useState, useEffect } from "react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  currency: string;
  latitude: number;
  longitude: number;
}

interface State {
  id: number;
  name: string;
  iso2: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export function TalkToUs({ model }: { model: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [phoneError, setPhoneError] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Country State City
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [states, setStates] = useState<State[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [stateSearch, setStateSearch] = useState<string>("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [citySearch, setCitySearch] = useState<string>("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("91");

  // Load countries on mount
  useEffect(() => {
    GetCountries().then(result => {
      const countriesData = result.map((c: any) => ({
        ...c,
        latitude: typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude,
        longitude: typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude,
      })) as Country[];
      setCountries(countriesData);
      // Set default to India
      const india = countriesData.find(c => c.iso2 === "IN");
      if (india) {
        setCountry(india);
        setSelectedCountryCode(india.phone_code);
      }
    });
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (country) {
      GetState(country.id).then(result => {
        const statesData = result.map((s: any) => ({
          ...s,
          latitude: typeof s.latitude === 'string' ? parseFloat(s.latitude) : s.latitude,
          longitude: typeof s.longitude === 'string' ? parseFloat(s.longitude) : s.longitude,
        })) as State[];
        setStates(statesData);
        setState(null);
        setCities([]);
        setCity(null);
        setStateSearch("");
        setCitySearch("");
      });
    }
  }, [country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (state && country) {
      GetCity(country.id, state.id).then(result => {
        const citiesData = result.map((c: any) => ({
          ...c,
          latitude: typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude,
          longitude: typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude,
        })) as City[];
        setCities(citiesData);
        setCity(null);
        setCitySearch("");
      });
    }
  }, [state, country]);

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!name?.trim()) errors.name = "Full name is required";
    if (!email?.trim()) errors.email = "Email is required";
    if (!isValidEmail(email)) errors.email = "Please enter a valid email";
    if (!phone?.trim()) errors.phone = "Contact number is required";
    if (!country) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phoneNumber: string, countryCode: string): boolean => {
    if (!phoneNumber.trim()) return false;
    try {
      return isValidPhoneNumber(phoneNumber, countryCode.toUpperCase() as any);
    } catch {
      return false;
    }
  };

  const formatPhoneToE164 = (phoneNumber: string, countryCode: string): string | null => {
    try {
      const parsed = parsePhoneNumber(phoneNumber, countryCode.toUpperCase() as any);
      return parsed?.format("E.164") || null;
    } catch {
      return null;
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.phone_code.includes(countrySearch)
  );

  const filteredStates = states.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Filter to only allow digits 0-9
    const input = e.currentTarget;
    const filtered = input.value.replace(/[^\d]/g, "");
    input.value = filtered;
    setPhoneError("");
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const filtered = pasted.replace(/[^\d]/g, "");
    const current = (e.target as HTMLInputElement).value;
    const newValue = current + filtered;

    setTimeout(() => {
      (e.target as HTMLInputElement).value = newValue.replace(/[^\d]/g, "");
    }, 0);
  };

  const handleCountryChange = (c: Country) => {
    setCountry(c);
    setCountrySearch("");
    setSelectedCountryCode(c.phone_code);
    setShowCountryDropdown(false);
    setPhoneError("");
  };

  const handleStateChange = (s: State) => {
    setState(s);
    setStateSearch("");
    setShowStateDropdown(false);
    setCity(null);
    setCitySearch("");
    setCities([]);
  };

  const handleCityChange = (c: City) => {
    setCity(c);
    setCitySearch("");
    setShowCityDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    const phoneInput = formData.get("phone") as string;
    const countryCode = country?.iso2 || "IN";

    if (!validatePhone(phoneInput, countryCode)) {
      setPhoneError(`Invalid phone number for ${country?.name || countryCode}. Please check and try again.`);
      return;
    }

    const e164Phone = formatPhoneToE164(phoneInput, countryCode);
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
      phoneCountryCode: selectedCountryCode,
      address: formData.get("address"),
      city: city?.name || "",
      state: state?.name || "",
      country: country?.name || "",
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
        <BlurText text="Let's bring ARGO on board." as="h1" className="atsnHero__title" />

        <p className="atsnHero__lead">
          Share a few details about your business and where you'd like to deploy your robot. Our
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

          <form className="atsnForm atsnForm--grid" onSubmit={handleSubmit}>
            <input type="hidden" name="model" value={model} />

            {/* Row 1: Full Name (Left) & Company Name (Right) */}
            <div className="atsnForm__col atsnForm__col--half">
              <label className="atsnLabel" htmlFor="name">
                Full name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                className="atsnInput"
                id="name"
                name="name"
                autoComplete="name"
                required
              />
              {formErrors.name && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="atsnForm__col atsnForm__col--half">
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

            {/* Row 2: Email (Full Width) */}
            <div className="atsnForm__col atsnForm__col--full">
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
              {formErrors.email && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Row 3: Country Code (Left) & Contact Number (Right) */}
            <div className="atsnForm__col atsnForm__col--half">
              <label className="atsnLabel" htmlFor="country-select">
                Country Code <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="atsnInput"
                  id="country-select"
                  type="text"
                  placeholder="Search country..."
                  value={showCountryDropdown || !country ? countrySearch : `${country.name} +${country.phone_code}`}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setShowCountryDropdown(true);
                  }}
                  onFocus={() => {
                    if (country) {
                      setCountrySearch("");
                    }
                    setShowCountryDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 100)}
                  required
                />
                {showCountryDropdown && countrySearch && (
                  <div style={dropdownStyle}>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleCountryChange(c)}
                          style={dropdownItemStyle}
                        >
                          <span>{c.name}</span> <span style={{ color: "#c9a962" }}>+{c.phone_code}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ ...dropdownItemStyle, cursor: "default", color: "rgba(245, 245, 245, 0.5)" }}>
                        No countries found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.country && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {formErrors.country}
                </p>
              )}
            </div>

            <div className="atsnForm__col atsnForm__col--half">
              <label className="atsnLabel" htmlFor="phone">
                Contact Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                className="atsnInput"
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Phone number"
                onInput={handlePhoneInput}
                onPaste={handlePhonePaste}
                required
              />
              {phoneError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {phoneError}
                </p>
              )}
              {formErrors.phone && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {formErrors.phone}
                </p>
              )}
            </div>

            {/* Row 4: Address (Full Width) */}
            <div className="atsnForm__col atsnForm__col--full">
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

            {/* Row 5: State (Left) & City (Right) */}
            <div className="atsnForm__col atsnForm__col--half">
              <label className="atsnLabel" htmlFor="state-select">
                State / Province
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="atsnInput"
                  id="state-select"
                  type="text"
                  placeholder="Select state..."
                  disabled={!country}
                  value={stateSearch}
                  onChange={(e) => {
                    setStateSearch(e.target.value);
                    if (e.target.value) {
                      setShowStateDropdown(true);
                    }
                  }}
                  onFocus={() => country && setShowStateDropdown(true)}
                  onBlur={() => {
                    if (!stateSearch && state) {
                      setShowStateDropdown(false);
                    } else if (!stateSearch && !state) {
                      setShowStateDropdown(false);
                    } else {
                      setTimeout(() => setShowStateDropdown(false), 100);
                    }
                  }}
                />
                {showStateDropdown && states.length > 0 && (
                  <div style={dropdownStyle}>
                    {filteredStates.length > 0 ? (
                      filteredStates.slice(0, 10).map(s => (
                        <div
                          key={s.id}
                          onClick={() => handleStateChange(s)}
                          style={dropdownItemStyle}
                        >
                          {s.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ ...dropdownItemStyle, cursor: "default", color: "rgba(245, 245, 245, 0.5)" }}>
                        No states found
                      </div>
                    )}
                  </div>
                )}
                {state && !stateSearch && (
                  <div style={{ ...dropdownItemStyle, padding: "0", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", paddingLeft: "12px", fontSize: "0.875rem", color: "rgba(245, 245, 245, 0.6)", pointerEvents: "none", backgroundColor: "transparent" }}>
                    {state.name}
                  </div>
                )}
              </div>
            </div>

            <div className="atsnForm__col atsnForm__col--half">
              <label className="atsnLabel" htmlFor="city-select">
                City
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="atsnInput"
                  id="city-select"
                  type="text"
                  placeholder="Select city..."
                  disabled={!state}
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (e.target.value) {
                      setShowCityDropdown(true);
                    }
                  }}
                  onFocus={() => state && setShowCityDropdown(true)}
                  onBlur={() => {
                    if (!citySearch && city) {
                      setShowCityDropdown(false);
                    } else if (!citySearch && !city) {
                      setShowCityDropdown(false);
                    } else {
                      setTimeout(() => setShowCityDropdown(false), 100);
                    }
                  }}
                />
                {showCityDropdown && cities.length > 0 && (
                  <div style={dropdownStyle}>
                    {filteredCities.length > 0 ? (
                      filteredCities.slice(0, 10).map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleCityChange(c)}
                          style={dropdownItemStyle}
                        >
                          {c.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ ...dropdownItemStyle, cursor: "default", color: "rgba(245, 245, 245, 0.5)" }}>
                        No cities found
                      </div>
                    )}
                  </div>
                )}
                {city && !citySearch && (
                  <div style={{ ...dropdownItemStyle, padding: "0", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", paddingLeft: "12px", fontSize: "0.875rem", color: "rgba(245, 245, 245, 0.6)", pointerEvents: "none", backgroundColor: "transparent" }}>
                    {city.name}
                  </div>
                )}
              </div>
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
                ? "Sent — we'll reply soon"
                : "Error — please try again"}
            </button>
          </form>
        </section>
      </div>

      <style>{`
        .atsnForm--grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .atsnForm__col {
          display: flex;
          flex-direction: column;
        }

        .atsnForm__col--full {
          grid-column: 1 / -1;
        }

        .atsnForm__col--half {
          grid-column: span 1;
        }

        @media (max-width: 768px) {
          .atsnForm--grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .atsnForm__col--full,
          .atsnForm__col--half {
            grid-column: 1;
          }
        }

        .atsnInput:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  backgroundColor: "#0c0c0e",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "8px",
  marginTop: "4px",
  maxHeight: "200px",
  overflowY: "auto",
  zIndex: 10,
};

const dropdownItemStyle: React.CSSProperties = {
  padding: "12px 16px",
  cursor: "pointer",
  color: "#f5f5f5",
  fontSize: "0.95rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
};
