"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ComponentArt } from "../components/ComponentArt";
import { PartModel, PART_HEIGHT } from "./Parts3D";
import { Icon } from "../components/Icon";
import {
  COMPONENT_MAP,
  DECK_D,
  DECK_W,
  SLOTS,
  SLOT_MAP,
  type Build,
  type ComponentId,
  type SlotId,
} from "../data/catalog";

// A CSS-3D robot chassis. Deck components are billboards that always face the camera,
// so the 2D illustrations read cleanly from every orbit angle.

const BODY_TOP = 84; // deck height (px) above floor
const BODY_BOTTOM = 22;
const WHEEL_R = 46;


export interface StageProps {
  build: Build;
  dragging: ComponentId | null;
  justPlaced: SlotId | null;
  selected: SlotId | null;
  onSelect: (slot: SlotId | null) => void;
  onRemove: (slot: SlotId) => void;
  onDropComponent: (id: ComponentId) => void;
  onDragState: (over: boolean) => void;
}

export function ChassisStage({ build, dragging, justPlaced, selected, onSelect, onRemove, onDropComponent, onDragState }: StageProps) {
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [view, setView] = useState({ rx: 58, rz: -26 });
  const [scale, setScale] = useState(1);
  const [over, setOver] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; rx: number; rz: number; moved: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.max(0.5, Math.min(width / 540, height / 430, 1.5)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Idle sway so the robot feels alive on the turntable.
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rx = mode === "2d" ? 0 : view.rx;
  const rz = mode === "2d" ? 0 : view.rz + (drag.current ? 0 : Math.sin(t * 0.35) * 4);

  const accepts = (slot: SlotId) => (dragging ? COMPONENT_MAP[dragging].slots.includes(slot) : false);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-sprite],button")) return;
    drag.current = { x: e.clientX, y: e.clientY, rx: view.rx, rz: view.rz, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || mode === "2d") return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    setView({ rz: d.rz - dx * 0.4, rx: Math.max(20, Math.min(78, d.rx - dy * 0.3)) });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onSelect(null);
  };

  const deckSlots = SLOTS.filter((s) => s.onDeck);
  const motors = build.drive === "motors";
  const encoders = build.encoder === "encoder";

  return (
    <div
      ref={wrapRef}
      className={`ws-stage ${over ? "is-over" : ""} ${dragging ? "is-dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("text/rl-component")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        if (!over) {
          setOver(true);
          onDragState(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOver(false);
        onDragState(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDragState(false);
        const id = e.dataTransfer.getData("text/rl-component") as ComponentId;
        if (id && COMPONENT_MAP[id]) onDropComponent(id);
      }}
    >
      <div className="ws-stage__hint">
        {dragging ? "Release over the robot to install" : "Drag to orbit · click a part to remove it"}
      </div>

      <div className="ws-scene-wrap" style={{ transform: `scale(${scale})` }}>
        <div
          className="ws-scene"
          style={{
            transform: `translateY(${mode === "2d" ? -10 : 0}px) rotateX(${rx}deg) rotateZ(${rz}deg)`,
            transition: drag.current ? "none" : "transform 0.6s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {/* Turntable */}
          <div className="ws-floor" />
          <div className="ws-floor ws-floor--ring" />

          {/* Wheels (left/right) */}
          {[-1, 1].map((side) => (
            <Wheel key={side} side={side} motors={motors} encoders={encoders} />
          ))}

          {/* Body sides */}
          <div className="ws-face ws-face--side" style={face("left")} />
          <div className="ws-face ws-face--side" style={face("right")} />
          <div className="ws-face ws-face--back" style={face("back")} />
          <div className="ws-face ws-face--front" style={face("front")}>
            <span className="ws-led" />
            <span className="ws-badge">ATSN</span>
            <span className="ws-lamp ws-lamp--l" />
            <span className="ws-lamp ws-lamp--r" />
            {build.bumper && selected === "bumper" && (
              <button
                type="button"
                className="ws-callout ws-callout--bumper"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove("bumper");
                }}
              >
                Bumper <span className="ws-callout__remove"><Icon name="x" size={12} /> Remove</span>
              </button>
            )}
            {build.bumper && (
              <button
                type="button"
                data-sprite
                className={`ws-bumper ${justPlaced === "bumper" ? "is-new" : ""} ${selected === "bumper" ? "is-selected" : ""}`}
                onClick={() => onSelect("bumper")}
                aria-label="Safety Bumper"
              />
            )}
          </div>

          {/* Deck */}
          <div className="ws-deck" style={{ transform: `translateZ(${BODY_TOP}px)` }}>
            <div className="ws-deck__panel" />
            {deckSlots.map((s) => {
              if (s.id === "gripper") return null;
              const occupied = Boolean(build[s.id]);
              const target = accepts(s.id);
              return (
                <div
                  key={s.id}
                  className={`ws-slot ${occupied ? "is-occupied" : ""} ${target ? "is-target" : ""}`}
                  style={{ left: s.x - s.w / 2, top: s.y - s.d / 2, width: s.w, height: s.d }}
                >
                  {!occupied && target && <span>{s.label}</span>}
                </div>
              );
            })}
          </div>

          {/* Deck components: rigid 3D models fixed to the chassis */}
          {deckSlots.map((s) => {
            const id = build[s.id];
            if (!id) return null;
            const def = COMPONENT_MAP[id];
            const onArm = s.id === "gripper";
            const px = s.x;
            const py = onArm ? s.y + 52 : s.y;
            const pz = BODY_TOP + (onArm ? 32 : 0);
            const labelZ = (onArm ? 8 : PART_HEIGHT[id] ?? 20) + 18;
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                data-sprite
                aria-label={def.name}
                className={`ws-part ${justPlaced === s.id ? "is-new" : ""} ${selected === s.id ? "is-selected" : ""}`}
                style={{ transform: `translate3d(${px}px, ${py}px, ${pz}px)` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(selected === s.id ? null : s.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selected === s.id ? null : s.id);
                  }
                }}
              >
                {!onArm && <div className="ws-shadow" style={{ width: s.w * 1.1, height: s.d * 1.1 }} />}
                <div className="ws-part__body">
                  <PartModel id={id} />
                </div>
                {(justPlaced === s.id || selected === s.id) && (
                  <div className="ws-label" style={{ transform: `translateZ(${labelZ}px) rotateZ(${-rz}deg) rotateX(${-rx}deg)` }}>
                    <span className="ws-callout">
                      {def.short}
                      {selected === s.id ? (
                        <button
                          type="button"
                          className="ws-callout__remove"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(s.id);
                          }}
                        >
                          <Icon name="x" size={12} /> Remove
                        </button>
                      ) : (
                        <Icon name="check" size={13} />
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && build[selected] && (
        <div className="ws-inspect">
          <ComponentArt id={build[selected]!} className="ws-inspect__art" />
          <div>
            <strong>{COMPONENT_MAP[build[selected]!].name}</strong>
            <small>{SLOT_MAP[selected].label}</small>
          </div>
          <button type="button" className="rl-btn rl-btn--ghost rl-btn--sm" onClick={() => onRemove(selected)}>
            <Icon name="trash" size={15} /> Remove
          </button>
        </div>
      )}

      <div className="ws-viewbar" onPointerDown={(e) => e.stopPropagation()}>
        <div className="rl-seg">
          <button type="button" className={mode === "3d" ? "is-on" : ""} onClick={() => setMode("3d")}>
            3D
          </button>
          <button type="button" className={mode === "2d" ? "is-on" : ""} onClick={() => setMode("2d")}>
            2D
          </button>
        </div>
        <button type="button" className="rl-iconbtn" title="Rotate left" onClick={() => setView((v) => ({ ...v, rz: v.rz + 45 }))}>
          <Icon name="undo" />
        </button>
        <button type="button" className="rl-iconbtn" title="Rotate right" onClick={() => setView((v) => ({ ...v, rz: v.rz - 45 }))}>
          <Icon name="redo" />
        </button>
        <button type="button" className="rl-iconbtn" title="Reset view" onClick={() => setView({ rx: 58, rz: -26 })}>
          <Icon name="expand" />
        </button>
      </div>
    </div>
  );
}

function face(which: "left" | "right" | "front" | "back"): React.CSSProperties {
  const h = BODY_TOP - BODY_BOTTOM;
  switch (which) {
    case "front":
      return { width: DECK_W, height: h, transform: `translate3d(0, ${DECK_D}px, ${BODY_TOP}px) rotateX(-90deg)` };
    case "back":
      return { width: DECK_W, height: h, transform: `translate3d(0, 0, ${BODY_TOP}px) rotateX(-90deg)` };
    case "left":
      return { width: DECK_D, height: h, transform: `translate3d(0, 0, ${BODY_TOP}px) rotateZ(90deg) rotateX(-90deg)` };
    case "right":
      return { width: DECK_D, height: h, transform: `translate3d(${DECK_W}px, 0, ${BODY_TOP}px) rotateZ(90deg) rotateX(-90deg)` };
  }
}

function Wheel({ side, motors, encoders }: { side: number; motors: boolean; encoders: boolean }) {
  const layers = 7;
  const thick = 26;
  const baseX = side < 0 ? -6 : DECK_W + 6;
  return (
    <>
      {Array.from({ length: layers }).map((_, i) => {
        const x = baseX + side * (i / (layers - 1)) * thick;
        const outer = i === layers - 1;
        return (
          <div
            key={i}
            className={`ws-wheel ${outer ? "ws-wheel--outer" : ""} ${motors ? "is-powered" : ""} ${encoders && outer ? "has-encoder" : ""}`}
            style={{
              width: WHEEL_R * 2,
              height: WHEEL_R * 2,
              transform: `translate3d(${x}px, ${DECK_D / 2 - WHEEL_R}px, ${WHEEL_R * 2}px) rotateZ(90deg) rotateX(-90deg)`,
            }}
          />
        );
      })}
    </>
  );
}
