"use client";

import { useState } from "react";
import { Icon } from "../components/Icon";
import {
  availability,
  BLOCKS,
  BLOCK_MAP,
  makeBlock,
  programToCode,
  starterProgram,
  wiring,
  EMPTY_PROGRAM,
  type BlockId,
  type Lane,
  type Program,
} from "../data/blocks";
import type { Build } from "../data/catalog";

const LANES: { id: Lane; title: string; sub: string }[] = [
  { id: "input", title: "Inputs", sub: "Topics the robot subscribes to" },
  { id: "decision", title: "Decision Layer", sub: "How it chooses what to do" },
  { id: "actuator", title: "Actuators", sub: "How commands reach the wheels" },
];

export function ProgramBuilder({ program, build, onChange }: { program: Program; build: Build; onChange: (p: Program) => void }) {
  const [overLane, setOverLane] = useState<Lane | null>(null);
  const [showCode, setShowCode] = useState(false);

  const add = (id: BlockId) => {
    const lane = BLOCK_MAP[id].lane;
    if (program[lane].some((b) => b.id === id)) return;
    if (!availability(id, build).ok) return;
    onChange({ ...program, [lane]: [...program[lane], makeBlock(id)] });
  };
  const remove = (lane: Lane, uid: string) => onChange({ ...program, [lane]: program[lane].filter((b) => b.uid !== uid) });
  const setParam = (lane: Lane, uid: string, key: string, val: number) =>
    onChange({ ...program, [lane]: program[lane].map((b) => (b.uid === uid ? { ...b, params: { ...b.params, [key]: val } } : b)) });

  const used = new Set([...program.input, ...program.decision, ...program.actuator].map((b) => b.id));

  return (
    <div className="pb">

      <div className="pb-main">
        <div className="pb-toolbar">
          <span className="pb-hint">Click a chip to add it, or drag it into its lane. Safety blocks always take priority.</span>
          <div className="pb-toolbar__btns">
            <button type="button" className="rl-btn rl-btn--ghost rl-btn--sm" onClick={() => onChange(starterProgram(build))}>
              <Icon name="spark" size={14} /> Starter Program
            </button>
            <button type="button" className="rl-btn rl-btn--ghost rl-btn--sm" onClick={() => onChange(EMPTY_PROGRAM)}>
              <Icon name="trash" size={14} /> Clear
            </button>
            <button type="button" className={`rl-btn rl-btn--ghost rl-btn--sm ${showCode ? "is-on" : ""}`} onClick={() => setShowCode((s) => !s)}>
              <Icon name="code" size={14} /> {showCode ? "Blocks" : "View as Code"}
            </button>
          </div>
        </div>

        {showCode ? (
          <pre className="pb-code">{programToCode(program)}</pre>
        ) : (
          <div className="pb-lanes">
            {LANES.map((lane, li) => (
              <div key={lane.id} className="pb-lane-wrap">
                {li > 0 && (
                  <span className="pb-arrow" aria-hidden="true">
                    <Icon name="arrowRight" size={16} />
                  </span>
                )}
                <div
                  className={`pb-lane pb-lane--${lane.id} ${overLane === lane.id ? "is-over" : ""}`}
                  onDragOver={(e) => {
                    const id = e.dataTransfer.types.includes("text/rl-block");
                    if (!id) return;
                    e.preventDefault();
                    setOverLane(lane.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverLane(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOverLane(null);
                    const id = e.dataTransfer.getData("text/rl-block") as BlockId;
                    if (id && BLOCK_MAP[id]?.lane === lane.id) add(id);
                  }}
                >
                  <header>
                    <strong>{lane.title}</strong>
                    <small>{lane.sub}</small>
                  </header>
                  
                  {program[lane.id].map((b) => {
                    const def = BLOCK_MAP[b.id];
                    const st = wiring(b.id, program, build);
                    return (
                      <div key={b.uid} className={`pb-block pb-block--${lane.id} ${st.ok ? "" : "is-bad"}`}>
                        <div className="pb-block__head">
                          <span className={`pb-dot ${st.ok ? "is-ok" : ""}`} />
                          <strong>{def.name}</strong>
                          <code>{def.tag}</code>
                          <button type="button" onClick={() => remove(lane.id, b.uid)} aria-label={`Remove ${def.name}`}>
                            <Icon name="x" size={13} />
                          </button>
                        </div>
                        {!st.ok && <p className="pb-warn">{st.reason}</p>}
                        {def.params?.map((p) => (
                          <label key={p.key} className="pb-param" title={p.label}>
                            <span>{p.label}</span>
                            <input
                              type="range"
                              min={p.min}
                              max={p.max}
                              step={p.step}
                              value={b.params[p.key]}
                              onChange={(e) => setParam(lane.id, b.uid, p.key, Number(e.target.value))}
                            />
                            <output>
                              {b.params[p.key]} {p.unit}
                            </output>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                  <div className="pb-add">
                    {BLOCKS.filter((x) => x.lane === lane.id && !used.has(x.id)).map((x) => {
                      const av = availability(x.id, build);
                      return (
                        <button
                          key={x.id}
                          type="button"
                          className={`pb-chip pb-chip--${lane.id} ${!av.ok ? "is-locked" : ""}`}
                          draggable={av.ok}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/rl-block", x.id);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          onClick={() => add(x.id)}
                          disabled={!av.ok}
                          title={av.ok ? `${x.name} (${x.tag}): ${x.desc}` : `${x.name}: ${av.reason}`}
                        >
                          <Icon name={av.ok ? "plus" : "lock"} size={11} />
                          <span>{x.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
