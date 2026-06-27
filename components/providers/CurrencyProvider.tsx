"use client";

import { createContext, useContext, useCallback } from "react";
import { formatMoney, CURRENCIES, type CurrencyCode } from "@/lib/currency";

type CurrencyValue = {
  currency: CurrencyCode;
  format: (amountUSD: number | string) => string;
  setCurrency: (code: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyValue>({
  currency: "USD",
  format: (a) => formatMoney(a, "USD"),
  setCurrency: () => {},
});

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyCode;
  children: React.ReactNode;
}) {
  const format = useCallback((amountUSD: number | string) => formatMoney(amountUSD, currency), [currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    document.cookie = `currency=${code}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }, []);

  return <CurrencyContext.Provider value={{ currency, format, setCurrency }}>{children}</CurrencyContext.Provider>;
}

/** Returns a `format(usdAmount)` helper plus the active currency + setter. */
export function useMoney() {
  return useContext(CurrencyContext);
}
