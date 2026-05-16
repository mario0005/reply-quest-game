// Supabase-backed auth store. Keeps the same external API as before so
// existing components don't need to change. Session reflects the currently
// signed-in Supabase user plus their profile row.

import { supabase } from "@/integrations/supabase/client";

export interface SessionUser {
  id: string;
  name: string;
  surname: string;
  email?: string;
}

let session: SessionUser | null = null;
let adminFlag = false;
let initialized = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

async function refreshFromSupabaseUser(userId: string | null, email: string | null) {
  if (!userId) {
    session = null;
    adminFlag = false;
    emit();
    return;
  }
  // Fetch profile + role in parallel.
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("name, surname, email").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  session = {
    id: userId,
    name: profile?.name ?? "",
    surname: profile?.surname ?? "",
    email: profile?.email ?? email ?? undefined,
  };
  adminFlag = !!roles?.some((r) => r.role === "admin");
  emit();
}

function init() {
  if (initialized) return;
  initialized = true;
  supabase.auth.onAuthStateChange((_event, sess) => {
    // Defer DB calls so we don't deadlock the auth callback.
    setTimeout(() => {
      refreshFromSupabaseUser(sess?.user?.id ?? null, sess?.user?.email ?? null);
    }, 0);
  });
  supabase.auth.getSession().then(({ data }) => {
    refreshFromSupabaseUser(data.session?.user?.id ?? null, data.session?.user?.email ?? null);
  });
}
init();

export function isAdmin(_user: SessionUser | null): boolean {
  return adminFlag;
}

export const authStore = {
  async signUp(input: { name: string; surname: string; email?: string; password?: string }) {
    const email = (input.email ?? "").trim().toLowerCase();
    const password = input.password ?? "";
    if (!email || !password) {
      return { ok: false as const, error: "Email and password are required to sign up." };
    }
    const redirectTo = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name: input.name.trim(), surname: input.surname.trim() },
      },
    });
    if (error) return { ok: false as const, error: error.message };
    if (!data.user) return { ok: false as const, error: "Sign-up failed. Please try again." };
    const user: SessionUser = {
      id: data.user.id,
      name: input.name.trim(),
      surname: input.surname.trim(),
      email,
    };
    return { ok: true as const, user };
  },

  async signIn(input: { name?: string; surname?: string; email?: string; password?: string }) {
    const email = (input.email ?? "").trim().toLowerCase();
    const password = input.password ?? "";
    if (!email || !password) {
      return { ok: false as const, error: "Email and password are required." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false as const, error: error.message };
    if (!data.user) return { ok: false as const, error: "Sign-in failed." };
    await refreshFromSupabaseUser(data.user.id, data.user.email ?? null);
    return { ok: true as const, user: session! };
  },

  async signOut() {
    await supabase.auth.signOut();
    session = null;
    adminFlag = false;
    emit();
  },

  async updateProfile(input: { email?: string; password?: string; name?: string; surname?: string }) {
    if (!session) return { ok: false as const, error: "Not signed in." };
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.surname !== undefined) patch.surname = input.surname.trim();
    if (input.email !== undefined && input.email.trim()) patch.email = input.email.trim().toLowerCase();
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("profiles").update(patch).eq("id", session.id);
      if (error) return { ok: false as const, error: error.message };
    }
    if (input.password && input.password.trim()) {
      const { error } = await supabase.auth.updateUser({ password: input.password });
      if (error) return { ok: false as const, error: error.message };
    }
    await refreshFromSupabaseUser(session.id, session.email ?? null);
    return { ok: true as const, user: session! };
  },

  async deleteCurrentAccount() {
    // True deletion requires admin/service key; sign out instead and warn the caller.
    if (!session) return { ok: false as const, error: "Not signed in." };
    await supabase.auth.signOut();
    session = null;
    adminFlag = false;
    emit();
    return { ok: true as const };
  },

  getSession() {
    return session;
  },

  // Kept for compatibility with the previous in-memory API. Returns empty —
  // the export pipeline now fetches profiles directly from the database.
  listAccounts(): Array<{ id: string; name: string; surname: string; email?: string; createdAt: string }> {
    return [];
  },

  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
