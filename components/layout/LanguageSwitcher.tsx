"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Locale } from "@/lib/i18n/messages";
import { cn } from "@/lib/cn";

/** Language switcher — changes the active locale for the whole storefront UI. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useI18n();
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div className={cn("relative", className)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink hover:text-gold"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.code.toUpperCase()}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <ul
          className="absolute right-0 top-full z-50 w-36 border border-line bg-white py-1 shadow-lg"
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setOpen(false);
                  if (l.code !== locale) setLocale(l.code as Locale);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2 text-left text-xs hover:bg-bone",
                  l.code === locale && "text-gold",
                )}
                role="option"
                aria-selected={l.code === locale}
              >
                {l.label}
                <span className="text-mist">{l.code.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
