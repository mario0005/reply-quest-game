// Per-user dietary preferences, persisted to localStorage.
import { useSyncExternalStore } from "react";

export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "other";
export type SpiceLevel = "none" | "mild" | "medium" | "hot";

export interface DietaryPreferences {
  diet: DietType;
  allergies: string; // free text, comma-separated
  spice: SpiceLevel;
  dislikes: string; // free text
}

export const defaultPreferences: DietaryPreferences = {
  diet: "omnivore",
  allergies: "",
  spice: "medium",
  dislikes: "",
};

const STORAGE_KEY = "ttq.preferences.v1";

type Store = Record<string, DietaryPreferences>;

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

let store: Store = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const preferencesStore = {
  get(userId: string): DietaryPreferences | null {
    return store[userId] ?? null;
  },
  set(userId: string, prefs: DietaryPreferences) {
    store = { ...store, [userId]: prefs };
    persist();
    emit();
  },
  remove(userId: string) {
    if (!(userId in store)) return;
    const next = { ...store };
    delete next[userId];
    store = next;
    persist();
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  snapshot() {
    return store;
  },
};

export function usePreferences(userId: string | undefined): DietaryPreferences | null {
  const snap = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.snapshot,
    preferencesStore.snapshot,
  );
  if (!userId) return null;
  return snap[userId] ?? null;
}
