import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useSessions } from "@/hooks/useResponsesStore";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

const Leaderboard = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const sessions = useSessions();

  // Sort by score descending, then by correct count
  const sortedSessions = [...sessions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.correctCount - a.correctCount;
  });

  // Get unique best score per player
  const playerBestScores = new Map<string, typeof sortedSessions[0]>();
  sortedSessions.forEach((session) => {
    const key = `${session.playerName}|${session.playerSurname}`;
    if (!playerBestScores.has(key)) {
      playerBestScores.set(key, session);
    }
  });

  const leaderboardEntries = Array.from(playerBestScores.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.correctCount - a.correctCount;
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-mustard" />;
    if (index === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (index === 2) return <Award className="h-5 w-5 text-accent" />;
    return <span className="font-serif text-lg font-bold text-muted-foreground">{index + 1}</span>;
  };

  const isCurrentUser = (session: typeof leaderboardEntries[0]) => {
    if (!user) return false;
    return user.name === session.playerName && user.surname === session.playerSurname;
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 text-center">
          <Stamp tone="mustard" className="mb-4">Rankings</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">Leaderboard</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            The best scores from every player who has taken the challenge.
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-sm underline underline-offset-4">
            ← Back to game
          </Link>
          {user && (
            <span className="font-body text-sm text-muted-foreground">
              Playing as <span className="font-semibold">{user.name} {user.surname}</span>
            </span>
          )}
        </div>

        <section className="paper-card p-6">
          {leaderboardEntries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-body text-muted-foreground">No scores yet.</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Be the first to play and claim the top spot!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {leaderboardEntries.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border-2 px-4 py-3 transition-colors",
                    isCurrentUser(entry)
                      ? "border-mustard bg-mustard/10"
                      : "border-transparent bg-paper-deep/40 hover:bg-paper-deep/60",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif font-semibold">
                      {entry.playerName} {entry.playerSurname}
                      {isCurrentUser(entry) && (
                        <span className="ml-2 font-body text-xs text-mustard">(You)</span>
                      )}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {entry.correctCount}/{entry.total} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-bold">{entry.score}</p>
                    <p className="font-body text-xs text-muted-foreground">pts</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {user && !isAdmin && (
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-body text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Play again
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Leaderboard;
