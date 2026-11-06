// Minimal stroke icon set (24px grid, currentColor).

const PATHS = {
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  play: "M7 4l13 8-13 8z",
  pause: "M7 4h4v16H7zM13 4h4v16h-4z",
  stop: "M6 6h12v12H6z",
  coin: "M12 3c4.4 0 8 1.6 8 3.5S16.4 10 12 10 4 8.4 4 6.5 7.6 3 12 3zM4 6.5v5c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-5M4 11.5v5c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-5",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
  spark: "M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  check: "M5 12l5 5 9-10",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3",
  rotate: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5v1",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  weight: "M6 8h12l2 13H4zM9 8a3 3 0 0 1 6 0",
  robot: "M5 9h14v9H5zM12 5v4M9 13h.01M15 13h.01M3 13v2M21 13v2M12 3.5v1",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  reset: "M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5",
  pin: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  arrowLeft: "M19 12H5M12 5l-7 7 7 7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  signal: "M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0M12 12v.01",
  cpu: "M9 9h6v6H9zM5 5h14v14H5z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1",
  grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className, size = 18 }: { name: IconName; className?: string; size?: number }) {
  return (
    <svg
      className={`rl-icon ${className ?? ""}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
