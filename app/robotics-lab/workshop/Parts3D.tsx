"use client";

import type { ComponentId } from "../data/catalog";

// True CSS-3D models for deck components. Everything is built from boxes and stacked discs
// positioned in the deck's coordinate space, so parts rotate rigidly with the chassis.

type Mat = "black" | "silver" | "white" | "gold" | "board";

interface BoxProps {
  x?: number;
  y?: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  mat: Mat;
  front?: React.ReactNode;
  top?: React.ReactNode;
  className?: string;
}

/** Axis-aligned box whose bottom-centre sits at (x, y, z). */
export function Box({ x = 0, y = 0, z = 0, w, d, h, mat, front, top, className }: BoxProps) {
  return (
    <div className={`p3-group ${className ?? ""}`} style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
      <div className={`p3-f p3-top m-${mat}`} style={{ width: w, height: d, transform: `translate3d(${-w / 2}px, ${-d / 2}px, ${h}px)` }}>
        {top}
      </div>
      <div
        className={`p3-f p3-side p3-back m-${mat}`}
        style={{ width: w, height: h, transform: `translate3d(${-w / 2}px, ${-d / 2}px, ${h}px) rotateX(-90deg)` }}
      />
      <div
        className={`p3-f p3-side p3-l m-${mat}`}
        style={{ width: d, height: h, transform: `translate3d(${-w / 2}px, ${-d / 2}px, ${h}px) rotateZ(90deg) rotateX(-90deg)` }}
      />
      <div
        className={`p3-f p3-side p3-r m-${mat}`}
        style={{ width: d, height: h, transform: `translate3d(${w / 2}px, ${-d / 2}px, ${h}px) rotateZ(90deg) rotateX(-90deg)` }}
      />
      <div
        className={`p3-f p3-side p3-front m-${mat}`}
        style={{ width: w, height: h, transform: `translate3d(${-w / 2}px, ${d / 2}px, ${h}px) rotateX(-90deg)` }}
      >
        {front}
      </div>
    </div>
  );
}

/** Vertical cylinder from stacked discs, bottom-centre at (x, y, z). */
export function Cyl({ x = 0, y = 0, z = 0, r, h, mat, cap, ring }: { x?: number; y?: number; z?: number; r: number; h: number; mat: Mat; cap?: Mat; ring?: number }) {
  const n = Math.max(2, Math.ceil(h / 2.5));
  return (
    <div className="p3-group" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
      {Array.from({ length: n + 1 }).map((_, i) => {
        const zz = (h * i) / n;
        const isTop = i === n;
        const isRing = ring !== undefined && Math.abs(zz - ring) < h / n / 2 + 0.01;
        return (
          <div
            key={i}
            className={`p3-f p3-disc m-${isTop ? cap ?? mat : mat} ${isTop ? "p3-disc--top" : ""} ${isRing ? "p3-disc--ring" : ""}`}
            style={{ width: r * 2, height: r * 2, transform: `translate3d(${-r}px, ${-r}px, ${zz}px)` }}
          />
        );
      })}
    </div>
  );
}

const Lens = ({ size, gold }: { size: number; gold?: boolean }) => (
  <span className={`p3-lens ${gold ? "p3-lens--gold" : ""}`} style={{ width: size, height: size }} />
);

export function PartModel({ id }: { id: ComponentId }) {
  switch (id) {
    case "lidar":
      return (
        <>
          <Cyl r={24} h={20} mat="black" cap="silver" ring={8} />
          <Cyl z={20} r={15} h={14} mat="black" cap="silver" />
        </>
      );
    case "lidar3d":
      return (
        <>
          <Cyl r={20} h={14} mat="black" cap="silver" ring={6} />
          <Cyl z={14} r={18} h={16} mat="black" cap="black" ring={8} />
          <Cyl z={30} r={20} h={6} mat="silver" cap="silver" />
        </>
      );
    case "esp32":
      return <Box w={30} d={22} h={4} mat="board" top={<span className="p3-chip p3-chip--silver" />} />;
    case "arduino":
      return (
        <Box
          w={52}
          d={38}
          h={5}
          mat="board"
          top={
            <>
              <span className="p3-chip" />
              <span className="p3-header" />
            </>
          }
        />
      );
    case "depth":
      return (
        <>
          <Box w={10} d={8} h={8} mat="silver" />
          <Box
            z={8}
            w={66}
            d={16}
            h={20}
            mat="black"
            front={
              <div className="p3-row">
                <Lens size={11} />
                <Lens size={8} gold />
                <Lens size={11} />
              </div>
            }
          />
        </>
      );
    case "rgb":
      return (
        <>
          <Box w={8} d={8} h={6} mat="silver" />
          <Box
            z={6}
            w={30}
            d={26}
            h={26}
            mat="black"
            front={
              <div className="p3-row">
                <Lens size={18} gold />
              </div>
            }
          />
        </>
      );
    case "imu":
      return <Box w={34} d={28} h={6} mat="board" top={<span className="p3-chip" />} />;
    case "gps":
      return (
        <>
          <Cyl r={4} h={18} mat="black" />
          <Cyl z={18} r={17} h={7} mat="white" cap="white" />
        </>
      );
    case "ultrasonic":
      return (
        <Box
          w={30}
          d={8}
          h={16}
          mat="board"
          front={
            <div className="p3-row">
              <Lens size={11} />
              <Lens size={11} />
            </div>
          }
        />
      );
    case "rpi":
      return (
        <Box
          w={62}
          d={42}
          h={6}
          mat="board"
          top={
            <>
              <span className="p3-chip p3-chip--silver" />
              <span className="p3-header" />
            </>
          }
        />
      );
    case "jetson":
      return (
        <>
          <Box w={68} d={48} h={6} mat="board" />
          <Box z={6} w={46} d={36} h={16} mat="silver" top={<span className="p3-fins" />} />
        </>
      );
    case "battery24":
    case "battery48": {
      const big = id === "battery48";
      return (
        <Box
          w={big ? 66 : 60}
          d={big ? 46 : 42}
          h={big ? 34 : 26}
          mat="black"
          front={<span className="p3-label">{big ? "48V" : "24V"}</span>}
          top={
            <>
              <span className="p3-term p3-term--pos" />
              <span className="p3-term" />
            </>
          }
        />
      );
    }
    case "tray":
      return <Box w={68} d={70} h={7} mat="silver" top={<span className="p3-tray" />} />;
    case "arm":
      return (
        <>
          <Cyl r={16} h={10} mat="black" cap="silver" />
          <Box z={10} w={12} d={12} h={60} mat="silver" />
          <Cyl z={64} r={9} h={10} mat="gold" cap="gold" />
          <Box y={26} z={66} w={11} d={52} h={11} mat="silver" />
          <Cyl y={52} z={64} r={7} h={10} mat="gold" cap="gold" />
          <Box y={52} z={40} w={9} d={9} h={26} mat="silver" />
        </>
      );
    case "gripper":
      return (
        <>
          <Box w={22} d={12} h={8} mat="black" />
          <Box x={-8} z={-16} w={4} d={8} h={16} mat="silver" />
          <Box x={8} z={-16} w={4} d={8} h={16} mat="silver" />
        </>
      );
    default:
      return null;
  }
}

/** Height (px) of each model, used to float its name label just above it. */
export const PART_HEIGHT: Partial<Record<ComponentId, number>> = {
  lidar: 34,
  lidar3d: 36,
  esp32: 4,
  arduino: 5,
  depth: 28,
  rgb: 32,
  imu: 6,
  gps: 25,
  ultrasonic: 16,
  rpi: 6,
  jetson: 22,
  battery24: 26,
  battery48: 34,
  tray: 7,
  arm: 77,
  gripper: 8,
};
