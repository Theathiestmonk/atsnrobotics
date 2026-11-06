"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type RLTheme = "dark" | "light";

const KEY = "atsn.rl.theme";
const Ctx = createContext<{ theme: RLTheme; toggle: () => void }>({ theme: "dark", toggle: () => undefined });

export const useRLTheme = () => useContext(Ctx);

// Runs before first paint so a saved light preference never flashes dark.
const NO_FLASH = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.currentScript.parentElement.setAttribute("data-theme",t)}catch(e){}})();`;

export function ThemeRoot({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<RLTheme>("dark");

  useEffect(() => {
    const attr = ref.current?.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") setTheme(attr);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        /* preference just won't persist */
      }
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div ref={ref} className={className} data-theme={theme} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        {children}
      </div>
    </Ctx.Provider>
  );
}
