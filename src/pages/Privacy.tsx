<main className="min-h-screen px-4 py-10">
  <div className="mx-auto w-full max-w-2xl">
    {/* Header */}
    <header className="mb-8 text-center">
      <Stamp tone="clay" className="mb-4">{t("brand.tag")}</Stamp>
      <h1 className="font-serif text-3xl font-black leading-tight md:text-4xl">
        Privacy & Cookie Policy
      </h1>
      <p className="mx-auto mt-3 max-w-md font-body text-base text-muted-foreground">
        Informativa sul trattamento dei dati personali (GDPR)
      </p>
    </header>

    {/* Content */}
    <section id="privacy-policy" className="prose prose-sm max-w-none font-body text-foreground">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">1. Titolare del Trattamento</h2>
          <p className="text-muted-foreground">
            Il titolare del trattamento è: <strong>[Nome/Ragione Sociale]</strong><br />
            Sede: <strong>[Indirizzo Fisico]</strong><br />
            Email: <strong>[Tua Email]</strong>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">2. Tipologia di dati e Finalità</h2>
          <p className="text-muted-foreground">
            Il sito raccoglie esclusivamente le preferenze alimentari fornite volontariamente tramite il questionario.
          </p>
          <ul className="list-disc pl-5 mt-2 text-muted-foreground space-y-1">
            <li><strong>Finalità:</strong> Fornire il servizio richiesto (es. risultati del test).</li>
            <li><strong>Base giuridica:</strong> Consenso dell'utente tramite compilazione del modulo.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">3. Modalità e Conservazione</h2>
          <p className="text-muted-foreground">
            I dati sono salvati localmente e <strong>non vengono condivisi</strong> con terze parti. Vengono conservati solo per il tempo necessario all'erogazione del servizio.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">4. Cookie</h2>
          <p className="text-muted-foreground">
            Utilizziamo solo <strong>cookie tecnici</strong> necessari al funzionamento del sito. Non usiamo cookie di profilazione o tracciamento (es. no Analytics, no Pixel).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">5. Diritti dell'utente</h2>
          <p className="text-muted-foreground italic text-sm">
            Puoi richiedere l'accesso, la rettifica o la cancellazione dei dati scrivendo all'email sopra indicata.
          </p>
        </div>

        <p className="pt-6 font-body text-xs text-muted-foreground text-center border-t border-border">
          Ultimo aggiornamento: 21 aprile 2026
        </p>
      </div>
    </section>

    <footer className="mt-10 text-center font-body text-xs text-muted-foreground">
      <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80">
        {t("common.backToGame")}
      </Link>
    </footer>
  </div>
</main>
