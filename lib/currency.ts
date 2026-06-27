// Static, indicative exchange rates (USD base). For a production store you'd
// refresh these from a rates API; fine for display here.

export const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1, locale: "en-US" },
  { code: "EUR", symbol: "€", rate: 0.92, locale: "de-DE" },
  { code: "GBP", symbol: "£", rate: 0.79, locale: "en-GB" },
  { code: "CAD", symbol: "C$", rate: 1.36, locale: "en-CA" },
  { code: "CHF", symbol: "CHF", rate: 0.88, locale: "de-CH" },
  { code: "PLN", symbol: "zł", rate: 4.0, locale: "pl-PL" },
  { code: "UAH", symbol: "₴", rate: 41, locale: "uk-UA" },
  { code: "SEK", symbol: "kr", rate: 10.6, locale: "sv-SE" },
  { code: "NOK", symbol: "kr", rate: 10.8, locale: "nb-NO" },
  { code: "DKK", symbol: "kr", rate: 6.9, locale: "da-DK" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Format a USD amount in the target currency. */
export function formatMoney(amountUSD: number | string, code: string): string {
  const c = getCurrency(code);
  const usd = typeof amountUSD === "string" ? parseFloat(amountUSD) : amountUSD;
  const value = (Number.isFinite(usd) ? usd : 0) * c.rate;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${c.symbol}${value.toFixed(2)}`;
  }
}
