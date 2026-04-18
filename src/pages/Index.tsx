import { useState } from "react";
import { mockQuestions } from "@/data/mockQuestions";
import { Stamp } from "@/components/Stamp";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = "lobby" | "playing" | "result";

const Index = () => {
  const [stage, setStage] = useState<Stage>("lobby");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const total = mockQuestions.length;

  const start = () => {
    if (!name.trim() || !surname.trim()) return;
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setStage("playing");
  };

  const handleAnswer = (correct: boolean, pts: number) => {
    setScore((s) => s + pts);
    if (correct) setCorrectCount((c) => c + 1);
    if (idx + 1 >= total) setStage("result");
    else setIdx((i) => i + 1);
  };

  const reset = () => setStage("lobby");

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />

      <div className="mx-auto w-full max-w-2xl">
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
          <section className="paper-card animate-card-flip-in p-6 md:p-8">
            <h2 className="font-serif text-2xl">Take a seat, player</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Tell us your name to begin the round.
            </p>
            <div className="ink-rule my-5" />

            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="font-serif uppercase tracking-widest text-xs">
                  First name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada"
                  className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="surname" className="font-serif uppercase tracking-widest text-xs">
                  Surname
                </Label>
                <Input
                  id="surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Lovelace"
                  className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
                />
              </div>
            </div>

            <Button
              onClick={start}
              disabled={!name.trim() || !surname.trim()}
              size="lg"
              className="mt-6 w-full font-serif tracking-wider shadow-stamp"
            >
              Deal the first card →
            </Button>

            <p className="mt-4 text-center font-body text-xs text-muted-foreground">
              Demo mode · {total} sample cards · no data is saved yet
            </p>
          </section>
        )}

        {stage === "playing" && (
          <>
            <div className="mb-4 flex items-center justify-between font-serif text-sm">
              <span className="text-muted-foreground">
                Player: <span className="font-semibold text-ink">{name} {surname}</span>
              </span>
              <span className="rounded-md border-2 border-mustard/50 bg-mustard/15 px-3 py-1 font-bold tracking-wider">
                Score · {score}
              </span>
            </div>

            <div className="mb-4 h-2 w-full overflow-hidden rounded-full border bg-paper-deep/60">
              <div
                className="h-full bg-clay transition-all duration-300"
                style={{ width: `${((idx) / total) * 100}%` }}
              />
            </div>

            <QuestionCard
              key={mockQuestions[idx].id}
              question={mockQuestions[idx]}
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
              Well played, {name}.
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
          Tactile Tabletop · static preview
        </footer>
      </div>
    </main>
  );
};

export default Index;
