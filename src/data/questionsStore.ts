// Questions store backed by Supabase. Keeps a sync in-memory cache so
// useSyncExternalStore consumers don't need to change.

import { supabase } from "@/integrations/supabase/client";
import type { Question } from "./mockQuestions";

let questions: Question[] = [];
let loaded = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

interface Row {
  id: string;
  type?: string | null;
  prompt: string | null;
  prompt_en: string | null;
  prompt_it?: string | null;
  category?: string | null;
  options: unknown;
  options_en?: unknown;
  options_it?: unknown;
  correct_index: number | null;
  correct_bool?: boolean | null;
  accepted_answers?: unknown;
  points: number;
  feedback_correct?: string | null;
  feedback_wrong?: string | null;
  created_at: string;
}

type QuestionTableShape = "modern" | "legacy";

let tableShape: QuestionTableShape | null = null;

function getQuestionType(r: Row): Question["type"] {
  const value = r.type ?? r.category;
  if (value === "true_false" || value === "text" || value === "multiple_choice") return value;
  return "multiple_choice";
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return error.code === "PGRST204" || /Could not find the '.+' column/i.test(error.message ?? "");
}

function rowToQuestion(r: Row): Question | null {
  const type = getQuestionType(r);
  const prompt = r.prompt ?? r.prompt_en ?? r.prompt_it ?? "";
  const feedback =
    r.feedback_correct || r.feedback_wrong
      ? { correct: r.feedback_correct ?? undefined, wrong: r.feedback_wrong ?? undefined }
      : undefined;
  const opts = toStringArray(r.options).length ? toStringArray(r.options) : toStringArray(r.options_en ?? r.options_it);
  const accepted = toStringArray(r.accepted_answers).length ? toStringArray(r.accepted_answers) : toStringArray(r.options_en);
  if (type === "multiple_choice") {
    return {
      id: r.id,
      type: "multiple_choice",
      prompt,
      options: opts,
      correctIndex: r.correct_index ?? 0,
      points: r.points,
      feedback,
    };
  }
  if (type === "true_false") {
    return {
      id: r.id,
      type: "true_false",
      prompt,
      correct: r.correct_bool ?? r.correct_index === 1,
      points: r.points,
      feedback,
    };
  }
  if (type === "text") {
    return {
      id: r.id,
      type: "text",
      prompt,
      acceptedAnswers: accepted,
      points: r.points,
      feedback,
    };
  }
  return null;
}

function questionToRow(q: Partial<Question> & { type?: Question["type"] }) {
  const row: Record<string, unknown> = {};
  if (q.prompt !== undefined) row.prompt = q.prompt;
  if (q.points !== undefined) row.points = q.points;
  if (q.feedback !== undefined) {
    row.feedback_correct = q.feedback?.correct ?? null;
    row.feedback_wrong = q.feedback?.wrong ?? null;
  }
  if (q.type) row.type = q.type;
  if ("options" in q) row.options = (q as { options?: string[] }).options ?? [];
  if ("correctIndex" in q) row.correct_index = (q as { correctIndex?: number }).correctIndex ?? null;
  if ("correct" in q) row.correct_bool = (q as { correct?: boolean }).correct ?? null;
  if ("acceptedAnswers" in q)
    row.accepted_answers = (q as { acceptedAnswers?: string[] }).acceptedAnswers ?? [];
  return row;
}

export async function loadQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to load questions", error);
    return;
  }
  questions = (data ?? [])
    .map((r) => rowToQuestion(r as unknown as Row))
    .filter((q): q is Question => q !== null);
  loaded = true;
  emit();
}
// Initial load (best-effort, RLS requires auth).
loadQuestions();

export const questionsStore = {
  getAll(): Question[] {
    if (!loaded) loadQuestions();
    return questions;
  },
  async update(id: string, patch: Partial<Question>) {
    const { error } = await supabase.from("questions").update(questionToRow(patch)).eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    await loadQuestions();
  },
  async remove(id: string) {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    await loadQuestions();
  },
  async add(q: Omit<Question, "id"> & { id?: string }) {
    const row = questionToRow(q as Partial<Question>);
    row.type = q.type;
    const { error } = await supabase.from("questions").insert(row);
    if (error) {
      console.error("questions.add failed", error);
      throw error;
    }
    await loadQuestions();
  },
  async resetToDefaults() {
    const { error } = await supabase.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error("questions.reset failed", error);
      throw error;
    }
    await loadQuestions();
  },
  reload: loadQuestions,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

// Reload whenever auth state changes (so RLS-gated reads succeed after sign-in).
supabase.auth.onAuthStateChange(() => {
  setTimeout(() => loadQuestions(), 0);
});
