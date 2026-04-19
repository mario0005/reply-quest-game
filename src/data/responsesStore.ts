// Simple in-memory "database" for quiz responses.
// Persists to localStorage so data survives page refreshes,
// but lives as a plain module-level array at runtime (no backend).

export interface StoredResponse {
  id: string;
  playerName: string;
  playerSurname: string;
  questionId: string;
  questionPrompt: string;
  answer: string;
  correct: boolean;
  pointsEarned: number;
  answeredAt: string; // ISO timestamp
}

export interface StoredSession {
  id: string;
  playerName: string;
  playerSurname: string;
  score: number;
  correctCount: number;
  total: number;
  finishedAt: string;
}

const RESPONSES_KEY = "ttq.responses.v1";
const SESSIONS_KEY = "ttq.sessions.v1";

let responses: StoredResponse[] = load<StoredResponse>(RESPONSES_KEY);
let sessions: StoredSession[] = load<StoredSession>(SESSIONS_KEY);

type Listener = () => void;
const listeners = new Set<Listener>();

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // ignore quota errors
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const responsesStore = {
  addResponse(input: Omit<StoredResponse, "id" | "answeredAt">) {
    const entry: StoredResponse = {
      ...input,
      id: uid(),
      answeredAt: new Date().toISOString(),
    };
    responses = [entry, ...responses];
    persist();
    emit();
    return entry;
  },
  addSession(input: Omit<StoredSession, "id" | "finishedAt">) {
    const entry: StoredSession = {
      ...input,
      id: uid(),
      finishedAt: new Date().toISOString(),
    };
    sessions = [entry, ...sessions];
    persist();
    emit();
    return entry;
  },
  getResponses() {
    return responses;
  },
  getSessions() {
    return sessions;
  },
  clear() {
    responses = [];
    sessions = [];
    persist();
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
