"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createApplication,
  setStatus,
  STATUSES,
  type Application,
  type NewApplication,
  type Status,
} from "./applications";

const KEY = "internship-tracker:v1";

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isApplication(value: unknown): value is Application {
  const a = value as Application;
  return (
    typeof a === "object" &&
    a !== null &&
    typeof a.id === "string" &&
    typeof a.company === "string" &&
    typeof a.role === "string" &&
    STATUSES.includes(a.status)
  );
}

function load(): Application[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isApplication) : [];
  } catch {
    return [];
  }
}

function save(apps: Application[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(apps));
  } catch {
    // Storage blocked or full: keep working in memory.
  }
}

/**
 * Applications state persisted to localStorage.
 * Loads after mount so the statically exported HTML and the first client
 * render match (no hydration mismatch).
 */
export function useApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setApps(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(apps);
  }, [apps, loaded]);

  const add = useCallback((input: NewApplication) => {
    const created = createApplication(input, todayISO());
    setApps((prev) => [...prev, created]);
    return created;
  }, []);

  const move = useCallback((id: string, status: Status) => {
    setApps((prev) => prev.map((a) => (a.id === id ? setStatus(a, status, todayISO()) : a)));
  }, []);

  const remove = useCallback((id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { apps, loaded, add, move, remove };
}
