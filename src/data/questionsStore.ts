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

function questionToLegacyRow(q: Partial<Question> & { type?: Question["type"] }) {
  const type = q.type ?? "multiple_choice";
  const row: Record<string, unknown> = {};
  if (q.prompt !== undefined) {
    row.prompt_en = q.prompt;
    row.prompt_it = q.prompt;
  }
  if (q.points !== undefined) row.points = q.points;
  if (q.type) row.category = q.type;
  if ("options" in q) {
    const options = (q as { options?: string[] }).options ?? [];
    row.options_en = options;
    row.options_it = options;
  }
  if ("acceptedAnswers" in q) {
    const accepted = (q as { acceptedAnswers?: string[] }).acceptedAnswers ?? [];
    row.options_en = accepted;
    row.options_it = accepted;
  }
  if ("correctIndex" in q) row.correct_index = (q as { correctIndex?: number }).correctIndex ?? null;
  if ("correct" in q) row.correct_index = (q as { correct?: boolean }).correct ? 1 : 0;
  if (!q.type && type === "multiple_choice" && !("correctIndex" in q) && !("correct" in q)) row.category = type;
  return row;
}

function getMissingColumn(error: { message?: string }) {
  return error.message?.match(/'([^']+)' column/)?.[1];
}

function shapeFromMissingColumn(column?: string): QuestionTableShape | null {
  if (!column) return null;
  if (["prompt", "options", "correct_bool", "accepted_answers", "feedback_correct", "feedback_wrong", "type"].includes(column)) {
    return "legacy";
  }
  if (["prompt_en", "prompt_it", "options_en", "options_it", "category"].includes(column)) return "modern";
  return null;
}

async function writeQuestion(
  action: "insert" | "update",
  q: Partial<Question> & { type?: Question["type"] },
  id?: string,
) {
  const shapes: QuestionTableShape[] = tableShape ? [tableShape] : ["modern", "legacy"];
  let lastError: unknown = null;

  for (const shape of shapes) {
    const row = shape === "modern" ? questionToRow(q) : questionToLegacyRow(q);
    if (q.type) {
      if (shape === "modern") row.type = q.type;
      else row.category = q.type;
    }
    const query = action === "insert"
      ? supabase.from("questions").insert(row)
      : supabase.from("questions").update(row).eq("id", id!);
    const { error } = await query;
    if (!error) {
      tableShape = shape;
      return;
    }
    lastError = error;
    if (!isMissingColumnError(error)) break;
    tableShape = shapeFromMissingColumn(getMissingColumn(error));
    if (tableShape && !shapes.includes(tableShape)) {
      const retryRow = tableShape === "modern" ? questionToRow(q) : questionToLegacyRow(q);
      if (q.type) {
        if (tableShape === "modern") retryRow.type = q.type;
        else retryRow.category = q.type;
      }
      const retryQuery = action === "insert"
        ? supabase.from("questions").insert(retryRow)
        : supabase.from("questions").update(retryRow).eq("id", id!);
      const retry = await retryQuery;
      if (!retry.error) return;
      lastError = retry.error;
    }
  }

  throw lastError;
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
