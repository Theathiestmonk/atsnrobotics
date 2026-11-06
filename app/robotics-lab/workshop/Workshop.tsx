"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentArt } from "../components/ComponentArt";
import { Icon, type IconName } from "../components/Icon";
import { MiniMap } from "../components/MiniMap";
import { TopBar } from "../components/TopBar";
import {
  analyze,
  CAP_MAP,
  CAP_TREE,
  CATEGORIES,
  CHASSIS,
  COMPONENTS,
  COMPONENT_MAP,
  countOf,
  levelFromXp,
  MISSIONS,
  MISSION_MAP,
  placeComponent,
  removeSlot,
  type Build,
  type CapId,
  type Category,
  type ComponentId,
  type SlotId,
} from "../data/catalog";
import { loadBuild, saveBuild, useProfile } from "../data/store";
import { ChassisStage } from "./ChassisStage";

const ChassisStageMemo = memo(ChassisStage);

type Toast = { id: number; kind: "unlock" | "error" | "info"; text: string; sub?: string };

const CAP_ICON: Record<CapId, IconName> = {
  mobility: "robot",
  odometry: "arrowUp",
  heading: "rotate",
  mapping: "map",
  obstacle: "eye",
  mapping3d: "layers",
  navigation: "pin",
  objects: "camera",
  manipulation: "grip",
  delivery: "layers",
};

export function Workshop() {
  const router = useRouter();
  const [profile, updateProfile] = useProfile();
  const [history, setHistory] = useState<{ stack: Build[]; i: number }>({ stack: [{}], i: 0 });
  const build = history.stack[history.i];
  const [cat, setCat] = useState<Category | "all">("all");
  const [dragging, setDragging] = useState<ComponentId | null>(null);
  const [justPlaced, setJustPlaced] = useState<SlotId | null>(null);
  const [selected, setSelected] = useState<SlotId | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Resume the previous build so students never lose their robot.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { build: saved, fromWorkshop } = loadBuild();
    if (fromWorkshop) setHistory({ stack: [saved], i: 0 });
    setReady(true);
  }, []);

  const analysis = useMemo(() => analyze(build), [build]);
  const mission = MISSION_MAP[profile.missionId] ?? MISSIONS[0];
  const level = levelFromXp(profile.xp);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.kind === "unlock" ? 3600 : 2800);
  }, []);

  const commit = useCallback(
    (next: Build) => {
      const before = analyze(build).unlocked;
      const after = analyze(next).unlocked;
      after.forEach((c) => {
        if (!before.has(c)) toast({ kind: "unlock", text: CAP_MAP[c].name, sub: "Capability unlocked" });
      });
      const nextA = analyze(next);
      before.forEach((c) => {
        if (!after.has(c))
          toast({
            kind: "error",
            text: `${CAP_MAP[c].name} locked`,
            sub: nextA.caps[c].starved ? "Not enough compute. Upgrade the compute board." : `Needs ${nextA.caps[c].missing.join(", ")}`,
          });
      });
      setHistory((h) => ({ stack: [...h.stack.slice(0, h.i + 1), next].slice(-60), i: Math.min(h.i + 1, 59) }));
      saveBuild(next);
    },
    [build, toast],
  );

  const install = useCallback(
    (id: ComponentId) => {
      const res = placeComponent(build, id);
      if ("error" in res) {
        toast({ kind: "error", text: res.error });
        return;
      }
      if (res.replaced) toast({ kind: "info", text: `${COMPONENT_MAP[res.replaced].name} swapped for ${COMPONENT_MAP[id].name}` });
      commit(res.build);
      setSelected(null);
      setJustPlaced(res.slot);
      window.setTimeout(() => setJustPlaced((s) => (s === res.slot ? null : s)), 1800);
    },
    [build, commit, toast],
  );

  const removeComponent = (id: ComponentId) => {
    const slots = (Object.keys(build) as SlotId[]).filter((s) => build[s] === id);
    const slot = slots[slots.length - 1];
    if (slot) {
      remove(slot);
      toast({ kind: "info", text: `${COMPONENT_MAP[id].name} removed` });
    }
  };

  const remove = (slot: SlotId) => {
    commit(removeSlot(build, slot));
    setSelected(null);
  };

  const autoBuild = () => {
    let next: Build = {};
    for (const id of mission.recommended) {
      const r = placeComponent(next, id);
      if (!("error" in r)) next = r.build;
    }
    commit(next);
    toast({ kind: "info", text: `Recommended kit for ${mission.code} installed`, sub: "Study why each part is there." });
  };

  const undo = () => setHistory((h) => ({ ...h, i: Math.max(0, h.i - 1) }));
  const redo = () => setHistory((h) => ({ ...h, i: Math.min(h.stack.length - 1, h.i + 1) }));
  useEffect(() => {
    if (ready) saveBuild(build);
  }, [build, ready]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) remove(selected);
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const missing = mission.requires.filter((c) => !analysis.unlocked.has(c));
  const canMove = analysis.unlocked.has("mobility");
  const ladderOn = CAP_TREE.filter((c) => analysis.unlocked.has(c));
  const nextCap = CAP_TREE.find((c) => !analysis.unlocked.has(c));

  // The simulation always runs with whatever is installed; nothing blocks deployment.
  const deploy = () => {
    saveBuild(build);
    router.push("/robotics-lab/lab");
  };

  const parts = COMPONENTS.filter((c) => cat === "all" || c.category === cat);
  const firstLocked = CAP_TREE.find((c) => !analysis.unlocked.has(c));
  const battery = build.power ? COMPONENT_MAP[build.power] : null;
  const compute = build.compute ? COMPONENT_MAP[build.compute] : null;

  return (
    <div className="rl-app">
      <TopBar profile={profile} />

      <main className="ws-grid">
        {/* ── Component library ── */}
        <section className="rl-panel ws-lib" aria-label="Component library">
          <header className="rl-panel__head">
            <Icon name="layers" className="rl-gold" />
            <h2>Component Library</h2>
          </header>
          <div className="rl-filter" role="tablist">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                className={cat === c.id ? "is-on" : ""}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="ws-lib__grid">
            {parts.map((c) => {
              const count = countOf(build, c.id);
              const installed = count > 0 && (c.slots.length === 1 || count >= c.slots.length);
              return (
                <div
                  key={c.id}
                  className={`ws-card ${installed ? "is-installed" : ""} `}
                  draggable={!installed}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/rl-component", c.id);
                    e.dataTransfer.effectAllowed = "copy";
                    setDragging(c.id);
                  }}
                  onDragEnd={() => setDragging(null)}
                  title={c.blurb}
                >
                  <ComponentArt id={c.id} className="ws-card__art" />
                  <div className="ws-card__body">
                    <strong>{c.name}</strong>
                    <small>{c.spec}</small>
                  </div>
                  {count > 0 && (
                    <button
                      type="button"
                      className="ws-card__remove"
                      onClick={() => removeComponent(c.id)}
                      aria-label={`Remove ${c.name}`}
                      title={`Remove ${c.name}`}
                    >
                      <Icon name="check" size={13} className="ws-card__remove-on" />
                      <Icon name="x" size={13} className="ws-card__remove-x" />
                    </button>
                  )}
                  {!installed && (
                    <button type="button" className="ws-card__add" onClick={() => install(c.id)} aria-label={`Install ${c.name}`}>
                      <Icon name="plus" size={15} />
                    </button>
                  )}
                  {count > 1 && <span className="ws-card__count">×{count}</span>}
                  <div className="ws-card__tip">
                    <p>{c.blurb}</p>
                    <dl>
                      <div>
                        <dt>Weight</dt>
                        <dd>{c.weight} kg</dd>
                      </div>
                      <div>
                        <dt>{c.powerProvide ? "Supplies" : "Power"}</dt>
                        <dd>{c.powerProvide ?? c.power} W</dd>
                      </div>
                      <div>
                        <dt>{c.computeProvide ? "Provides" : "Compute"}</dt>
                        <dd>{c.computeProvide ?? c.computeLoad} TOPS</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Builder ── */}
        <section className="rl-panel ws-builder" aria-label="Robot builder">
          <header className="ws-builder__head">
            <div className="ws-builder__title">
              <span className="rl-badge-icon">
                <Icon name="robot" />
              </span>
              <div>
                <h1>Robot Builder</h1>
                <p>Drag components onto the chassis. Each one unlocks new abilities.</p>
              </div>
            </div>
            <div className="ws-builder__tools">
              <button type="button" className="rl-iconbtn" onClick={undo} disabled={history.i === 0} title="Undo (Ctrl+Z)">
                <Icon name="undo" />
              </button>
              <button
                type="button"
                className="rl-iconbtn"
                onClick={redo}
                disabled={history.i >= history.stack.length - 1}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Icon name="redo" />
              </button>
              <button type="button" className="rl-btn rl-btn--ghost" onClick={autoBuild}>
                <Icon name="spark" /> Auto Build
              </button>
              <button type="button" className="rl-btn rl-btn--ghost" onClick={() => commit({})} disabled={!Object.keys(build).length}>
                <Icon name="trash" /> Clear
              </button>
            </div>
          </header>

          <div className="ws-builder__body">
            <ChassisStageMemo
              build={build}
              dragging={dragging}
              justPlaced={justPlaced}
              selected={selected}
              onSelect={setSelected}
              onRemove={remove}
              onDropComponent={install}
              onDragState={() => undefined}
            />

            <aside className="ws-config">
              <h3>
                <Icon name="gear" size={16} /> Robot Configuration
              </h3>
              <dl className="rl-kv">
                <div>
                  <dt>Chassis</dt>
                  <dd>{CHASSIS.name}</dd>
                </div>
                <div>
                  <dt>Size (L × W × H)</dt>
                  <dd>{CHASSIS.size}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{analysis.weight.toFixed(1)} kg</dd>
                </div>
                <div>
                  <dt>Battery</dt>
                  <dd>{battery ? battery.spec.split(" · ")[1] ?? battery.spec : "None"}</dd>
                </div>
                <div>
                  <dt>Compute</dt>
                  <dd>{compute ? compute.name : "None"}</dd>
                </div>
              </dl>
              <h3 className="ws-config__caps">
                <Icon name="bolt" size={16} className="rl-gold" /> Capabilities
              </h3>
              <ul className="ws-caps">
                {(["mobility", "odometry", "heading", "mapping", "obstacle", "mapping3d", "navigation", "objects", "manipulation", "delivery"] as CapId[]).map(
                  (id) => {
                    const st = analysis.caps[id];
                    return (
                      <li key={id} className={st.unlocked ? "is-on" : st.starved ? "is-starved" : ""}>
                        <Icon name={st.unlocked ? "check" : "lock"} size={15} />
                        <span>{CAP_MAP[id].name}</span>
                        <em className="ws-caps__tip">
                          {st.unlocked ? CAP_MAP[id].desc : `Needs ${st.missing.join(", ")}`}
                        </em>
                      </li>
                    );
                  },
                )}
              </ul>
              <h3 className="ws-config__caps">
                <Icon name="layers" size={16} className="rl-gold" /> Installed Parts
              </h3>
              {Object.keys(build).length === 0 ? (
                <p className="ws-installed__empty">Nothing installed yet. Drag a part onto the chassis.</p>
              ) : (
                <ul className="ws-installed">
                  {(Object.entries(build) as [SlotId, ComponentId][]).map(([slot, id]) => (
                    <li key={slot} className={selected === slot ? "is-on" : ""}>
                      <button
                        type="button"
                        className="ws-installed__name"
                        onClick={() => setSelected(selected === slot ? null : slot)}
                        title={COMPONENT_MAP[id].name}
                      >
                        <ComponentArt id={id} />
                        <span>{COMPONENT_MAP[id].short}</span>
                      </button>
                      <button type="button" className="ws-installed__x" onClick={() => remove(slot)} aria-label={`Remove ${COMPONENT_MAP[id].name}`} title="Remove">
                        <Icon name="x" size={11} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>

          <div className="ws-meters">
            <Meter icon="weight" label="Weight" value={analysis.weight} max={CHASSIS.maxWeight} unit="kg" fmt={(v) => v.toFixed(1)} />
            <Meter
              icon="bolt"
              label="Power"
              value={analysis.powerDraw}
              max={analysis.powerSupply}
              unit="W"
              fmt={(v) => v.toFixed(0)}
              emptyNote="Install a battery"
            />
            <Meter
              icon="chip"
              label="Compute"
              value={analysis.computeLoad}
              max={analysis.computeSupply}
              unit="TOPS"
              fmt={(v) => (Math.round(v * 10) / 10).toString()}
              emptyNote="Install a compute board"
            />
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="rl-panel ws-mission" aria-label="Mission">
          <header className="rl-panel__head">
            <Icon name="flag" className="rl-gold" />
            <h2>Mission</h2>
          </header>
          <ul className="ws-missions" aria-label="All missions">
            {MISSIONS.map((m) => {
              const locked = m.level > level;
              const done = profile.completed.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    disabled={locked}
                    className={`${m.id === mission.id ? "is-on" : ""} ${done ? "is-done" : ""}`}
                    onClick={() => updateProfile((p) => ({ ...p, missionId: m.id }))}
                    title={locked ? `${m.title} · unlocks at Lv. ${m.level}` : `${m.title} · ${m.tier}`}
                  >
                    {locked ? <Icon name="lock" size={11} /> : done ? <Icon name="check" size={11} /> : null}
                    {m.code}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="ws-mission__card">
            <div className="ws-mission__map">
              <MiniMap env={mission.env} />
              <span className="ws-tier">{mission.tier}</span>
            </div>
            <h3>
              {mission.code}. {mission.title}
            </h3>
            <p>{mission.brief}</p>
          </div>

          <div className="ws-mission__row">
            <h4 className="ws-mission__sub">
              <Icon name="list" size={15} /> Requirements
            </h4>
            <span className="ws-reward-chip">
              <Icon name="spark" size={14} className="rl-gold" /> +{mission.reward.xp} XP
            </span>
          </div>
          <ul className="ws-req">
            {mission.requires.map((c) => {
              const ok = analysis.unlocked.has(c);
              return (
                <li key={c} className={ok ? "is-on" : ""}>
                  <Icon name={ok ? "check" : "lock"} size={15} />
                  {CAP_MAP[c].name}
                </li>
              );
            })}
          </ul>

          <div className="ws-mission__foot">
            <button type="button" className="rl-btn rl-btn--gold ws-deploy" onClick={deploy}>
              <Icon name="play" /> Deploy to Simulation
            </button>
            <p className="ws-deploy__note">
              {!canMove
                ? `In the simulation it will sit still: it needs ${analysis.caps.mobility.missing.join(", ")}.`
                : `In the simulation: ${ladderOn.map((c) => CAP_MAP[c].short).join(" · ")}.`}{" "}
              {nextCap && canMove && <>Next: {CAP_MAP[nextCap].short} needs {analysis.caps[nextCap].missing.join(", ")}.</>}
              {analysis.issues[0] && <span className="ws-deploy__warn"> {analysis.issues[0]}.</span>}
              {canMove && !missing.length && <span className="rl-gold"> Mission ready.</span>}
            </p>
          </div>
        </section>

        {/* ── Capability tree ── */}
        <section className="rl-panel ws-tree" aria-label="Capability tree">
          <div className="ws-tree__intro">
            <Icon name="spark" size={26} className="rl-gold" />
            <div>
              <h2>Capability Tree</h2>
              <p>Add hardware to unlock each stage of autonomy.</p>
            </div>
          </div>
          <ol className="ws-tree__nodes">
            {CAP_TREE.map((id, i) => {
              const st = analysis.caps[id];
              const state = st.unlocked ? "is-on" : id === firstLocked ? "is-next" : "";
              return (
                <li key={id} className={state}>
                  {i > 0 && <span className="ws-tree__link" aria-hidden="true" />}
                  <div className="ws-node" tabIndex={0}>
                    <span className="ws-node__flag">
                      <Icon name={st.unlocked ? "check" : "lock"} size={12} />
                    </span>
                    <Icon name={CAP_ICON[id]} size={22} />
                    <span className="ws-node__txt">
                      <strong>{CAP_MAP[id].name.replace(" (SLAM)", "")}</strong>
                      <small>{CAP_MAP[id].sub}</small>
                    </span>
                    {!st.unlocked && <em className="ws-node__tip">Needs {st.missing.join(", ")}</em>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>

      <div className="rl-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`rl-toast rl-toast--${t.kind}`}>
            <Icon name={t.kind === "unlock" ? "bolt" : t.kind === "error" ? "x" : "spark"} />
            <div>
              {t.sub && t.kind === "unlock" && <small>{t.sub}</small>}
              <strong>{t.text}</strong>
              {t.sub && t.kind !== "unlock" && <small>{t.sub}</small>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function Meter({
  icon,
  label,
  value,
  max,
  unit,
  fmt,
  emptyNote,
}: {
  icon: IconName;
  label: string;
  value: number;
  max: number;
  unit?: string;
  fmt: (v: number) => string;
  emptyNote?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : value > 0 ? 100 : 0;
  const over = value > max + 1e-9;
  return (
    <div className={`ws-meter ${over ? "is-over" : ""}`}>
      <Icon name={icon} size={22} />
      <div>
        <span>{label}</span>
        <strong>
          {fmt(value)} / {fmt(max)} {unit}
        </strong>
        <i>
          <b style={{ width: `${pct}%` }} />
        </i>
        {over && max === 0 && emptyNote && <small>{emptyNote}</small>}
      </div>
    </div>
  );
}
