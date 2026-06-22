"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/cn";

/**
 * Language switcher. Phase 1 ships the UI + English active; the i18n dictionary
 * layer (8 locales) is wired in a later phase.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("en");
  const current = LANGUAGES.find((l) => l.code === active) ?? LANGUAGES[0];

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
                  setActive(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2 text-left text-xs hover:bg-bone",
                  l.code === active && "text-gold",
                )}
                role="option"
                aria-selected={l.code === active}
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
