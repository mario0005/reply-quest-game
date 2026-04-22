import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DietaryPreferences,
  DietType,
  SpiceLevel,
} from "@/data/preferencesStore";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  value: DietaryPreferences;
  onChange: (next: DietaryPreferences) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  onSkip?: () => void;
  skipLabel?: string;
}

const DIETS: DietType[] = ["omnivore", "vegetarian", "vegan", "pescatarian", "other"];
const SPICES: SpiceLevel[] = ["none", "mild", "medium", "hot"];

export const DietaryPreferencesForm = ({
  value,
  onChange,
  onSubmit,
  submitLabel,
  onSkip,
  skipLabel,
}: Props) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {/* Diet */}
      <div className="grid gap-2">
        <Label className="font-serif text-xs uppercase tracking-widest">
          {t("prefs.q1")}
        </Label>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ ...value, diet: d })}
              className={`rounded-md border-2 px-3 py-2 font-serif text-sm tracking-wide transition-colors ${
                value.diet === d
                  ? "border-clay bg-clay text-clay-foreground"
                  : "border-border bg-paper-deep/40 text-ink hover:bg-paper-deep/70"
              }`}
            >
              {t(`prefs.diet.${d}` as never)}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="grid gap-1.5">
        <Label htmlFor="prefs-allergies" className="font-serif text-xs uppercase tracking-widest">
          {t("prefs.q2")}
        </Label>
        <Input
          id="prefs-allergies"
          value={value.allergies}
          onChange={(e) => onChange({ ...value, allergies: e.target.value })}
          placeholder={t("prefs.allergiesPlaceholder")}
          className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
        />
      </div>

      {/* Spice */}
      <div className="grid gap-2">
        <Label className="font-serif text-xs uppercase tracking-widest">
          {t("prefs.q3")}
        </Label>
        <div className="flex flex-wrap gap-2">
          {SPICES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...value, spice: s })}
              className={`rounded-md border-2 px-3 py-2 font-serif text-sm tracking-wide transition-colors ${
                value.spice === s
                  ? "border-mustard bg-mustard/30 text-ink"
                  : "border-border bg-paper-deep/40 text-ink hover:bg-paper-deep/70"
              }`}
            >
              {t(`prefs.spice.${s}` as never)}
            </button>
          ))}
        </div>
      </div>

      {/* Dislikes */}
      <div className="grid gap-1.5">
        <Label htmlFor="prefs-dislikes" className="font-serif text-xs uppercase tracking-widest">
          {t("prefs.q4")}
        </Label>
        <Input
          id="prefs-dislikes"
          value={value.dislikes}
          onChange={(e) => onChange({ ...value, dislikes: e.target.value })}
          placeholder={t("prefs.dislikesPlaceholder")}
          className="h-11 border-2 bg-paper-deep/40 font-body text-base shadow-inset"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        {onSkip && (
          <Button type="button" variant="outline" onClick={onSkip}>
            {skipLabel}
          </Button>
        )}
        <Button type="submit" className="font-serif tracking-wide shadow-stamp">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
