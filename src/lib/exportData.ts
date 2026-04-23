import * as XLSX from "xlsx";
import type { StoredResponse, StoredSession } from "@/data/responsesStore";
import { authStore } from "@/data/authStore";
import { preferencesStore } from "@/data/preferencesStore";

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
        rank: 0,
        playerName: s.playerName,
        playerSurname: s.playerSurname,
        bestScore: s.score,
        bestCorrect: s.correctCount,
        bestTotal: s.total,
        rounds: 1,
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

function responsesAsRows(responses: StoredResponse[]) {
  return responses.map((r) => ({
    "Answered At": r.answeredAt,
    "First Name": r.playerName,
    Surname: r.playerSurname,
    Question: r.questionPrompt,
    Answer: r.answer,
    Correct: r.correct ? "Yes" : "No",
    "Points Earned": r.pointsEarned,
  }));
}

function sessionsAsRows(sessions: StoredSession[]) {
  return sessions.map((s) => ({
    "Finished At": s.finishedAt,
    "First Name": s.playerName,
    Surname: s.playerSurname,
    Score: s.score,
    "Correct Answers": s.correctCount,
    "Total Questions": s.total,
  }));
}

function leaderboardAsRows(sessions: StoredSession[]) {
  return buildLeaderboard(sessions).map((r) => ({
    Rank: r.rank,
    "First Name": r.playerName,
    Surname: r.playerSurname,
    "Best Score": r.bestScore,
    "Best Correct": r.bestCorrect,
    "Out Of": r.bestTotal,
    "Rounds Played": r.rounds,
  }));
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const ws = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(ws);
}

export function exportData(
  format: ExportFormat,
  responses: StoredResponse[],
  sessions: StoredSession[],
) {
  const ts = timestamp();

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(leaderboardAsRows(sessions)),
      "Leaderboard",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sessionsAsRows(sessions)),
      "Sessions",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(responsesAsRows(responses)),
      "Responses",
    );
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    triggerDownload(
      new Blob([out], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `parlour-quiz-export-${ts}.xlsx`,
    );
    return;
  }

  // CSV: produce a single combined CSV with section headers
  const parts: string[] = [];
  parts.push("=== LEADERBOARD ===");
  parts.push(toCSV(leaderboardAsRows(sessions)));
  parts.push("");
  parts.push("=== SESSIONS ===");
  parts.push(toCSV(sessionsAsRows(sessions)));
  parts.push("");
  parts.push("=== RESPONSES ===");
  parts.push(toCSV(responsesAsRows(responses)));
  const csv = parts.join("\n");
  triggerDownload(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `parlour-quiz-export-${ts}.csv`,
  );
}
