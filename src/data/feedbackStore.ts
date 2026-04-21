// Editable bilingual feedback messages shown after answering a question.
// Persisted to localStorage so admins can customize them.

import type { Lang } from "@/i18n/translations";

export interface FeedbackMessages {
  wellPlayed: string;
  betterLuck: string;
  noPoints: string;
}

export type FeedbackData = Record<Lang, FeedbackMessages>;

const KEY = "ttq.feedback.v1";

const defaults: FeedbackData = {
  en: {
    wellPlayed: "Well played.",
    betterLuck: "Better luck on the next card.",
    noPoints: "No points",
  },
  it: {
    wellPlayed: "Ben giocato.",
    betterLuck: "Sarà meglio alla prossima carta.",
    noPoints: "Nessun punto",
  },
};

let data: FeedbackData = load();

type Listener = () => void;
const listeners = new Set<Listener>();

function load(): FeedbackData {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { en: { ...defaults.en }, it: { ...defaults.it } };
    const parsed = JSON.parse(raw) as Partial<FeedbackData>;
    return {
      en: { ...defaults.en, ...(parsed.en ?? {}) },
      it: { ...defaults.it, ...(parsed.it ?? {}) },
    };
  } catch {
    return { en: { ...defaults.en }, it: { ...defaults.it } };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const feedbackStore = {
  get(): FeedbackData {
    return data;
  },
  getFor(lang: Lang): FeedbackMessages {
    return data[lang];
  },
  update(lang: Lang, patch: Partial<FeedbackMessages>) {
    data = { ...data, [lang]: { ...data[lang], ...patch } };
    persist();
    emit();
  },
  resetToDefaults() {
    data = { en: { ...defaults.en }, it: { ...defaults.it } };
    persist();
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
