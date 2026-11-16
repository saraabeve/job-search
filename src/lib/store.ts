"use client";

import { useSyncExternalStore } from "react";
import type { CV, Job } from "./types";

interface State {
  cvs: CV[];
  jobs: Job[];
}

const KEY = "job-search:v1";
const EMPTY: State = { cvs: [], jobs: [] };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    // Corrupt or unavailable storage: start empty rather than crash.
  }
}

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const snapshot = () => {
  load();
  return state;
};

/** Returns null until the browser store has been read (i.e. during server render / hydration). */
export function useStore(): State | null {
  return useSyncExternalStore<State | null>(subscribe, snapshot, () => null);
}

export const actions = {
  saveCV(cv: CV) {
    load();
    const next = { ...cv, updatedAt: Date.now() };
    const exists = state.cvs.some((c) => c.id === cv.id);
    set({ ...state, cvs: exists ? state.cvs.map((c) => (c.id === cv.id ? next : c)) : [next, ...state.cvs] });
  },
  deleteCV(id: string) {
    load();
    set({
      cvs: state.cvs.filter((c) => c.id !== id),
      jobs: state.jobs.map((j) => (j.tailoredCvId === id ? { ...j, tailoredCvId: undefined } : j)),
    });
  },
  saveJob(job: Job) {
    load();
    const exists = state.jobs.some((j) => j.id === job.id);
    set({ ...state, jobs: exists ? state.jobs.map((j) => (j.id === job.id ? job : j)) : [job, ...state.jobs] });
  },
  deleteJob(id: string) {
    load();
    set({ ...state, jobs: state.jobs.filter((j) => j.id !== id) });
  },
};
