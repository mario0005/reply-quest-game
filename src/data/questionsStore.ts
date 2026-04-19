// In-memory questions store with localStorage persistence.
// Seeded from mockQuestions on first run; admin can edit/add/delete.

import { mockQuestions, type Question } from "./mockQuestions";

const KEY = "ttq.questions.v1";

let questions: Question[] = load();

type Listener = () => void;
const listeners = new Set<Listener>();

function load(): Question[] {
  if (typeof window === "undefined") return [...mockQuestions];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [...mockQuestions];
    const parsed = JSON.parse(raw) as Question[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...mockQuestions];
  } catch {
    return [...mockQuestions];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function uid() {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const questionsStore = {
  getAll(): Question[] {
    return questions;
  },
  update(id: string, patch: Partial<Question>) {
    questions = questions.map((q) => (q.id === id ? ({ ...q, ...patch } as Question) : q));
    persist();
    emit();
  },
  remove(id: string) {
    questions = questions.filter((q) => q.id !== id);
    persist();
    emit();
  },
  add(q: Omit<Question, "id"> & { id?: string }) {
    const entry = { ...q, id: q.id ?? uid() } as Question;
    questions = [...questions, entry];
    persist();
    emit();
  },
  resetToDefaults() {
    questions = [...mockQuestions];
    persist();
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
