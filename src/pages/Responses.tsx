import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { Button } from "@/components/ui/button";
import { useResponses, useSessions } from "@/hooks/useResponsesStore";
import { responsesStore } from "@/data/responsesStore";
import { cn } from "@/lib/utils";

const Responses = () => {
  const responses = useResponses();
  const sessions = useSessions();

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 text-center">
          <Stamp tone="moss" className="mb-4">Ledger</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">Saved Responses</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            An in-memory ledger of every answer played on this device.
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-sm underline underline-offset-4">
            ← Back to game
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Clear all stored responses?")) responsesStore.clear();
            }}
          >
            Clear ledger
          </Button>
        </div>

        <section className="paper-card mb-8 p-6">
          <h2 className="font-serif text-xl font-bold">Sessions ({sessions.length})</h2>
          <div className="ink-rule my-4" />
          {sessions.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No completed rounds yet.</p>
          ) : (
            <ul className="grid gap-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border-2 bg-paper-deep/40 px-4 py-3 font-body text-sm"
                >
                  <span className="font-semibold">
                    {s.playerName} {s.playerSurname}
                  </span>
                  <span className="text-muted-foreground">
                    {s.correctCount}/{s.total} correct · {s.score} pts ·{" "}
                    {new Date(s.finishedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="paper-card p-6">
          <h2 className="font-serif text-xl font-bold">Answers ({responses.length})</h2>
          <div className="ink-rule my-4" />
          {responses.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No answers recorded yet.</p>
          ) : (
            <ul className="grid gap-3">
              {responses.map((r) => (
                <li key={r.id} className="rounded-md border-2 bg-paper-deep/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-serif text-xs uppercase tracking-widest text-muted-foreground">
                      {r.playerName} {r.playerSurname} ·{" "}
                      {new Date(r.answeredAt).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "rounded border-2 px-2 py-0.5 font-serif text-xs font-bold uppercase",
                        r.correct
                          ? "border-moss bg-moss/15 text-moss"
                          : "border-destructive bg-destructive/15 text-destructive",
                      )}
                    >
                      {r.correct ? `+${r.pointsEarned}` : "Wrong"}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-base">{r.questionPrompt}</p>
                  <p className="mt-1 font-body text-sm">
                    <span className="text-muted-foreground">Answer: </span>
                    <span className="font-semibold">{r.answer || "—"}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default Responses;
