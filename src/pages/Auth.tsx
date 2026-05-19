import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  if (user && !justSignedUp) return <Navigate to="/" replace />;

  const signUpSchema = z.object({
    name: z.string().trim().min(1, t("auth.errNameRequired")).max(60),
    surname: z.string().trim().min(1, t("auth.errSurnameRequired")).max(60),
    email: z.string().trim().max(255).email(t("auth.errEmailInvalid")),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
  });
  const signInSchema = z.object({
    email: z.string().trim().max(255).email(t("auth.errEmailInvalid")),
    password: z.string().min(1, "Password is required").max(100),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ name, surname, email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          return;
        }
        const res = await signUp(parsed.data);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        toast.success(`${t("auth.welcome")}, ${res.user.name || res.user.email}!`);
        setJustSignedUp(true);
        navigate("/onboarding", { replace: true });
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          return;
        }
        const res = await signIn(parsed.data);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        toast.success(`${t("auth.welcomeBack")}, ${res.user.name || res.user.email}!`);
        navigate("/");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">{t("brand.tag")}</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">{t("brand.title")}</h1>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            {mode === "signin" ? t("auth.subtitleSignIn") : t("auth.subtitleSignUp")}
          </p>
        </header>

        <section className="paper-card animate-card-flip-in p-6 md:p-8">
          <div className="mb-5 flex rounded-md border-2 bg-paper-deep/40 p-1 font-serif text-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded py-2 tracking-wide transition-colors ${
                mode === "signin" ? "bg-clay text-clay-foreground" : "text-muted-foreground"
              }`}
            >
              {t("auth.signIn")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded py-2 tracking-wide transition-colors ${
                mode === "signup" ? "bg-clay text-clay-foreground" : "text-muted-foreground"
              }`}
            >
              {t("auth.signUp")}
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === "signup" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="font-serif text-xs uppercase tracking-widest">
                    {t("auth.firstName")}
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
                  <Label htmlFor="surname" className="font-serif text-xs uppercase tracking-widest">
                    {t("auth.surname")}
                  </Label>
                  <Input
                    id="surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Lovelace"
                    className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
                  />
                </div>
              </>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="font-serif text-xs uppercase tracking-widest">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="font-serif text-xs uppercase tracking-widest">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
                required
              />
            </div>

            {error && (
              <p className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={busy} className="font-serif tracking-wider shadow-stamp">
              {busy ? "..." : mode === "signin" ? t("auth.signIn") : t("auth.createAccount")}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Auth;
