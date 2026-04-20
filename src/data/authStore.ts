// In-memory user accounts + session, persisted to localStorage.
// NOTE: demo-only. Accounts are keyed by name+surname (case-insensitive).
// Email and password are optional and not verified.

export interface Account {
  id: string;
  key: string; // `${name}|${surname}` lowercased — unique
  name: string;
  surname: string;
  email?: string;
  password?: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  surname: string;
  email?: string;
}

const ACCOUNTS_KEY = "ttq.accounts.v1";
const SESSION_KEY = "ttq.session.v1";

let accounts: Account[] = load<Account[]>(ACCOUNTS_KEY, []);
let session: SessionUser | null = load<SessionUser | null>(SESSION_KEY, null);

// Seed the built-in admin account (name "admin" / surname "admin", password "admin").
(function seedAdmin() {
  const adminKey = "admin|admin";
  if (!accounts.some((a) => a.key === adminKey)) {
    accounts = [
      {
        id: "admin",
        key: adminKey,
        name: "admin",
        surname: "admin",
        password: "admin",
        createdAt: new Date().toISOString(),
      },
      ...accounts,
    ];
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch {
        // ignore
      }
    }
  }
})();

export function isAdmin(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.name.trim().toLowerCase() === "admin" && user.surname.trim().toLowerCase() === "admin";
}

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

function makeKey(name: string, surname: string) {
  return `${name.trim().toLowerCase()}|${surname.trim().toLowerCase()}`;
}

function toSession(acc: Account): SessionUser {
  return { id: acc.id, name: acc.name, surname: acc.surname, email: acc.email };
}

export const authStore = {
  signUp(input: { name: string; surname: string; email?: string; password?: string }):
    | { ok: true; user: SessionUser }
    | { ok: false; error: string } {
    const name = input.name.trim();
    const surname = input.surname.trim();
    if (!name || !surname) return { ok: false, error: "Name and surname are required." };
    const key = makeKey(name, surname);
    if (key === "admin|admin") {
      return { ok: false, error: "That name is reserved. Please sign in instead." };
    }
    if (accounts.some((a) => a.key === key)) {
      return { ok: false, error: "An account with that name already exists. Try signing in." };
    }
    const acc: Account = {
      id: uid(),
      key,
      name,
      surname,
      email: input.email?.trim() ? input.email.trim().toLowerCase() : undefined,
      password: input.password?.trim() ? input.password : undefined,
      createdAt: new Date().toISOString(),
    };
    accounts = [acc, ...accounts];
    session = toSession(acc);
    persist();
    emit();
    return { ok: true, user: session };
  },

  signIn(input: { name: string; surname: string; password?: string }):
    | { ok: true; user: SessionUser }
    | { ok: false; error: string } {
    const name = input.name.trim();
    const surname = input.surname.trim();
    if (!name || !surname) return { ok: false, error: "Name and surname are required." };
    const key = makeKey(name, surname);
    const acc = accounts.find((a) => a.key === key);
    if (!acc) return { ok: false, error: "No account found. Try signing up first." };
    // If the account has a password set, require it to match.
    if (acc.password && acc.password !== (input.password ?? "")) {
      return { ok: false, error: "Incorrect password." };
    }
    session = toSession(acc);
    persist();
    emit();
    return { ok: true, user: session };
  },

  signOut() {
    session = null;
    persist();
    emit();
  },

  updateProfile(input: { email?: string; password?: string }):
    | { ok: true; user: SessionUser }
    | { ok: false; error: string } {
    if (!session) return { ok: false, error: "Not signed in." };
    const idx = accounts.findIndex((a) => a.id === session!.id);
    if (idx === -1) return { ok: false, error: "Account not found." };
    const acc = accounts[idx];
    const updated: Account = {
      ...acc,
      email: input.email && input.email.trim() ? input.email.trim().toLowerCase() : undefined,
      password: input.password && input.password.trim() ? input.password : acc.password,
    };
    accounts = [...accounts.slice(0, idx), updated, ...accounts.slice(idx + 1)];
    session = toSession(updated);
    persist();
    emit();
    return { ok: true, user: session };
  },

  clearPassword(): { ok: true } | { ok: false; error: string } {
    if (!session) return { ok: false, error: "Not signed in." };
    const idx = accounts.findIndex((a) => a.id === session!.id);
    if (idx === -1) return { ok: false, error: "Account not found." };
    accounts = [
      ...accounts.slice(0, idx),
      { ...accounts[idx], password: undefined },
      ...accounts.slice(idx + 1),
    ];
    persist();
    emit();
    return { ok: true };
  },

  deleteCurrentAccount(): { ok: true } | { ok: false; error: string } {
    if (!session) return { ok: false, error: "Not signed in." };
    if (session.name.trim().toLowerCase() === "admin" && session.surname.trim().toLowerCase() === "admin") {
      return { ok: false, error: "The admin account cannot be deleted." };
    }
    accounts = accounts.filter((a) => a.id !== session!.id);
    session = null;
    persist();
    emit();
    return { ok: true };
  },

  getSession() {
    return session;
  },

  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
