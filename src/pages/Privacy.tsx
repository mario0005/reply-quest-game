import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { useTranslation } from "@/hooks/useTranslation";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">{t("brand.tag")}</Stamp>
          <h1 className="font-serif text-3xl font-black leading-tight md:text-4xl">
            Informativa sulla Privacy
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-muted-foreground">
            Privacy Policy ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)
          </p>
        </header>

        {/* Content */}
        <section className="paper-card p-6 md:p-8 space-y-6">
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            In questa pagina si descrive come vengono gestiti i dati personali degli utenti che consultano questo sito web.
          </p>

          <div className="ink-rule" />

          {/* 1. Titolare del Trattamento */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">1. Titolare del Trattamento</h2>
            <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-1">
              <p><strong>Il titolare del trattamento è:</strong> [Inserisci Nome e Cognome o Ragione Sociale]</p>
              <p><strong>Sede:</strong> [Inserisci Indirizzo Fisico]</p>
              <p><strong>Email di contatto:</strong> [Inserisci la tua Email]</p>
            </div>
          </div>

          <div className="ink-rule" />

          {/* 2. Tipologia di dati raccolti e Finalità */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">2. Tipologia di dati raccolti e Finalità</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
              Il sito raccoglie esclusivamente le preferenze alimentari fornite volontariamente dall'utente tramite il questionario presente sulla pagina.
            </p>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed space-y-2">
              <li>
                <strong>Finalità:</strong> I dati vengono raccolti al solo scopo di fornire il servizio richiesto (es. elaborazione dei risultati o visualizzazione di contenuti personalizzati).
              </li>
              <li>
                <strong>Base giuridica:</strong> Il trattamento si fonda sul consenso dell'utente, espresso attraverso la compilazione e l'invio del modulo.
              </li>
            </ul>
          </div>

          <div className="ink-rule" />

          {/* 3. Modalità di trattamento e Conservazione */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">3. Modalità di trattamento e Conservazione</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
              I dati vengono salvati localmente (es. nel database del server o nel browser tramite sessione) e trattati con strumenti informatici idonei a garantirne la sicurezza.
            </p>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>I dati non vengono condivisi con nessuna terza parte o servizio esterno.</li>
              <li>I dati saranno conservati solo per il tempo strettamente necessario a soddisfare la richiesta dell'utente.</li>
            </ul>
          </div>

          <div className="ink-rule" />

          {/* 4. Cookie */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">4. Cookie</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Questo sito utilizza esclusivamente cookie tecnici, necessari per il corretto funzionamento del sito e per ricordare le tue preferenze durante la navigazione. Non vengono utilizzati cookie di profilazione o di tracciamento di terze parti.
            </p>
          </div>

          <div className="ink-rule my-6" />

          <p className="font-body text-xs text-muted-foreground text-center">
            Ultimo aggiornamento: 22 aprile 2026
          </p>
        </section>

        <footer className="mt-10 text-center font-body text-xs text-muted-foreground">
          <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80">
            {t("common.backToGame")}
          </Link>
          <span className="mx-2">·</span>
          <Link to="/cookies" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Cookie Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}
