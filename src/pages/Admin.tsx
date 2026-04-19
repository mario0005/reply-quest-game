import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuestions } from "@/hooks/useQuestionsStore";
import { questionsStore } from "@/data/questionsStore";
import type { Question } from "@/data/mockQuestions";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin, signOut } = useAuth();
  const questions = useQuestions();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const addNew = (type: Question["type"]) => {
    const base =
      type === "multiple_choice"
        ? { type: "multiple_choice" as const, prompt: "New question", options: ["A", "B", "C", "D"], correctIndex: 0, points: 10 }
        : type === "true_false"
        ? { type: "true_false" as const, prompt: "New question", correct: true, points: 5 }
        : { type: "text" as const, prompt: "New question", acceptedAnswers: ["answer"], points: 10 };
    questionsStore.add(base);
    toast.success("Question added");
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between font-serif text-sm">
          <Link to="/" className="underline underline-offset-4">← Back</Link>
          <Button variant="outline" size="sm" onClick={() => { signOut(); toast.success("Signed out"); }}>
            Sign out
          </Button>
        </div>

        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">Admin</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">Curate the Deck</h1>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            Edit, add, or remove the questions players will see.
          </p>
        </header>

        <section className="paper-card mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-bold">{questions.length} questions</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => addNew("multiple_choice")}>
                + Multiple choice
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNew("true_false")}>
                + True / False
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNew("text")}>
                + Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Reset all questions to defaults?")) {
                    questionsStore.resetToDefaults();
                    toast.success("Questions reset");
                  }
                }}
              >
                Reset to defaults
              </Button>
            </div>
          </div>
          <p className="mt-3">
            <Link to="/responses" className="font-serif text-sm underline underline-offset-4">
              → View all player responses
            </Link>
          </p>
        </section>

        <ul className="grid gap-4">
          {questions.map((q, i) => (
            <li key={q.id} className="paper-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-serif text-xs uppercase tracking-widest text-muted-foreground">
                  #{i + 1} · {q.type.replace("_", " ")}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                  >
                    {editingId === q.id ? "Close" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this question?")) {
                        questionsStore.remove(q.id);
                        toast.success("Deleted");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="font-serif text-lg">{q.prompt}</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                {q.type === "multiple_choice" &&
                  `Options: ${q.options.join(", ")} · Correct: ${q.options[q.correctIndex]}`}
                {q.type === "true_false" && `Correct: ${q.correct ? "True" : "False"}`}
                {q.type === "text" && `Accepted: ${q.acceptedAnswers.join(", ")}`}
                {" · "}
                {q.points} pts
              </p>

              {editingId === q.id && <Editor question={q} onDone={() => setEditingId(null)} />}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

const Editor = ({ question, onDone }: { question: Question; onDone: () => void }) => {
  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [options, setOptions] = useState(
    question.type === "multiple_choice" ? question.options.join("\n") : "",
  );
  const [correctIndex, setCorrectIndex] = useState(
    question.type === "multiple_choice" ? question.correctIndex : 0,
  );
  const [tfCorrect, setTfCorrect] = useState(
    question.type === "true_false" ? question.correct : true,
  );
  const [accepted, setAccepted] = useState(
    question.type === "text" ? question.acceptedAnswers.join("\n") : "",
  );

  const save = () => {
    if (!prompt.trim()) return toast.error("Prompt is required");
    const patch: Partial<Question> = { prompt: prompt.trim(), points: Number(points) || 0 } as Partial<Question>;
    if (question.type === "multiple_choice") {
      const opts = options.split("\n").map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) return toast.error("Need at least 2 options");
      const idx = Math.min(Math.max(0, correctIndex), opts.length - 1);
      Object.assign(patch, { options: opts, correctIndex: idx });
    } else if (question.type === "true_false") {
      Object.assign(patch, { correct: tfCorrect });
    } else {
      const list = accepted.split("\n").map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (list.length === 0) return toast.error("At least one accepted answer required");
      Object.assign(patch, { acceptedAnswers: list });
    }
    questionsStore.update(question.id, patch);
    toast.success("Saved");
    onDone();
  };

  return (
    <div className="mt-4 grid gap-3 rounded-md border-2 bg-paper-deep/40 p-4">
      <div className="grid gap-1.5">
        <Label className="font-serif text-xs uppercase tracking-widest">Prompt</Label>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="border-2 bg-background" />
      </div>
      <div className="grid gap-1.5">
        <Label className="font-serif text-xs uppercase tracking-widest">Points</Label>
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="h-10 w-32 border-2 bg-background"
        />
      </div>

      {question.type === "multiple_choice" && (
        <>
          <div className="grid gap-1.5">
            <Label className="font-serif text-xs uppercase tracking-widest">Options (one per line)</Label>
            <Textarea value={options} onChange={(e) => setOptions(e.target.value)} rows={4} className="border-2 bg-background font-body" />
          </div>
          <div className="grid gap-1.5">
            <Label className="font-serif text-xs uppercase tracking-widest">Correct option (0-indexed)</Label>
            <Input
              type="number"
              value={correctIndex}
              onChange={(e) => setCorrectIndex(Number(e.target.value))}
              className="h-10 w-32 border-2 bg-background"
            />
          </div>
        </>
      )}

      {question.type === "true_false" && (
        <div className="grid gap-1.5">
          <Label className="font-serif text-xs uppercase tracking-widest">Correct answer</Label>
          <div className="flex gap-2">
            <Button type="button" variant={tfCorrect ? "default" : "outline"} onClick={() => setTfCorrect(true)}>
              True
            </Button>
            <Button type="button" variant={!tfCorrect ? "default" : "outline"} onClick={() => setTfCorrect(false)}>
              False
            </Button>
          </div>
        </div>
      )}

      {question.type === "text" && (
        <div className="grid gap-1.5">
          <Label className="font-serif text-xs uppercase tracking-widest">Accepted answers (one per line)</Label>
          <Textarea value={accepted} onChange={(e) => setAccepted(e.target.value)} rows={3} className="border-2 bg-background font-body" />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={save} className="font-serif tracking-wide shadow-stamp">Save</Button>
      </div>
    </div>
  );
};

export default Admin;
