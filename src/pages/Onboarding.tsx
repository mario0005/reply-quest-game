import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { DietaryPreferencesForm } from "@/components/DietaryPreferencesForm";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import {
  defaultPreferences,
  preferencesStore,
  usePreferences,
} from "@/data/preferencesStore";
import { toast } from "sonner";

const Onboarding = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const existing = usePreferences(user?.id);
  const [prefs, setPrefs] = useState(existing ?? defaultPreferences);

  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  // If they already have prefs saved, skip the onboarding screen.
  if (existing) return <Navigate to="/" replace />;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    preferencesStore.set(user.id, prefs);
    toast.success(t("prefs.saved"));
    navigate("/");
  };

  const skip = () => {
    preferencesStore.set(user.id, defaultPreferences);
    navigate("/");
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-end">
          <LanguageToggle />
        </div>

        <header className="mb-8 text-center">
          <Stamp tone="moss" className="mb-4">{t("prefs.stamp")}</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">
            {t("prefs.title")} {user.name}.
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            {t("prefs.subtitle")}
          </p>
        </header>

        <section className="paper-card animate-card-flip-in p-6 md:p-8">
          <DietaryPreferencesForm
            value={prefs}
            onChange={setPrefs}
            onSubmit={save}
            submitLabel={t("prefs.saveContinue")}
            onSkip={skip}
            skipLabel={t("prefs.skip")}
          />
        </section>
      </div>
    </main>
  );
};

export default Onboarding;
