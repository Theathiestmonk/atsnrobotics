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

type Feature = {
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    title: "Natural Interaction",
    description: "Sonic understands shared spaces. It moves with intention — yielding, signaling, and arriving with the calm confidence of a great teammate.",
  },
  {
    title: "Fluid Mobility",
    description: "Built for real floors, real corners, and real foot traffic. Sonic threads through lobbies and aisles without jolts that disrupt guests or the payload.",
  },
  {
    title: "Quiet Confidence",
    description: "A low acoustic profile and an unobtrusive silhouette — support that doesn't announce itself, so Sonic can work nearby without pulling focus.",
  },
  {
    title: "Purpose-Built",
    description: "Designed specifically for goods movement: dependable delivery runs, back-of-house support, and repeatable workflows that free people for higher-value work.",
  },
];

const START_ORBIT_AZIMUTH = -25;
const START_ORBIT_POLAR = 80;
const DEGREES_PER_PIXEL = 0.5;
const MOMENTUM_DECAY = 0.95;

export function SonicScrollHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<HTMLElement | null>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
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

    const model = modelRef.current as HTMLElement | null;
    const modelWrap = model?.parentElement;
    if (!model || !modelWrap) return;

    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;
    let velocity = 0;
    let rafId: number | null = null;

    const updateRotation = (newRotation: number) => {
      currentRotation = newRotation % 360;
      const azimuth = START_ORBIT_AZIMUTH + currentRotation;
      model.setAttribute('camera-orbit', `${azimuth}deg ${START_ORBIT_POLAR}deg 115%`);

      // Update active feature based on rotation position
      const featureIndex = Math.floor((currentRotation / 360) * FEATURES.length) % FEATURES.length;
      featureRefs.current.forEach((el, i) => {
        if (el) {
          const isActive = i === featureIndex;
          el.classList.toggle("on", isActive);
          el.style.opacity = isActive ? "1" : "0";
          el.style.pointerEvents = isActive ? "auto" : "none";
        }
      });
    };

    const applyMomentum = () => {
      if (Math.abs(velocity) > 0.1) {
        updateRotation(currentRotation + velocity);
        velocity *= MOMENTUM_DECAY;
        rafId = window.requestAnimationFrame(applyMomentum);
      } else {
        rafId = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only start drag if pointer is over the model
      const rect = modelWrap.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top || e.clientY > rect.bottom) {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      velocity = 0;
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaRotation = deltaX * DEGREES_PER_PIXEL;
      velocity = deltaRotation * 0.05;
      updateRotation(currentRotation + deltaRotation);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (Math.abs(velocity) > 0.1) {
        rafId = window.requestAnimationFrame(applyMomentum);
      }
    };

    // Listen at window level to catch events across the whole screen
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);

    // Set initial feature visibility
    updateRotation(0);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [ready]);

  const modelViewer = (
    <model-viewer
      ref={modelRef}
      src="/sonic.glb"
      poster="/sonic_black_without_food.webp"
      alt="ARGO Sonic — autonomous delivery robot"
      disable-zoom
      interaction-prompt="none"
      environment-image="neutral"
      shadow-intensity="0.9"
      exposure="1.05"
      field-of-view="30deg"
      camera-orbit={`${START_ORBIT_AZIMUTH}deg ${START_ORBIT_POLAR}deg 115%`}
      className="sonicHero__model"
      style={{ cursor: "grab", touchAction: "none" }}
    />
  );

  if (isMobile) {
    return (
      <section className="sonicHero sonicHero--mobile" aria-label="ARGO Sonic">
        <div className="sonicHero__mobileStage">{ready ? modelViewer : null}</div>
        <div className="sonicHero__mobileFeatures">
          {FEATURES.map((f, i) => (
            <div className="sonicHero__mobileFeature" key={i}>
              <h3 className="sonicHero__mobileTitle">{f.title}</h3>
              <p className="sonicHero__mobileDesc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="sonicHero sonicHero--interactive" aria-label="ARGO Sonic">
      <div className="sonicHero__interactiveBg" />
      <div className="sonicHero__interactiveContent">
        <div className="sonicHero__interactiveModel">{ready ? modelViewer : null}</div>

        <div className="sonicHero__interactiveFeatures">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="sonicHero__feature"
              ref={(el) => {
                featureRefs.current[i] = el;
              }}
            >
              <h3 className="sonicHero__featureTitle">{f.title}</h3>
              <p className="sonicHero__featureDesc">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="sonicHero__interactiveHint">Drag to rotate</div>
      </div>
    </section>
  );
}
