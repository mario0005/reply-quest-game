import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { responsesStore } from "@/data/responsesStore";
import { useAuth } from "@/hooks/useAuth";
import { useQuestions } from "@/hooks/useQuestionsStore";
import { toast } from "sonner";

type Stage = "lobby" | "playing" | "result";

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();
  const questions = useQuestions();
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
    toast.success("Signed out");
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between font-serif text-sm">
          <span className="text-muted-foreground">
            Signed in as{" "}
            <span className="font-semibold text-ink">
              {user.name} {user.surname}
            </span>
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        {/* Header */}
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">Field &amp; Folklore</Stamp>
          <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
            The Parlour Quiz
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-muted-foreground">
            A pocket-sized game of wits, played one card at a time.
          </p>
        </header>

        {stage === "lobby" && (
          <section className="paper-card animate-card-flip-in p-6 md:p-8 text-center">
            <h2 className="font-serif text-2xl">Ready when you are, {user.name}.</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {total} cards await. Take your time.
            </p>
            <div className="ink-rule my-5" />
            <Button
              onClick={start}
              size="lg"
              className="w-full font-serif tracking-wider shadow-stamp"
            >
              Deal the first card →
            </Button>
            <p className="mt-4 font-body text-xs text-muted-foreground">
              Demo mode · accounts &amp; responses kept in memory on this device
            </p>
          </section>
        )}

        {stage === "playing" && (
          <>
            <div className="mb-4 flex items-center justify-between font-serif text-sm">
              <span className="text-muted-foreground">
                Player:{" "}
                <span className="font-semibold text-ink">
                  {user.name} {user.surname}
                </span>
              </span>
              <span className="rounded-md border-2 border-mustard/50 bg-mustard/15 px-3 py-1 font-bold tracking-wider">
                Score · {score}
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
            <Stamp tone="moss" className="mb-5">Round complete</Stamp>
            <h2 className="font-serif text-3xl font-black md:text-4xl">
              Well played, {user.name}.
            </h2>
            <div className="ink-rule my-6" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-serif text-4xl font-black text-clay">{score}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  Score
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl font-black text-moss">{correctCount}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  Correct
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl font-black text-ink">{total}</div>
                <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  Cards
                </div>
              </div>
            </div>

            <Button onClick={reset} size="lg" className="mt-8 font-serif tracking-wider shadow-stamp">
              Play again
            </Button>
          </section>
        )}

        <footer className="mt-10 text-center font-body text-xs text-muted-foreground">
          Tactile Tabletop · in-memory store
        </footer>
      </div>
    </main>
  );
};

export default Index;
