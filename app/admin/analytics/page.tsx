import { DollarSign, ShoppingCart, TrendingUp, Package, Users, UserPlus, XCircle, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { SalesChart, type SalesPoint } from "@/components/admin/SalesChart";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAID: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.SIMULATED];
const DAY = 86_400_000;

function startOfTodayMinus(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AnalyticsPage() {
  const chartStart = startOfTodayMinus(29); // 30-day window
  const since90 = new Date(Date.now() - 90 * DAY);
  const since30 = new Date(Date.now() - 30 * DAY);

  const [
    paidAgg,
    unitsAgg,
    customerCount,
    newCustomers,
    cancelledCount,
    codAgg,
    salesRows,
    byMethod,
    byStatus,
    lineItems,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true, discount: true }, _count: true, where: { paymentStatus: { in: PAID } } }),
    prisma.orderItem.aggregate({ _sum: { quantity: true }, where: { order: { paymentStatus: { in: PAID } } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
    prisma.order.count({ where: { status: { in: [OrderStatus.CANCELLED, OrderStatus.RETURNED] } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { paymentStatus: PaymentStatus.COD_PENDING } }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartStart }, paymentStatus: { in: PAID } },
      select: { createdAt: true, total: true },
    }),
    prisma.order.groupBy({ by: ["paymentMethod"], _sum: { total: true }, _count: true, where: { paymentStatus: { in: PAID } } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.orderItem.findMany({
      where: { order: { paymentStatus: { in: PAID }, createdAt: { gte: since90 } } },
      select: { productId: true, title: true, unitPrice: true, quantity: true },
    }),
  ]);

  const revenue = Number(paidAgg._sum.total ?? 0);
  const paidOrders = paidAgg._count;
  const unitsSold = unitsAgg._sum.quantity ?? 0;
  const aov = paidOrders > 0 ? revenue / paidOrders : 0;
  const discountsGiven = Number(paidAgg._sum.discount ?? 0);

  // 30 daily buckets for the revenue chart.
  const buckets = new Map<number, { revenue: number; orders: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    buckets.set(d.getTime(), { revenue: 0, orders: 0 });
  }
  for (const o of salesRows) {
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const b = buckets.get(d.getTime());
    if (b) { b.revenue += Number(o.total); b.orders += 1; }
  }
  const salesData: SalesPoint[] = Array.from(buckets, ([ts, v]) => {
    const d = new Date(ts);
    return {
      label: String(d.getDate()),
      full: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: v.revenue,
      orders: v.orders,
    };
  });

  // Aggregate line items by product → top sellers + category revenue.
  const productIds = [...new Set(lineItems.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, category: { select: { name: true } }, brand: { select: { name: true } } },
  });
  const pmap = new Map(products.map((p) => [p.id, p]));

  const prodAgg = new Map<string, { title: string; revenue: number; units: number }>();
  const catAgg = new Map<string, number>();
  for (const i of lineItems) {
    const rev = Number(i.unitPrice) * i.quantity;
    const p = prodAgg.get(i.productId) ?? { title: pmap.get(i.productId)?.title ?? i.title, revenue: 0, units: 0 };
    p.revenue += rev; p.units += i.quantity;
    prodAgg.set(i.productId, p);
    const cat = pmap.get(i.productId)?.category?.name ?? "Other";
    catAgg.set(cat, (catAgg.get(cat) ?? 0) + rev);
  }
  const topProducts = [...prodAgg.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const categoryRows = [...catAgg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const catMax = Math.max(1, ...categoryRows.map(([, v]) => v));

  const statusMap = new Map(byStatus.map((s) => [s.status, s._count]));

  const cards = [
    { label: "Revenue (paid)", value: formatPrice(revenue), icon: DollarSign },
    { label: "Paid Orders", value: String(paidOrders), icon: ShoppingCart },
    { label: "Avg. Order Value", value: formatPrice(aov), icon: TrendingUp },
    { label: "Units Sold", value: String(unitsSold), icon: Package },
    { label: "Customers", value: String(customerCount), icon: Users },
    { label: "New (30d)", value: String(newCustomers), icon: UserPlus },
    { label: "Discounts Given", value: formatPrice(discountsGiven), icon: CreditCard },
    { label: "Cancelled / Returned", value: String(cancelledCount), icon: XCircle },
  ];

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Analytics" description="Sales, revenue and customer performance." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <AdminCard key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wide2 text-stone">{c.label}</span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-3 font-serif text-2xl text-ink">{c.value}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-6 p-6">
        <p className="mb-1 text-[0.65rem] uppercase tracking-wide2 text-stone">Revenue · last 30 days</p>
        <SalesChart data={salesData} />
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <AdminCard className="p-6">
          <h2 className="mb-4 font-serif text-lg font-light uppercase tracking-wide2">Top Products · 90d</h2>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone">No sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.6rem] uppercase tracking-wide2 text-stone">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Units</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.title} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3">{p.title}</td>
                    <td className="py-2.5 text-right text-stone">{p.units}</td>
                    <td className="py-2.5 text-right font-medium">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AdminCard>

        {/* Revenue by category */}
        <AdminCard className="p-6">
          <h2 className="mb-4 font-serif text-lg font-light uppercase tracking-wide2">Revenue by Category · 90d</h2>
          {categoryRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {categoryRows.map(([name, value]) => (
                <li key={name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink">{name}</span>
                    <span className="text-stone">{formatPrice(value)}</span>
                  </div>
                  <div className="h-2 w-full bg-line">
                    <div className="h-full bg-gold/50" style={{ width: `${Math.max(3, (value / catMax) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {/* Revenue by payment method */}
        <AdminCard className="p-6">
          <h2 className="mb-4 font-serif text-lg font-light uppercase tracking-wide2">By Payment Method</h2>
          <table className="w-full text-sm">
            <tbody>
              {byMethod.map((m) => (
                <tr key={m.paymentMethod} className="border-b border-line last:border-0">
                  <td className="py-2.5">{m.paymentMethod.replace(/_/g, " ")}</td>
                  <td className="py-2.5 text-right text-stone">{m._count} order{m._count !== 1 ? "s" : ""}</td>
                  <td className="py-2.5 text-right font-medium">{formatPrice(Number(m._sum.total ?? 0))}</td>
                </tr>
              ))}
              {Number(codAgg._count) > 0 && (
                <tr className="border-b border-line last:border-0 text-stone">
                  <td className="py-2.5">Cash on Delivery (pending)</td>
                  <td className="py-2.5 text-right">{codAgg._count} order{codAgg._count !== 1 ? "s" : ""}</td>
                  <td className="py-2.5 text-right">{formatPrice(Number(codAgg._sum.total ?? 0))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminCard>

        {/* Order status breakdown */}
        <AdminCard className="p-6">
          <h2 className="mb-4 font-serif text-lg font-light uppercase tracking-wide2">Order Status</h2>
          <div className="flex flex-wrap gap-2">
            {(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const).map((s) => (
              <div key={s} className="flex items-center gap-2 border border-line px-3 py-2 text-sm">
                <Badge variant={s === "CANCELLED" || s === "RETURNED" ? "sale" : s === "DELIVERED" || s === "PAID" ? "gold" : "default"}>{s}</Badge>
                <span className="font-medium text-ink">{statusMap.get(s) ?? 0}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
