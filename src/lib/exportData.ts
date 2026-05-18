import ExcelJS from "exceljs";
import type { StoredResponse, StoredSession } from "@/data/responsesStore";
import { supabase } from "@/integrations/supabase/client";

export type ExportFormat = "csv" | "xlsx";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

interface LeaderboardRow {
  rank: number;
  playerName: string;
  playerSurname: string;
  bestScore: number;
  bestCorrect: number;
  bestTotal: number;
  rounds: number;
}

function buildLeaderboard(sessions: StoredSession[]): LeaderboardRow[] {
  const byPlayer = new Map<string, LeaderboardRow>();
  sessions.forEach((s) => {
    const key = `${s.playerName}|${s.playerSurname}`;
    const existing = byPlayer.get(key);
    if (!existing) {
      byPlayer.set(key, {
        rank: 0, playerName: s.playerName, playerSurname: s.playerSurname,
        bestScore: s.score, bestCorrect: s.correctCount, bestTotal: s.total, rounds: 1,
      });
    } else {
      existing.rounds += 1;
      if (s.score > existing.bestScore) {
        existing.bestScore = s.score;
        existing.bestCorrect = s.correctCount;
        existing.bestTotal = s.total;
      }
    }
  });
  const rows = Array.from(byPlayer.values()).sort((a, b) => b.bestScore - a.bestScore);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

const responsesAsRows = (responses: StoredResponse[]) => responses.map((r) => ({
  "Answered At": r.answeredAt,
  "First Name": r.playerName,
  Surname: r.playerSurname,
  Question: r.questionPrompt,
  Answer: r.answer,
  Correct: r.correct ? "Yes" : "No",
  "Points Earned": r.pointsEarned,
}));

const sessionsAsRows = (sessions: StoredSession[]) => sessions.map((s) => ({
  "Finished At": s.finishedAt,
  "First Name": s.playerName,
  Surname: s.playerSurname,
  Score: s.score,
  "Correct Answers": s.correctCount,
  "Total Questions": s.total,
}));

const leaderboardAsRows = (sessions: StoredSession[]) => buildLeaderboard(sessions).map((r) => ({
  Rank: r.rank,
  "First Name": r.playerName,
  Surname: r.playerSurname,
  "Best Score": r.bestScore,
  "Best Correct": r.bestCorrect,
  "Out Of": r.bestTotal,
  "Rounds Played": r.rounds,
}));

async function preferencesAsRows() {
  const [{ data: profiles }, { data: prefs }] = await Promise.all([
    supabase.from("profiles").select("id, name, surname, email, created_at"),
    supabase.from("dietary_preferences").select("*"),
  ]);
  const prefsById = new Map<string, Record<string, unknown>>();
  for (const p of prefs ?? []) prefsById.set(p.user_id as string, p as unknown as Record<string, unknown>);
  return (profiles ?? []).map((a) => {
    const p = prefsById.get(a.id as string);
    return {
      "First Name": a.name ?? "",
      Surname: a.surname ?? "",
      Email: a.email ?? "",
      "Created At": a.created_at ?? "",
      Diet: (p?.diet as string) ?? "",
      "Spice Level": (p?.spice as string) ?? "",
      Allergies: (p?.allergies as string) ?? "",
      Dislikes: (p?.dislikes as string) ?? "",
      "Favorite Dishes": Array.isArray(p?.favorite_dishes) ? (p!.favorite_dishes as string[]).join(", ") : "",
    };
  });
}

function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCSVCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCSVCell(row[h])).join(","));
  }
  return lines.join("\n");
}

function addSheet(wb: ExcelJS.Workbook, name: string, rows: Record<string, unknown>[]) {
  const ws = wb.addWorksheet(name);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  ws.columns = headers.map((h) => ({ header: h, key: h }));
  rows.forEach((r) => ws.addRow(r));
}

export async function exportData(
  format: ExportFormat,
  responses: StoredResponse[],
  sessions: StoredSession[],
) {
  const ts = timestamp();
  const prefsRows = await preferencesAsRows();

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    addSheet(wb, "Leaderboard", leaderboardAsRows(sessions));
    addSheet(wb, "Sessions", sessionsAsRows(sessions));
    addSheet(wb, "Responses", responsesAsRows(responses));
    addSheet(wb, "Dietary Preferences", prefsRows);
    const buf = await wb.xlsx.writeBuffer();
    triggerDownload(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `parlour-quiz-export-${ts}.xlsx`,
    );
    return;
  }

  const parts: string[] = [];
  parts.push("=== LEADERBOARD ===", toCSV(leaderboardAsRows(sessions)), "");
  parts.push("=== SESSIONS ===", toCSV(sessionsAsRows(sessions)), "");
  parts.push("=== RESPONSES ===", toCSV(responsesAsRows(responses)), "");
  parts.push("=== DIETARY PREFERENCES ===", toCSV(prefsRows));
  triggerDownload(
    new Blob([parts.join("\n")], { type: "text/csv;charset=utf-8" }),
    `parlour-quiz-export-${ts}.csv`,
  );
}
