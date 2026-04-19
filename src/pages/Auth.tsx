import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Stamp } from "@/components/Stamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "First name is required").max(60),
  surname: z.string().trim().min(1, "Surname is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password required").max(100),
});

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "signup") {
      const parsed = signUpSchema.safeParse({ name, surname, email, password });
      if (!parsed.success) return setError(parsed.error.issues[0].message);
      const res = signUp(parsed.data);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      toast.success(`Welcome, ${res.user.name}!`);
      navigate("/");
    } else {
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) return setError(parsed.error.issues[0].message);
      const res = signIn(parsed.data);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">Field &amp; Folklore</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">The Parlour Quiz</h1>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            {mode === "signin" ? "Welcome back. Sign in to play." : "Create an account to begin."}
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
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded py-2 tracking-wide transition-colors ${
                mode === "signup" ? "bg-clay text-clay-foreground" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === "signup" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="font-serif text-xs uppercase tracking-widest">
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
                  <Label htmlFor="surname" className="font-serif text-xs uppercase tracking-widest">
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
              </>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="font-serif text-xs uppercase tracking-widest">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@example.com"
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="font-serif text-xs uppercase tracking-widest">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
              />
            </div>

            {error && (
              <p className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="font-serif tracking-wider shadow-stamp">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center font-body text-xs text-muted-foreground">
            Demo mode · accounts kept in memory on this device only
          </p>
        </section>
      </div>
    </main>
  );
};

export default Auth;
