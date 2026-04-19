import { useSyncExternalStore } from "react";
import { authStore } from "@/data/authStore";

export function useAuth() {
  const user = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSession,
    authStore.getSession,
  );
  return { user, signIn: authStore.signIn, signUp: authStore.signUp, signOut: authStore.signOut };
}
