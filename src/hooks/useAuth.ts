import { useSyncExternalStore } from "react";
import { authStore, isAdmin } from "@/data/authStore";

export function useAuth() {
  const user = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSession,
    authStore.getSession,
  );
  return {
    user,
    isAdmin: isAdmin(user),
    signIn: authStore.signIn,
    signUp: authStore.signUp,
    signOut: authStore.signOut,
    updateProfile: authStore.updateProfile,
    deleteCurrentAccount: authStore.deleteCurrentAccount,
  };
}
