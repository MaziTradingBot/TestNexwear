"use client";

import { createContext, useContext, useCallback } from "react";
import { translate, type Locale, LOCALES } from "@/lib/i18n/messages";

type I18nValue = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue>({
  locale: "en",
  t: (k) => translate("en", k),
  setLocale: () => {},
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (!LOCALES.includes(next)) return;
    // Persist for a year, then reload so server components re-render in the new language.
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }, []);

  return <I18nContext.Provider value={{ locale, t, setLocale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Shorthand translation hook. */
export function useT() {
  return useContext(I18nContext).t;
}
