import { useSyncExternalStore } from "react";
import { questionsStore } from "@/data/questionsStore";

export function useQuestions() {
  return useSyncExternalStore(
    questionsStore.subscribe,
    questionsStore.getAll,
    questionsStore.getAll,
  );
}
