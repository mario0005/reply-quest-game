import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessions, useResponses } from "@/hooks/useResponsesStore";
import { responsesStore } from "@/data/responsesStore";
import { toast } from "sonner";

const profileSchema = z.object({
  email: z.string().trim().max(255).email().optional().or(z.literal("")),
  password: z.string().max(100).optional().or(z.literal("")),
});

const Account = () => {
  const { user, isAdmin, updateProfile, deleteCurrentAccount, signOut } = useAuth();
  const { t } = useTranslation();
  const sessions = useSessions();
  const responses = useResponses();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) return <Navigate to="/auth" replace />;

  const mySessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.playerName === user.name && s.playerSurname === user.surname,
      ),
    [sessions, user.name, user.surname],
  );

  const myResponses = useMemo(
    () =>
      responses.filter(
        (r) => r.playerName === user.name && r.playerSurname === user.surname,
      ),
    [responses, user.name, user.surname],
  );

  const bestScore = mySessions.reduce((max, s) => Math.max(max, s.score), 0);
  const totalCorrect = myResponses.filter((r) => r.correct).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = profileSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const res = updateProfile({
      email: parsed.data.email || undefined,
      password: parsed.data.password || undefined,
    });
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setPassword("");
    toast.success(t("acc.saved"));
  };

  const handleDelete = () => {
    if (!confirm(t("acc.deleteConfirm"))) return;
    const res = deleteCurrentAccount();
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(t("acc.deleted"));
    navigate("/auth");
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between font-serif text-sm">
          <Link to={isAdmin ? "/admin" : "/"} className="underline underline-offset-4">
            {t("common.back")}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                toast.success(t("result.signedOut"));
              }}
            >
              {t("common.signOut")}
            </Button>
          </div>
        </div>

        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">{t("acc.stamp")}</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">{t("acc.title")}</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            {t("acc.subtitle")}
          </p>
        </header>

        {/* Profile */}
        <section className="paper-card mb-6 p-6">
          <h2 className="font-serif text-xl font-bold">{t("acc.profile")}</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">{t("acc.profileHint")}</p>
          <div className="ink-rule my-4" />

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-serif text-xs uppercase tracking-widest text-muted-foreground">
                {t("auth.firstName")}
              </p>
              <p className="font-serif text-lg font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="font-serif text-xs uppercase tracking-widest text-muted-foreground">
                {t("auth.surname")}
              </p>
              <p className="font-serif text-lg font-semibold">{user.surname}</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="acc-email" className="font-serif text-xs uppercase tracking-widest">
                {t("auth.email")}
              </Label>
              <Input
                id="acc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="acc-pw" className="font-serif text-xs uppercase tracking-widest">
                {t("auth.password")}
              </Label>
              <Input
                id="acc-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
              />
            </div>

            {error && (
              <p className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" className="font-serif tracking-wide shadow-stamp">
                {t("common.save")}
              </Button>
            </div>
          </form>
        </section>

        {/* Stats */}
        <section className="paper-card mb-6 p-6">
          <h2 className="font-serif text-xl font-bold">{t("acc.stats")}</h2>
          <div className="ink-rule my-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-serif text-3xl font-black text-clay">{bestScore}</div>
              <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                {t("acc.bestScore")}
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl font-black text-moss">{mySessions.length}</div>
              <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                {t("acc.rounds")}
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl font-black text-ink">{totalCorrect}</div>
              <div className="mt-1 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                {t("acc.totalCorrect")}
              </div>
            </div>
          </div>

          <div className="ink-rule my-5" />
          <h3 className="font-serif text-base font-bold">{t("acc.history")}</h3>
          {mySessions.length === 0 ? (
            <p className="mt-3 font-body text-sm text-muted-foreground">{t("acc.noHistory")}</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {mySessions.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border-2 bg-paper-deep/40 px-4 py-2 font-body text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(s.finishedAt).toLocaleString()}
                  </span>
                  <span>
                    <span className="font-semibold">{s.score}</span> {t("index.points")} ·{" "}
                    {s.correctCount}/{s.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Danger zone */}
        {!isAdmin && (
          <section className="paper-card border-destructive/40 p-6">
            <h2 className="font-serif text-xl font-bold text-destructive">{t("acc.danger")}</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">{t("acc.dangerHint")}</p>
            <div className="ink-rule my-4" />
            <div className="flex justify-end">
              <Button variant="destructive" onClick={handleDelete}>
                {t("acc.deleteAccount")}
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Account;
