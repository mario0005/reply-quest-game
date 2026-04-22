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
        <section id="privacy-policy">
            <h1>Informativa sulla Privacy (Privacy Policy)</h1>
            <p>Ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR), questa pagina descrive come vengono gestiti i dati personali degli utenti che consultano questo sito web.</p>
        
            <h2>1. Titolare del Trattamento</h2>
            <p>Il titolare del trattamento è: <strong>[Inserisci Nome e Cognome o Ragione Sociale]</strong><br>
            Sede: <strong>[Inserisci Indirizzo Fisico]</strong><br>
            Email di contatto: <strong>[Inserisci la tua Email]</strong></p>
        
            <h2>2. Tipologia di dati raccolti e Finalità</h2>
            <p>Il sito raccoglie esclusivamente le preferenze alimentari fornite volontariamente dall'utente tramite il questionario presente sulla pagina.</p>
            <ul>
                <li><strong>Finalità:</strong> I dati vengono raccolti al solo scopo di fornire il servizio richiesto (es. elaborazione dei risultati o visualizzazione di contenuti personalizzati).</li>
                <li><strong>Base giuridica:</strong> Il trattamento si fonda sul consenso dell'utente, espresso attraverso la compilazione e l'invio del modulo.</li>
            </ul>
        
            <h2>3. Modalità di trattamento e Conservazione</h2>
            <p>I dati vengono salvati localmente e trattati con strumenti informatici idonei a garantirne la sicurezza.</p>
            <ul>
                <li>I dati <strong>non vengono condivisi</strong> con nessuna terza parte o servizio esterno.</li>
                <li>I dati saranno conservati solo per il tempo strettamente necessario a soddisfare la richiesta dell'utente.</li>
            </ul>
        
            <h2>4. Cookie</h2>
            <p>Questo sito utilizza esclusivamente <strong>cookie tecnici</strong>, necessari per il corretto funzionamento del sito e per ricordare le tue preferenze durante la navigazione. Non vengono utilizzati cookie di profilazione o di tracciamento di terze parti.</p>
        
            <h2>5. Diritti dell'interessato</h2>
            <p>In ogni momento, l'utente ha il diritto di chiedere l'accesso ai propri dati, la rettifica, la cancellazione o revocare il consenso al trattamento scrivendo all'indirizzo email sopra indicato.</p>


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
