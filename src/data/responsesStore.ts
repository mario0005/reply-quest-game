// Responses + game sessions backed by Supabase, with a sync cache so existing
// components keep working unchanged.

import { supabase } from "@/integrations/supabase/client";

export interface StoredResponse {
  id: string;
  playerName: string;
  playerSurname: string;
  questionId: string;
  questionPrompt: string;
  answer: string;
  correct: boolean;
  pointsEarned: number;
  answeredAt: string;
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

let responses: StoredResponse[] = [];
let sessions: StoredSession[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

async function loadResponses() {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .order("answered_at", { ascending: false });
  if (error) {
    // Non-admins can only see their own; that's fine.
    if (error.code !== "PGRST116") console.warn("loadResponses", error);
    responses = [];
    emit();
    return;
  }
  responses = (data ?? []).map((r) => ({
    id: r.id,
    playerName: r.player_name ?? "",
    playerSurname: r.player_surname ?? "",
    questionId: r.question_id ?? "",
    questionPrompt: r.question_prompt,
    answer: r.answer,
    correct: r.correct,
    pointsEarned: r.points_earned,
    answeredAt: r.answered_at,
  }));
  emit();
}

async function loadSessions() {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .order("finished_at", { ascending: false });
  if (error) {
    console.warn("loadSessions", error);
    sessions = [];
    emit();
    return;
  }
  sessions = (data ?? []).map((s) => ({
    id: s.id,
    playerName: s.player_name ?? "",
    playerSurname: s.player_surname ?? "",
    score: s.score,
    correctCount: s.correct_count,
    total: s.total,
    finishedAt: s.finished_at,
  }));
  emit();
}

export async function reloadAll() {
  await Promise.all([loadResponses(), loadSessions()]);
}

supabase.auth.onAuthStateChange(() => {
  setTimeout(reloadAll, 0);
});
reloadAll();

export const responsesStore = {
  async addResponse(input: Omit<StoredResponse, "id" | "answeredAt">) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return null;
    const { error } = await supabase.from("responses").insert({
      user_id: userId,
      question_id: input.questionId || null,
      question_prompt: input.questionPrompt,
      answer: input.answer,
      correct: input.correct,
      points_earned: input.pointsEarned,
      player_name: input.playerName,
      player_surname: input.playerSurname,
    });
    if (error) console.error("addResponse", error);
    await loadResponses();
  },
  async addSession(input: Omit<StoredSession, "id" | "finishedAt">) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return null;
    const { error } = await supabase.from("game_sessions").insert({
      user_id: userId,
      score: input.score,
      correct_count: input.correctCount,
      total: input.total,
      player_name: input.playerName,
      player_surname: input.playerSurname,
    });
    if (error) console.error("addSession", error);
    await loadSessions();
  },
  getResponses() {
    return responses;
  },
  getSessions() {
    return sessions;
  },
  async clear() {
    // Admin only (RLS enforces).
    await supabase.from("responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("game_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await reloadAll();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
