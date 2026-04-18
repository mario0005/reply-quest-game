import { cn } from "@/lib/utils";

interface StampProps {
  children: React.ReactNode;
  className?: string;
  tone?: "clay" | "moss" | "mustard";
}

export const Stamp = ({ children, className, tone = "clay" }: StampProps) => {
  const toneClass =
    tone === "moss"
      ? "bg-secondary text-secondary-foreground"
      : tone === "mustard"
        ? "bg-accent text-accent-foreground"
        : "stamp";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-2 border-current/20 px-3 py-1 font-serif text-xs font-bold uppercase tracking-[0.2em] -rotate-2 animate-stamp-in",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
};
