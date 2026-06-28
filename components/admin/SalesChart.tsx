import { formatPrice } from "@/lib/format";

export type SalesPoint = { label: string; full: string; revenue: number; orders: number };

/** Lightweight, dependency-free bar chart of daily revenue. */
export function SalesChart({ data }: { data: SalesPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div>
      <div className="mb-5 flex items-end gap-6">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide2 text-stone">Revenue · 14 days</p>
          <p className="font-serif text-3xl text-ink">{formatPrice(totalRevenue)}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide2 text-stone">Orders</p>
          <p className="font-serif text-3xl text-ink">{totalOrders}</p>
        </div>
      </div>

      <div className="flex h-40 items-end gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full bg-gold/25 transition-colors hover:bg-gold/50"
                style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }}
                title={`${d.full}: ${formatPrice(d.revenue)} · ${d.orders} order${d.orders !== 1 ? "s" : ""}`}
              />
            </div>
            <span className="text-[0.55rem] text-mist">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
