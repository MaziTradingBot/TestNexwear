"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/components/providers/I18nProvider";
import type { Locale } from "@/lib/i18n/messages";

export function Providers({
  locale = "en",
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <I18nProvider locale={locale}>
        {children}
        <Toaster />
      </I18nProvider>
    </SessionProvider>
  );
}
