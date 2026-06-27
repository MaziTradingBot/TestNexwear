"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useMoney } from "@/components/providers/CurrencyProvider";
import { cn } from "@/lib/cn";

export function CurrencySwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useMoney();

  return (
    <div className={cn("relative", className)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink hover:text-gold"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currency}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-50 w-32 border border-line bg-cream py-1 shadow-lg" role="listbox">
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                onClick={() => {
                  setOpen(false);
                  if (c.code !== currency) setCurrency(c.code as CurrencyCode);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2 text-left text-xs hover:bg-bone",
                  c.code === currency && "text-gold",
                )}
                role="option"
                aria-selected={c.code === currency}
              >
                {c.code}
                <span className="text-mist">{c.symbol}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
