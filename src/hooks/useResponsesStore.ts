import { useSyncExternalStore } from "react";
import { responsesStore } from "@/data/responsesStore";

export function useResponses() {
  return useSyncExternalStore(
    responsesStore.subscribe,
    responsesStore.getResponses,
    responsesStore.getResponses,
  );
}

export function useSessions() {
  return useSyncExternalStore(
    responsesStore.subscribe,
    responsesStore.getSessions,
    responsesStore.getSessions,
  );
}
