// Per-user dietary preferences, backed by Supabase with a sync cache.
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "other";
export type SpiceLevel = "none" | "mild" | "medium" | "hot";

export type FavoriteDish =
  | "pizza" | "pasta" | "sushi" | "burger" | "salad" | "tacos" | "ramen" | "curry"
  | "steak" | "risotto" | "dumplings" | "sandwich" | "soup" | "bbq" | "seafood" | "dessert";

export const FAVORITE_DISHES: FavoriteDish[] = [
  "pizza", "pasta", "sushi", "burger", "salad", "tacos", "ramen", "curry",
  "steak", "risotto", "dumplings", "sandwich", "soup", "bbq", "seafood", "dessert",
];

export const MAX_FAVORITE_DISHES = 5;

export interface DietaryPreferences {
  diet: DietType;
  allergies: string;
  spice: SpiceLevel;
  dislikes: string;
  favoriteDishes: FavoriteDish[];
}

export const defaultPreferences: DietaryPreferences = {
  diet: "omnivore",
  allergies: "",
  spice: "medium",
  dislikes: "",
  favoriteDishes: [],
};

type Store = Record<string, DietaryPreferences>;

let store: Store = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function normalize(row: {
  user_id: string;
  diet: string;
  allergies: string;
  spice: string;
  dislikes: string;
  favorite_dishes: unknown;
}): DietaryPreferences {
  return {
    diet: (row.diet as DietType) ?? "omnivore",
    allergies: row.allergies ?? "",
    spice: (row.spice as SpiceLevel) ?? "medium",
    dislikes: row.dislikes ?? "",
    favoriteDishes: Array.isArray(row.favorite_dishes)
      ? (row.favorite_dishes as FavoriteDish[])
      : [],
  };
}

async function loadMine() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    store = {};
    emit();
    return;
  }
  const { data, error } = await supabase
    .from("dietary_preferences")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) {
    console.warn("loadPrefs", error);
    return;
  }
  if (data) {
    store = { ...store, [auth.user.id]: normalize(data) };
  } else {
    const next = { ...store };
    delete next[auth.user.id];
    store = next;
  }
  emit();
}

async function loadAll() {
  // Admin only (RLS); falls back to "just mine" otherwise.
  const { data } = await supabase.from("dietary_preferences").select("*");
  if (data) {
    const next: Store = {};
    for (const row of data) next[row.user_id] = normalize(row);
    store = next;
    emit();
  } else {
    await loadMine();
  }
}

supabase.auth.onAuthStateChange(() => {
  setTimeout(loadAll, 0);
});
loadAll();

export const preferencesStore = {
  get(userId: string): DietaryPreferences | null {
    return store[userId] ?? null;
  },
  async set(userId: string, prefs: DietaryPreferences) {
    store = { ...store, [userId]: prefs };
    emit();
    const { error } = await supabase.from("dietary_preferences").upsert({
      user_id: userId,
      diet: prefs.diet,
      allergies: prefs.allergies,
      spice: prefs.spice,
      dislikes: prefs.dislikes,
      favorite_dishes: prefs.favoriteDishes,
    });
    if (error) console.error("savePrefs", error);
  },
  async remove(userId: string) {
    const next = { ...store };
    delete next[userId];
    store = next;
    emit();
    await supabase.from("dietary_preferences").delete().eq("user_id", userId);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  snapshot() {
    return store;
  },
  reload: loadAll,
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
