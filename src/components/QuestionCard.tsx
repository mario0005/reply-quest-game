import { useState } from "react";
import type { Question } from "@/data/mockQuestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  index: number;
  total: number;
  onAnswer: (correct: boolean, pointsEarned: number) => void;
}

export const QuestionCard = ({ question, index, total, onAnswer }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [tfPick, setTfPick] = useState<boolean | null>(null);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const submit = () => {
    let correct = false;
    if (question.type === "multiple_choice" && selected !== null) {
      correct = selected === question.correctIndex;
    } else if (question.type === "true_false" && tfPick !== null) {
      correct = tfPick === question.correct;
    } else if (question.type === "text" && text.trim()) {
      correct = question.acceptedAnswers.includes(text.trim().toLowerCase());
    }
    setWasCorrect(correct);
    setRevealed(true);
  };

  const next = () => onAnswer(wasCorrect, wasCorrect ? question.points : 0);

  const canSubmit =
    (question.type === "multiple_choice" && selected !== null) ||
    (question.type === "true_false" && tfPick !== null) ||
    (question.type === "text" && text.trim().length > 0);

  return (
    <div className="paper-card animate-card-flip-in p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Card {index + 1} / {total}
        </span>
        <span className="rounded-full border border-mustard/40 bg-mustard/15 px-2.5 py-0.5 font-serif text-xs font-semibold text-ink">
          {question.points} pts
        </span>
      </div>

      <div className="ink-rule mb-5" />

      <h2 className="mb-6 font-serif text-2xl leading-snug md:text-3xl">{question.prompt}</h2>

      {question.type === "multiple_choice" && (
        <div className="grid gap-2.5">
          {question.options.map((opt, i) => {
            const isPicked = selected === i;
            const isCorrect = revealed && i === question.correctIndex;
            const isWrongPick = revealed && isPicked && !isCorrect;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border-2 bg-paper-deep/40 px-4 py-3 text-left font-body transition-all",
                  "hover:-translate-y-[1px] hover:bg-paper-deep/70",
                  isPicked && !revealed && "border-clay bg-clay/10",
                  !isPicked && !revealed && "border-border",
                  isCorrect && "border-moss bg-moss/15",
                  isWrongPick && "border-destructive bg-destructive/10",
                  revealed && "cursor-default hover:translate-y-0",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-serif text-sm font-bold",
                    isPicked || isCorrect ? "border-current" : "border-border text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-base">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => {
            const isPicked = tfPick === v;
            const isCorrect = revealed && v === question.correct;
            const isWrongPick = revealed && isPicked && !isCorrect;
            return (
              <button
                key={String(v)}
                disabled={revealed}
                onClick={() => setTfPick(v)}
                className={cn(
                  "rounded-lg border-2 bg-paper-deep/40 py-6 font-serif text-xl font-bold uppercase tracking-wider transition-all hover:-translate-y-[1px]",
                  isPicked && !revealed && "border-clay bg-clay/10",
                  !isPicked && !revealed && "border-border",
                  isCorrect && "border-moss bg-moss/15 text-moss",
                  isWrongPick && "border-destructive bg-destructive/10 text-destructive",
                  revealed && "cursor-default hover:translate-y-0",
                )}
              >
                {v ? "True" : "False"}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={revealed}
            placeholder="Write your answer…"
            className="h-12 border-2 bg-paper-deep/40 font-serif text-lg shadow-inset"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !revealed && canSubmit) submit();
            }}
          />
          {revealed && (
            <p className="mt-3 font-body text-sm text-muted-foreground">
              Accepted: <span className="font-semibold text-ink">{question.acceptedAnswers[0]}</span>
            </p>
          )}
        </div>
      )}

      {revealed && (
        <div className="mt-6 flex items-center gap-3">
          <span
            className={cn(
              "rounded-md border-2 px-3 py-1 font-serif text-sm font-bold uppercase tracking-widest",
              wasCorrect
                ? "border-moss bg-moss/15 text-moss"
                : "border-destructive bg-destructive/15 text-destructive",
            )}
          >
            {wasCorrect ? `+${question.points}` : "No points"}
          </span>
          <span className="font-body text-sm text-muted-foreground">
            {wasCorrect ? "Well played." : "Better luck on the next card."}
          </span>
        </div>
      )}

      <div className="mt-7 flex justify-end">
        {!revealed ? (
          <Button size="lg" onClick={submit} disabled={!canSubmit} className="font-serif tracking-wide shadow-stamp">
            Submit answer
          </Button>
        ) : (
          <Button size="lg" onClick={next} className="font-serif tracking-wide shadow-stamp">
            {index + 1 === total ? "See result" : "Next card →"}
          </Button>
        )}
      </div>
    </div>
  );
};
