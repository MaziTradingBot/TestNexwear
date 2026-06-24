/**
 * A stable "ends in 3 days, end of day" target for demo flash sales.
 * Lives in a plain (non-"use client") module so server components can call it.
 */
export function demoSaleTarget(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 0);
  d.setDate(d.getDate() + 3);
  return d.getTime();
}
