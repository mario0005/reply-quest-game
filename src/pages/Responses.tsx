import { Link, Navigate } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useResponses, useSessions } from "@/hooks/useResponsesStore";
import { responsesStore } from "@/data/responsesStore";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const Responses = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const responses = useResponses();
  const sessions = useSessions();

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <header className="mb-8 text-center">
          <Stamp tone="moss" className="mb-4">{t("resp.stamp")}</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">{t("resp.title")}</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            {t("resp.subtitle")}
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <Link to="/admin" className="font-serif text-sm underline underline-offset-4">
            {t("common.back")}
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm(t("resp.clearConfirm"))) responsesStore.clear();
            }}
          >
            {t("resp.clear")}
          </Button>
        </div>

        <section className="paper-card mb-8 p-6">
          <h2 className="font-serif text-xl font-bold">{t("resp.sessions")} ({sessions.length})</h2>
          <div className="ink-rule my-4" />
          {sessions.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">{t("resp.noSessions")}</p>
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
                    {s.correctCount}/{s.total} {t("resp.correct")} · {s.score} {t("index.points")} ·{" "}
                    {new Date(s.finishedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="paper-card p-6">
          <h2 className="font-serif text-xl font-bold">{t("resp.answers")} ({responses.length})</h2>
          <div className="ink-rule my-4" />
          {responses.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">{t("resp.noAnswers")}</p>
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
                      {r.correct ? `+${r.pointsEarned}` : t("resp.wrong")}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-base">{r.questionPrompt}</p>
                  <p className="mt-1 font-body text-sm">
                    <span className="text-muted-foreground">{t("resp.answer")} </span>
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
