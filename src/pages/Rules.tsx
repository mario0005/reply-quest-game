import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/hooks/useTranslation";

export default function Rules() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen px-4 py-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Lora:wght@400;500;600&display=swap"
      />
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between font-serif text-sm">
          <Link to="/" className="underline underline-offset-4">
            {t("common.backToGame")}
          </Link>
          <LanguageToggle />
        </div>

        <header className="mb-8 text-center">
          <Stamp tone="moss" className="mb-4">{t("rules.stamp")}</Stamp>
          <h1 className="font-serif text-4xl font-black md:text-5xl">{t("rules.title")}</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted-foreground">
            {t("rules.subtitle")}
          </p>
        </header>

        <section className="paper-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">{t("rules.howH")}</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {t("rules.howP")}
            </p>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">{t("rules.typesH")}</h2>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>{t("rules.typeMC")}</li>
              <li>{t("rules.typeTF")}</li>
              <li>{t("rules.typeText")}</li>
            </ul>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">{t("rules.scoringH")}</h2>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>{t("rules.scoring1")}</li>
              <li>{t("rules.scoring2")}</li>
              <li>{t("rules.scoring3")}</li>
            </ul>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">{t("rules.flowH")}</h2>
            <ol className="font-body text-sm text-muted-foreground leading-relaxed list-decimal list-inside space-y-1">
              <li>{t("rules.flow1")}</li>
              <li>{t("rules.flow2")}</li>
              <li>{t("rules.flow3")}</li>
              <li>{t("rules.flow4")}</li>
            </ol>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">{t("rules.tipsH")}</h2>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>{t("rules.tip1")}</li>
              <li>{t("rules.tip2")}</li>
              <li>{t("rules.tip3")}</li>
            </ul>
          </div>
        </section>

        <footer className="mt-10 text-center font-body text-xs text-muted-foreground">
          <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80">
            {t("common.backToGame")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
