// In-memory user accounts + session, persisted to localStorage.
// NOTE: passwords are stored in plaintext for demo purposes only.
// Replace with Lovable Cloud auth before going to production.

export interface Account {
  id: string;
  email: string; // lowercased
  name: string;
  surname: string;
  password: string; // demo only
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  surname: string;
}

const ACCOUNTS_KEY = "ttq.accounts.v1";
const SESSION_KEY = "ttq.session.v1";

let accounts: Account[] = load<Account[]>(ACCOUNTS_KEY, []);
let session: SessionUser | null = load<SessionUser | null>(SESSION_KEY, null);

type Listener = () => void;
const listeners = new Set<Listener>();

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const authStore = {
  signUp(input: { email: string; password: string; name: string; surname: string }):
    | { ok: true; user: SessionUser }
    | { ok: false; error: string } {
    const email = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.email === email)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const acc: Account = {
      id: uid(),
      email,
      name: input.name.trim(),
      surname: input.surname.trim(),
      password: input.password,
      createdAt: new Date().toISOString(),
    };
    accounts = [acc, ...accounts];
    session = { id: acc.id, email: acc.email, name: acc.name, surname: acc.surname };
    persist();
    emit();
    return { ok: true, user: session };
  },

  signIn(input: { email: string; password: string }):
    | { ok: true; user: SessionUser }
    | { ok: false; error: string } {
    const email = input.email.trim().toLowerCase();
    const acc = accounts.find((a) => a.email === email);
    if (!acc || acc.password !== input.password) {
      return { ok: false, error: "Invalid email or password." };
    }
    session = { id: acc.id, email: acc.email, name: acc.name, surname: acc.surname };
    persist();
    emit();
    return { ok: true, user: session };
  },

  signOut() {
    session = null;
    persist();
    emit();
  },

  getSession() {
    return session;
  },

  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
