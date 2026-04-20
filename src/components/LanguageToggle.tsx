import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const LanguageToggle = ({ className }: Props) => {
  const { lang, setLang } = useTranslation();
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border-2 border-border bg-paper-deep/40 font-serif text-xs font-bold uppercase tracking-widest",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "px-2.5 py-1 transition-colors",
          lang === "en" ? "bg-clay text-clay-foreground" : "text-muted-foreground hover:text-ink",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("it")}
        aria-pressed={lang === "it"}
        className={cn(
          "px-2.5 py-1 transition-colors",
          lang === "it" ? "bg-clay text-clay-foreground" : "text-muted-foreground hover:text-ink",
        )}
      >
        IT
      </button>
    </div>
  );
};
