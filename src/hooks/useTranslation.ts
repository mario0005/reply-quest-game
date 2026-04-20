import { useSyncExternalStore } from "react";
import { langStore } from "@/i18n/langStore";
import { translations, type Lang, type TranslationKey } from "@/i18n/translations";

export function useTranslation() {
  const lang = useSyncExternalStore(langStore.subscribe, langStore.get, langStore.get);
  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.en[key] ?? key;
  return {
    lang,
    t,
    setLang: (l: Lang) => langStore.set(l),
    toggleLang: () => langStore.toggle(),
  };
}
