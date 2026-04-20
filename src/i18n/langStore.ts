import type { Lang } from "./translations";

const KEY = "ttq.lang.v1";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "en" || stored === "it") return stored;
  } catch {
    // ignore
  }
  const nav = typeof navigator !== "undefined" ? navigator.language || "" : "";
  return nav.toLowerCase().startsWith("it") ? "it" : "en";
}

let lang: Lang = detectInitial();

type Listener = () => void;
const listeners = new Set<Listener>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  } catch {
    // ignore
  }
}

if (typeof document !== "undefined") {
  document.documentElement.lang = lang;
}

export const langStore = {
  get(): Lang {
    return lang;
  },
  set(next: Lang) {
    if (next === lang) return;
    lang = next;
    persist();
    listeners.forEach((l) => l());
  },
  toggle() {
    this.set(lang === "en" ? "it" : "en");
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
