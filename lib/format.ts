export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

/** Format a numeric price as a localized currency string. */
export function formatPrice(
  amount: number | string,
  currency: string = CURRENCY,
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Percentage discount between an original and current price. */
export function discountPercent(
  original: number,
  current: number,
): number {
  if (!original || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

/** Human-friendly date, e.g. "Jun 28, 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
