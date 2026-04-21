import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { useTranslation } from "@/hooks/useTranslation";

export default function Cookies() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <Stamp tone="clay" className="mb-4">{t("brand.tag")}</Stamp>
          <h1 className="font-serif text-3xl font-black leading-tight md:text-4xl">
            Cookie Policy
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-muted-foreground">
            Informativa sull'uso dei cookie (GDPR)
          </p>
        </header>

        {/* Content */}
        <section className="paper-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold mb-3">Cosa sono i cookie</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              I cookie sono piccoli file di testo che i siti web possono memorizzare sul tuo dispositivo 
              quando li visiti. Servono a migliorare l'esperienza utente, ricordare le preferenze 
              e fornire funzionalità essenziali.
            </p>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">Tipologie di cookie utilizzati</h2>
            
            <div className="space-y-4 mt-4">
              <div className="rounded-lg border border-border bg-paper-deep/40 p-4">
                <h3 className="font-serif text-base font-bold mb-2">Cookie tecnici essenziali</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Necessari per il funzionamento del sito. Memorizzano lo stato di autenticazione 
                  dell'utente e le preferenze di lingua. Senza questi cookie, il gioco non funzionerebbe correttamente.
                </p>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Durata: sessione / persistente (preferenza lingua)
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper-deep/40 p-4">
                <h3 className="font-serif text-base font-bold mb-2">Cookie di preferenza</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Memorizzano le scelte dell'utente, come la lingua preferita (italiano o inglese). 
                  Questi cookie migliorano l'esperienza evitando di dover riselezionare le preferenze ad ogni visita.
                </p>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Durata: 1 anno
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper-deep/40 p-4">
                <h3 className="font-serif text-base font-bold mb-2">Cookie analitici (opzionali)</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Potrebbero essere utilizzati per raccogliere informazioni anonime sull'utilizzo del sito, 
                  come il numero di visitatori e le pagine più visualizzate. Questi dati aiutano a migliorare il sito.
                </p>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  <strong>Nota:</strong> Attualmente non utilizziamo cookie analitici di terze parti.
                </p>
              </div>
            </div>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">Gestione dei cookie</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
              Puoi gestire le tue preferenze sui cookie in qualsiasi momento:
            </p>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>
                <strong>Impostazioni del browser:</strong> Tutti i browser principali permettono di visualizzare, 
                gestire e cancellare i cookie nelle impostazioni di privacy.
              </li>
              <li>
                <strong>Preferenze lingua:</strong> La scelta della lingua viene memorizzata localmente 
                e può essere modificata in qualsiasi momento usando il selettore di lingua nell'header.
              </li>
            </ul>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">Diritti degli interessati</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
              Ai sensi del GDPR, hai diritto di:
            </p>
            <ul className="font-body text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>Accedere ai tuoi dati personali</li>
              <li>Chiederne la rettifica o la cancellazione</li>
              <li>Chiedere la limitazione del trattamento</li>
              <li>Opporsi al trattamento</li>
              <li>Chiedere la portabilità dei dati</li>
            </ul>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
              Per esercitare questi diritti, contatta l'amministratore del sito.
            </p>
          </div>

          <div className="ink-rule" />

          <div>
            <h2 className="font-serif text-xl font-bold mb-3">Modifiche alla cookie policy</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              La presente cookie policy può essere modificata. Le modifiche saranno pubblicate su questa pagina 
              con aggiornamento della data di ultima modifica.
            </p>
          </div>

          <div className="ink-rule my-6" />

          <p className="font-body text-xs text-muted-foreground text-center">
            Ultimo aggiornamento: 21 aprile 2026
          </p>
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
