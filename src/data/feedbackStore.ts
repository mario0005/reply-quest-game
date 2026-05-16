// Bilingual feedback messages, backed by Supabase. Sync cache for consumers.

import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "@/i18n/translations";

export interface FeedbackMessages {
  wellPlayed: string;
  betterLuck: string;
  noPoints: string;
}

export type FeedbackData = Record<Lang, FeedbackMessages>;

const defaults: FeedbackData = {
  en: { wellPlayed: "Well played.", betterLuck: "Better luck on the next card.", noPoints: "No points" },
  it: { wellPlayed: "Ben giocato.", betterLuck: "Sarà meglio alla prossima carta.", noPoints: "Nessun punto" },
};

let data: FeedbackData = { en: { ...defaults.en }, it: { ...defaults.it } };

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  const { data: rows, error } = await supabase.from("feedback_messages").select("*");
  if (error) {
    console.warn("loadFeedback", error);
    return;
  }
  const next: FeedbackData = { en: { ...defaults.en }, it: { ...defaults.it } };
  for (const r of rows ?? []) {
    const lang = r.lang as Lang;
    if (lang === "en" || lang === "it") {
      next[lang] = {
        wellPlayed: r.well_played ?? defaults[lang].wellPlayed,
        betterLuck: r.better_luck ?? defaults[lang].betterLuck,
        noPoints: r.no_points ?? defaults[lang].noPoints,
      };
    }
  }
  data = next;
  emit();
}

supabase.auth.onAuthStateChange(() => {
  setTimeout(load, 0);
});
load();

export const feedbackStore = {
  get(): FeedbackData {
    return data;
  },
  getFor(lang: Lang): FeedbackMessages {
    return data[lang];
  },
  async update(lang: Lang, patch: Partial<FeedbackMessages>) {
    data = { ...data, [lang]: { ...data[lang], ...patch } };
    emit();
    const merged = data[lang];
    const { error } = await supabase.from("feedback_messages").upsert({
      lang,
      well_played: merged.wellPlayed,
      better_luck: merged.betterLuck,
      no_points: merged.noPoints,
    });
    if (error) console.error("updateFeedback", error);
  },
  async resetToDefaults() {
    for (const lang of ["en", "it"] as Lang[]) {
      const m = defaults[lang];
      await supabase.from("feedback_messages").upsert({
        lang,
        well_played: m.wellPlayed,
        better_luck: m.betterLuck,
        no_points: m.noPoints,
      });
    }
    await load();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
