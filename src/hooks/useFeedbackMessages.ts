import { useSyncExternalStore } from "react";
import { feedbackStore } from "@/data/feedbackStore";

export function useFeedbackData() {
  return useSyncExternalStore(feedbackStore.subscribe, feedbackStore.get, feedbackStore.get);
}
