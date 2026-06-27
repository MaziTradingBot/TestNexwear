import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Providers } from "@/components/providers/Providers";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { LOCALES, type Locale } from "@/lib/i18n/messages";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "luxury fashion", "designer clothing", "women's fashion", "men's fashion",
    "shoes", "accessories", "premium brands", "NexWear",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = cookies();
  const cookieLocale = jar.get("locale")?.value;
  const locale = (LOCALES.includes(cookieLocale as Locale) ? cookieLocale : "en") as Locale;
  const cookieCurrency = jar.get("currency")?.value;
  const currency = (CURRENCIES.some((c) => c.code === cookieCurrency) ? cookieCurrency : "USD") as CurrencyCode;

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers locale={locale} currency={currency}>
          <StoreChrome>{children}</StoreChrome>
        </Providers>
      </body>
    </html>
  );
}
