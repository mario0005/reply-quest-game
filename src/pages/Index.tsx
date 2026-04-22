import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { responsesStore } from "@/data/responsesStore";
import { useAuth } from "@/hooks/useAuth";
import { useQuestions } from "@/hooks/useQuestionsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

type Stage = "lobby" | "playing" | "result";

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();
  const questions = useQuestions();
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>("lobby");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const total = questions.length;

  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const start = () => {
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setStage("playing");
  };

  const handleAnswer = (correct: boolean, pts: number, answerText: string) => {
    const q = questions[idx];
    responsesStore.addResponse({
      playerName: user.name,
      playerSurname: user.surname,
      questionId: q.id,
      questionPrompt: q.prompt,
      answer: answerText,
      correct,
      pointsEarned: pts,
    });

    const newScore = score + pts;
    const newCorrect = correctCount + (correct ? 1 : 0);
    setScore(newScore);
    setCorrectCount(newCorrect);

    if (idx + 1 >= total) {
      responsesStore.addSession({
        playerName: user.name,
        playerSurname: user.surname,
        score: newScore,
        correctCount: newCorrect,
        total,
      });
      setStage("result");
    } else {
      setIdx((i) => i + 1);
    }
  };

  const reset = () => setStage("lobby");

  const handleSignOut = () => {
    signOut();
    toast.success(t("result.signedOut"));
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-serif text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground">
              {t("common.signedInAs")}{" "}
              <span className="font-semibold text-ink">
                {user.name} {user.surname}
              </span>
            </span>
            <Link
              to="/leaderboard"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t("nav.leaderboard")}
            </Link>
            <Link
              to="/account"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t("nav.account")}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              {t("common.signOut")}
            </Button>
          </div>
        </div>

        {/* Header */}
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">{t("brand.tag")}</Stamp>
          <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
            {t("brand.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-muted-foreground">
            A pocket-sized game of wits, played one card at a time.
          </p>
        </header>

        {stage === "lobby" && (
          <section className="paper-card animate-card-flip-in p-6 md:p-8 text-center">
            <h2 className="font-serif text-2xl">
              {t("index.ready")} {user.name}.
            </h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {total} {t("index.cardsAwait")}
            </p>
            <div className="ink-rule my-5" />
            <Button
              onClick={start}
              size="lg"
              className="w-full font-serif tracking-wider shadow-stamp"
            >
              {t("index.dealFirst")}
            </Button>
            <p className="mt-4 font-body text-xs text-muted-foreground">{t("common.demo")}</p>
          </section>
        )}

        {stage === "playing" && (
          <>
            <div className="mb-4 flex items-center justify-between font-serif text-sm">
              <span className="text-muted-foreground">
                {t("index.player")}{" "}
                <span className="font-semibold text-ink">
                  {user.name} {user.surname}
                </span>
              </span>
              <span className="rounded-md border-2 border-mustard/50 bg-mustard/15 px-3 py-1 font-bold tracking-wider">
                {t("index.score")} · {score}
              </span>
            </div>

            <div className="mb-4 h-2 w-full overflow-hidden rounded-full border bg-paper-deep/60">
              <div
                className="h-full bg-clay transition-all duration-300"
                style={{ width: `${(idx / total) * 100}%` }}
              />
            </div>

            <QuestionCard
              key={questions[idx].id}
              question={questions[idx]}
              index={idx}
              total={total}
              onAnswer={handleAnswer}
            />
          </>
        )}

        {stage === "result" && (
          <section className="paper-card animate-card-flip-in p-8 text-center">
            <Stamp tone="moss" className="mb-5">{t("result.complete")}</Stamp>
            <h2 className="font-serif text-3xl font-black md:text-4xl">
              {t("result.wellPlayed")} {user.name}.
            </h2>
            <div className="ink-rule my-6" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-serif text-4xl font-black text-clay">{score}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  {t("result.score")}
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl font-black text-moss">{correctCount}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  {t("result.correct")}
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl font-black text-ink">{total}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  {t("result.cards")}
                </div>
              </div>
            </div>

            <Button onClick={reset} size="lg" className="mt-8 font-serif tracking-wider shadow-stamp">
              {t("result.playAgain")}
            </Button>
          </section>
        )}

        <footer className="mt-10 text-center font-body text-xs text-muted-foreground">
          <p>{t("footer.tag")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/rules" className="text-primary underline underline-offset-4 hover:text-primary/80">
              {t("footer.rules")}
            </Link>
            <span>·</span>
            <Link to="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
              {t("footer.privacy")}
            </Link>
            <span>·</span>
            <Link to="/cookies" className="text-primary underline underline-offset-4 hover:text-primary/80">
              {t("footer.cookies")}
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Index;
