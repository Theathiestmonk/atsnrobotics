"use client";

import { useEffect, useRef, useState } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & Record<string, unknown>,
        HTMLElement
      >;
    }
  }
}

const START_ORBIT_AZIMUTH = -25;
const START_ORBIT_POLAR = 80;
const ORBIT_RADIUS = "104%"; // slightly beyond model-viewer's ideal fit, avoids top clipping

// The model's real bounding box (queried via model.getBoundingBoxCenter() /
// getDimensions()): height ≈ 0.98m, resting on the ground at y=0, box center
// at y≈0.49 — NOT y=0 or y=1 as earlier (incorrect) assumptions used.
const MODEL_CENTER_Y = 0.49;
const MODEL_TOP_Y = 0.9; // near the tray, just under the true top (0.98)

// State 1: model slides in from the right and rotates 90° to a sideways view.
const STATE_1_AZIMUTH_DELTA = 90;

// State 2: camera tilts up toward the top of the bot and rotates back 90°
// (the counter-direction of state 1's turn), while zooming in to 200%.
// The zoom finishes at ZOOM_PHASE_END, then the remaining scroll pans right.
const STATE_2_AZIMUTH_DELTA = -90;
const STATE_2_START_POLAR = START_ORBIT_POLAR;
const STATE_2_END_POLAR = 50;
const STATE_2_START_FOV = 30;
const STATE_2_END_FOV = 15; // Halved FOV ≈ 200% zoom
const STATE_2_START_TARGET_Y = MODEL_CENTER_Y;
const STATE_2_END_TARGET_Y = MODEL_TOP_Y;
const STATE_2_ZOOM_PHASE_END = 0.7;
const STATE_2_PAN_RIGHT_VW = 22;

// State 3: continues from state 2's end — camera pans down from the tray to
// the body (vertical center). Zooms out slightly and straightens the tilt
// back toward level as it settles on the body. Horizontal pan resets to 0.
const STATE_3_START_TARGET_Y = MODEL_TOP_Y;
const STATE_3_END_TARGET_Y = MODEL_CENTER_Y;
const STATE_3_START_POLAR = STATE_2_END_POLAR;
const STATE_3_END_POLAR = 72; // straightens back toward eye-level
const STATE_3_START_FOV = STATE_2_END_FOV;
const STATE_3_END_FOV = 40; // zoom out more (20% additional zoom-out from 15°→24°)

// State 4: continues from state 3's end — camera zooms in on the bottom section
// of the bot (wheels/base), closing back to a zoom level similar to state 2.
const STATE_4_START_TARGET_Y = MODEL_CENTER_Y;
const STATE_4_END_TARGET_Y = 0.1; // focus near the bottom/wheels
const STATE_4_START_POLAR = STATE_3_END_POLAR;
const STATE_4_END_POLAR = 90; // straighten completely to horizontal view
const STATE_4_START_FOV = STATE_3_END_FOV;
const STATE_4_END_FOV = 16; // zoom in close to the bottom

export function SonicScrollHero() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<HTMLElement | null>(null);
  const modelWrapRef = useRef<HTMLDivElement | null>(null);
  const state1TextRef = useRef<HTMLDivElement | null>(null);
  const state2TextRef = useRef<HTMLDivElement | null>(null);
  const state3TextRef = useRef<HTMLDivElement | null>(null);
  const state4TextRef = useRef<HTMLDivElement | null>(null);
  const state1FeaturesRef = useRef<HTMLDivElement | null>(null);
  const state2FeaturesRef = useRef<HTMLDivElement | null>(null);
  const state3FeaturesRef = useRef<HTMLDivElement | null>(null);
  const state4FeaturesRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true));
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 900px)");
    setIsMobile(mobileMq.matches);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileMq.addEventListener("change", onMobileChange);
    return () => {
      mobileMq.removeEventListener("change", onMobileChange);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const track = trackRef.current;
    const stage = stageRef.current;
    const model = modelRef.current as HTMLElement | null;
    const modelWrap = modelWrapRef.current;
    const state1Text = state1TextRef.current;
    const state2Text = state2TextRef.current;
    const state3Text = state3TextRef.current;
    const state4Text = state4TextRef.current;
    const state1Features = state1FeaturesRef.current;
    const state2Features = state2FeaturesRef.current;
    const state3Features = state3FeaturesRef.current;
    const state4Features = state4FeaturesRef.current;
    if (!track || !stage || !model || !modelWrap || !state1Text || !state2Text || !state3Text || !state4Text || !state1Features || !state2Features || !state3Features || !state4Features) return;

    let rafId: number | null = null;

    const updateState = (progress: number) => {
      // progress spans four states, each getting an equal quarter.
      const STATE_1_END = 0.25;
      const STATE_2_END = 0.5;
      const STATE_3_END = 0.75;
      const inState1 = progress <= STATE_1_END;
      const inState2 = progress > STATE_1_END && progress <= STATE_2_END;
      const inState3 = progress > STATE_2_END && progress <= STATE_3_END;
      const p1 = Math.min(1, progress / STATE_1_END);
      const p2 = Math.max(0, Math.min(1, (progress - STATE_1_END) / (STATE_2_END - STATE_1_END)));
      const p3 = Math.max(0, Math.min(1, (progress - STATE_2_END) / (STATE_3_END - STATE_2_END)));
      const p4 = Math.max(0, Math.min(1, (progress - STATE_3_END) / (1 - STATE_3_END)));

      // State 1: model slides in from extreme right to center, rotates 0°→90°.
      const translateX = 100 * (1 - p1);
      const state1Azimuth = START_ORBIT_AZIMUTH + p1 * STATE_1_AZIMUTH_DELTA;
      const state1TextOpacity = Math.min(1, p1 * 2.5);
      // Features appear only after bot reaches center (p1 > 0.5)
      const featuresOpacity = p1 > 0.5 ? Math.min(1, (p1 - 0.5) * 5) : 0;

      state1Text.style.opacity = inState1 ? state1TextOpacity.toString() : "0";
      state1Features.style.opacity = inState1 ? featuresOpacity.toString() : "0";
      if (inState1) {
        state2Features.style.opacity = "0";
        state3Features.style.opacity = "0";
        state4Features.style.opacity = "0";
      }

      if (inState1) {
        model.setAttribute(
          "camera-orbit",
          `${state1Azimuth}deg ${START_ORBIT_POLAR}deg ${ORBIT_RADIUS}`,
        );
        model.setAttribute("field-of-view", `${STATE_2_START_FOV}deg`);
        model.setAttribute("camera-target", `0m ${STATE_2_START_TARGET_Y}m 0m`);
        modelWrap.style.transform = `translateX(${translateX}vw)`;
        state1Text.style.opacity = state1TextOpacity.toString();
        state2Text.style.opacity = "0";
        state3Text.style.opacity = "0";
        state4Text.style.opacity = "0";
      } else if (inState2) {
        // State 2a (0 → ZOOM_PHASE_END): rotate back the opposite direction,
        // tilt up, zoom in toward the top of the bot, and recenter vertically
        // to compensate for the raised camera target.
        // State 2b (ZOOM_PHASE_END → 1): hold the zoomed frame and pan right.
        const zoomP = Math.min(1, p2 / STATE_2_ZOOM_PHASE_END);
        const panP = Math.max(0, (p2 - STATE_2_ZOOM_PHASE_END) / (1 - STATE_2_ZOOM_PHASE_END));

        const stateStartAzimuth = START_ORBIT_AZIMUTH + STATE_1_AZIMUTH_DELTA;
        const azimuth = stateStartAzimuth + zoomP * STATE_2_AZIMUTH_DELTA;
        const polar = STATE_2_START_POLAR + zoomP * (STATE_2_END_POLAR - STATE_2_START_POLAR);
        const fov = STATE_2_START_FOV + zoomP * (STATE_2_END_FOV - STATE_2_START_FOV);
        const targetY =
          STATE_2_START_TARGET_Y + zoomP * (STATE_2_END_TARGET_Y - STATE_2_START_TARGET_Y);
        const state2TextOpacity = 1; // Stay visible throughout State 2
        const state2FeaturesOpacity = Math.min(1, p2 * 2.5); // Show immediately, no delay

        const panX = STATE_2_PAN_RIGHT_VW * panP;

        model.setAttribute("camera-orbit", `${azimuth}deg ${polar}deg ${ORBIT_RADIUS}`);
        model.setAttribute("field-of-view", `${fov}deg`);
        model.setAttribute("camera-target", `0m ${targetY}m 0m`);
        modelWrap.style.transform = `translateX(${panX}vw)`;
        state1Text.style.opacity = "0";
        state1Features.style.opacity = "0";
        state2Text.style.opacity = state2TextOpacity.toString();
        state2Features.style.opacity = state2FeaturesOpacity.toString();
        state3Text.style.opacity = "0";
        state3Features.style.opacity = "0";
        state4Text.style.opacity = "0";
        state4Features.style.opacity = "0";
      } else if (inState3) {
        // State 3: continues from state 2's end frame — straighten the bot
        // by adjusting the polar angle. Keep FOV constant (no zoom), and keep
        // robot panned to the right.
        const stateEndAzimuth = START_ORBIT_AZIMUTH + STATE_1_AZIMUTH_DELTA + STATE_2_AZIMUTH_DELTA;
        const targetY =
          STATE_3_START_TARGET_Y + p3 * (STATE_3_END_TARGET_Y - STATE_3_START_TARGET_Y);
        const polar = STATE_3_START_POLAR + p3 * (STATE_3_END_POLAR - STATE_3_START_POLAR);
        const fov = STATE_3_START_FOV; // Keep FOV constant, no zoom
        const panX = STATE_2_PAN_RIGHT_VW; // Keep robot on the right
        const state3TextOpacity = Math.min(1, p3 * 2.5);
        const state3FeaturesOpacity = Math.min(1, p3 * 2.5);

        model.setAttribute("camera-orbit", `${stateEndAzimuth}deg ${polar}deg ${ORBIT_RADIUS}`);
        model.setAttribute("field-of-view", `${fov}deg`);
        model.setAttribute("camera-target", `0m ${targetY}m 0m`);
        modelWrap.style.transform = `translateX(${panX}vw)`;
        state2Text.style.opacity = "0";
        state2Features.style.opacity = "0";
        state3Text.style.opacity = state3TextOpacity.toString();
        state3Features.style.opacity = state3FeaturesOpacity.toString();
        state4Text.style.opacity = "0";
        state4Features.style.opacity = "0";
      } else {
        // State 4: continues from state 3's end frame — camera zooms in on the
        // bottom section of the bot (wheels/base), tilting back to a similar
        // angle as state 2 for a focused close-up view. Keep robot on the right.
        const stateEndAzimuth = START_ORBIT_AZIMUTH + STATE_1_AZIMUTH_DELTA + STATE_2_AZIMUTH_DELTA;
        const targetY =
          STATE_4_START_TARGET_Y + p4 * (STATE_4_END_TARGET_Y - STATE_4_START_TARGET_Y);
        const polar = STATE_4_START_POLAR + p4 * (STATE_4_END_POLAR - STATE_4_START_POLAR);
        const fov = STATE_4_START_FOV + p4 * (STATE_4_END_FOV - STATE_4_START_FOV);
        const state4TextOpacity = Math.min(1, p4 * 2.5);
        const state4FeaturesOpacity = Math.min(1, p4 * 2.5);

        model.setAttribute("camera-orbit", `${stateEndAzimuth}deg ${polar}deg ${ORBIT_RADIUS}`);
        model.setAttribute("field-of-view", `${fov}deg`);
        model.setAttribute("camera-target", `0m ${targetY}m 0m`);
        modelWrap.style.transform = `translateX(${STATE_2_PAN_RIGHT_VW}vw)`;
        state2Features.style.opacity = "0";
        state3Text.style.opacity = "0";
        state3Features.style.opacity = "0";
        state4Text.style.opacity = state4TextOpacity.toString();
        state4Features.style.opacity = state4FeaturesOpacity.toString();
      }
    };

    // A wrapping ancestor (.siteShell) has overflow-x set, which breaks CSS
    // `position: sticky` for every descendant on the site. Reproduce the pin
    // effect manually: fixed while the track is in range, absolute at the
    // top before entering and at the bottom after leaving.
    const applyPinState = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top > 0) {
        stage.style.position = "absolute";
        stage.style.top = "0";
        stage.style.bottom = "";
      } else if (rect.bottom < vh) {
        stage.style.position = "absolute";
        stage.style.top = "";
        stage.style.bottom = "0";
      } else {
        stage.style.position = "fixed";
        stage.style.top = "0";
        stage.style.bottom = "";
      }
    };

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      applyPinState();

      if (rafId == null) {
        rafId = window.requestAnimationFrame(() => {
          updateState(progress);
          rafId = null;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [ready]);

  const modelViewer = (
    <model-viewer
      ref={modelRef}
      src="/sonic-compressed.glb"
      alt="ARGO Sonic — autonomous delivery robot"
      loading="eager"
      reveal="auto"
      disable-zoom
      interaction-prompt="none"
      environment-image="neutral"
      shadow-intensity="0.9"
      exposure="1.05"
      field-of-view="30deg"
      camera-orbit={`${START_ORBIT_AZIMUTH}deg ${START_ORBIT_POLAR}deg ${ORBIT_RADIUS}`}
      camera-target={`0m ${MODEL_CENTER_Y}m 0m`}
      className="sonicHero__model"
      style={{ background: "transparent" }}
    />
  );

  if (isMobile) {
    return (
      <section className="sonicHero sonicHero--mobile" aria-label="ARGO Sonic">
        <div className="sonicHero__mobileStage">{ready ? modelViewer : null}</div>
        <div className="sonicHero__mobileText">
          <h2 className="sonicHero__mobileHeading">Argo Sonic</h2>
          <p className="sonicHero__mobileSubheading">Intelligent autonomous delivery</p>
        </div>
        <div className="sonicHero__mobileText">
          <h2 className="sonicHero__mobileHeading">15 kg Payload</h2>
          <p className="sonicHero__mobileSubheading">Room for every order, every run</p>
        </div>
        <div className="sonicHero__mobileText">
          <h2 className="sonicHero__mobileHeading">Ergonomic Design</h2>
          <p className="sonicHero__mobileSubheading">Smooth curves and rounded edges, built to move safely alongside people</p>
        </div>
        <div className="sonicHero__mobileText">
          <h2 className="sonicHero__mobileHeading">Intelligence in motion</h2>
          <p className="sonicHero__mobileSubheading">Autonomous delivery, precisely engineered</p>
        </div>
      </section>
    );
  }

  return (
    <section className="sonicHero sonicHero--scroll-states" aria-label="ARGO Sonic">
      <div className="sonicHero__scrollBg" />

      <div className="sonicHero__scrollContent">
        {/* States 1+2: one continuous pinned track so the model transitions
            smoothly between them without a jump cut. */}
        <div className="sonicHero__track" ref={trackRef}>
          <div className="sonicHero__stage" ref={stageRef}>
            <div className="sonicHero__scrollState">
              <div className="sonicHero__scrollModel" ref={modelWrapRef}>
                {ready ? modelViewer : null}
              </div>

              <div className="sonicHero__state1Features" ref={state1FeaturesRef}>
                <div className="sonicHero__featureGrid">
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
                        <rect x="21" y="9" width="2" height="6"></rect>
                        <rect x="3" y="8" width="14" height="8" fill="currentColor" opacity="0.3"></rect>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">8 Hour Battery</h3>
                    <p className="sonicHero__featureText">Extended runtime</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2v6h-2V2M6 9v15a1 1 0 001 1h10a1 1 0 001-1V9"></path>
                        <path d="M9 14h6"></path>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Automatic Charging</h3>
                    <p className="sonicHero__featureText">Self-managed power</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 16.13A2 2 0 0021 14H3a2 2 0 00-2 2v5a2 2 0 002 2h18a2 2 0 002-2v-2.87z"></path>
                        <path d="M16 9H8M12 5v8"></path>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Natural Voice</h3>
                    <p className="sonicHero__featureText">Voice controlled</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Autonomous Motion</h3>
                    <p className="sonicHero__featureText">Smart navigation</p>
                  </div>
                </div>
              </div>

              <div className="sonicHero__scrollText" ref={state1TextRef}>
                <h2 className="sonicHero__heading">Argo Sonic</h2>
                <p className="sonicHero__subheading">Intelligent autonomous delivery</p>
              </div>

              <div className="sonicHero__scrollText" ref={state2TextRef}>
                <h2 className="sonicHero__heading">15 kg Payload</h2>
                <p className="sonicHero__subheading">Room for every order, every run</p>
              </div>

              <div className="sonicHero__state1Features" ref={state2FeaturesRef}>
                <div className="sonicHero__featureGrid">
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9V7a2 2 0 012-2h2a2 2 0 012 2v2m14-2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2z"></path>
                        <path d="M3 15h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z"></path>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Heavy Load</h3>
                    <p className="sonicHero__featureText">15 kg capacity</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                        <path d="M12 6v6l4 2.5"></path>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Quick Delivery</h3>
                    <p className="sonicHero__featureText">Efficient routing</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Climate Control</h3>
                    <p className="sonicHero__featureText">Temperature managed</p>
                  </div>
                  <div className="sonicHero__featureCard">
                    <div className="sonicHero__featureIcon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1v6m0 6v10M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    </div>
                    <h3 className="sonicHero__featureTitle">Secure Lock</h3>
                    <p className="sonicHero__featureText">Safe containment</p>
                  </div>
                </div>
              </div>

              <div className="sonicHero__contentContainer" ref={state3TextRef}>
                <div className="sonicHero__scrollText sonicHero__scrollText--state3">
                  <h2 className="sonicHero__heading">Ergonomic Design</h2>
                  <p className="sonicHero__subheading">Smooth curves and rounded edges, built to move safely alongside people</p>
                </div>

                <div className="sonicHero__state3Features" ref={state3FeaturesRef}>
                  <div className="sonicHero__featureGrid">
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                          <path d="M12 6v6l4 2.5"></path>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Rounded Edges</h3>
                      <p className="sonicHero__featureText">Safety first design</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20M2 12h20"></path>
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Lightweight</h3>
                      <p className="sonicHero__featureText">Easy to maintain</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1v6m0 6v10M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                          <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Human-Safe</h3>
                      <p className="sonicHero__featureText">People-friendly</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Compact Form</h3>
                      <p className="sonicHero__featureText">Space efficient</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sonicHero__contentContainer" ref={state4TextRef}>
                <div className="sonicHero__scrollText sonicHero__scrollText--state4">
                  <h2 className="sonicHero__heading">Intelligence in motion</h2>
                  <p className="sonicHero__subheading">Autonomous delivery, precisely engineered</p>
                </div>

                <div className="sonicHero__state4Features" ref={state4FeaturesRef}>
                  <div className="sonicHero__featureGrid">
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Smart Navigation</h3>
                      <p className="sonicHero__featureText">AI-powered pathfinding</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Real-Time Updates</h3>
                      <p className="sonicHero__featureText">Live tracking</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Obstacle Detection</h3>
                      <p className="sonicHero__featureText">Adaptive awareness</p>
                    </div>
                    <div className="sonicHero__featureCard">
                      <div className="sonicHero__featureIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="12 1 3 5 3 19 12 23 21 19 21 5 3 5"></polyline>
                          <polyline points="12 12 3 8 12 4 21 8 12 12"></polyline>
                          <polyline points="12 12 12 23"></polyline>
                          <polyline points="12 12 21 8"></polyline>
                        </svg>
                      </div>
                      <h3 className="sonicHero__featureTitle">Efficient Routing</h3>
                      <p className="sonicHero__featureText">Optimized paths</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
