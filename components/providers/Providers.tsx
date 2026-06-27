"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import type { Locale } from "@/lib/i18n/messages";
import type { CurrencyCode } from "@/lib/currency";

export function Providers({
  locale = "en",
  currency = "USD",
  children,
}: {
  locale?: Locale;
  currency?: CurrencyCode;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <I18nProvider locale={locale}>
        <CurrencyProvider currency={currency}>
          {children}
          <Toaster />
        </CurrencyProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
