"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_BUILD, type Build } from "./catalog";

// Student progress lives in localStorage for now. Swap for a backend once accounts exist.

export interface Profile {
  xp: number;
  completed: string[];
  missionId: string;
}

const PROFILE_KEY = "atsn.rl.profile.v1";
const BUILD_KEY = "atsn.rl.build.v1";

export const DEFAULT_PROFILE: Profile = { xp: 0, completed: [], missionId: "m1" };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: progress simply is not persisted */
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  useEffect(() => setProfile(read(PROFILE_KEY, DEFAULT_PROFILE)), []);
  const update = useCallback((fn: (p: Profile) => Profile) => {
    setProfile((p) => {
      const next = fn(p);
      write(PROFILE_KEY, next);
      return next;
    });
  }, []);
  return [profile, update] as const;
}

export function loadBuild(): { build: Build; fromWorkshop: boolean } {
  try {
    const raw = window.localStorage.getItem(BUILD_KEY);
    if (raw) return { build: JSON.parse(raw) as Build, fromWorkshop: true };
  } catch {
    /* fall through */
  }
  return { build: DEFAULT_BUILD, fromWorkshop: false };
}

export function saveBuild(build: Build) {
  write(BUILD_KEY, build);
}
