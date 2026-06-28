import Link from "next/link";
import { Package, ShoppingCart, DollarSign, Users, Tag, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { SalesChart, type SalesPoint } from "@/components/admin/SalesChart";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const chartStart = new Date();
  chartStart.setHours(0, 0, 0, 0);
  chartStart.setDate(chartStart.getDate() - 13);

  const [productCount, orderCount, customerCount, brandCount, paidAgg, recentOrders, stockRows, salesRows] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.brand.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: { in: ["PAID", "SIMULATED"] } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { _count: { select: { items: true } } },
      }),
      prisma.product.findMany({ where: { isActive: true }, select: { variants: { select: { stock: true } } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: chartStart }, paymentStatus: { in: ["PAID", "SIMULATED"] } },
        select: { createdAt: true, total: true },
      }),
    ]);

  const revenue = Number(paidAgg._sum.total ?? 0);
  const lowStock = stockRows.filter((p) => p.variants.reduce((s, v) => s + v.stock, 0) <= 5).length;

  // Build 14 daily buckets for the sales chart.
  const buckets = new Map<number, { revenue: number; orders: number }>();
  for (let i = 0; i < 14; i++) {
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

  const cards = [
    { label: "Revenue", value: formatPrice(revenue), icon: DollarSign },
    { label: "Orders", value: orderCount.toString(), icon: ShoppingCart },
    { label: "Products", value: productCount.toString(), icon: Package },
    { label: "Customers", value: customerCount.toString(), icon: Users },
    { label: "Brands", value: brandCount.toString(), icon: Tag },
    { label: "Low Stock", value: lowStock.toString(), icon: AlertTriangle },
  ];

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Dashboard" description="Overview of your store performance." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <AdminCard key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wide2 text-stone">{c.label}</span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-3 font-serif text-3xl text-ink">{c.value}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-6 p-6">
        <SalesChart data={salesData} />
      </AdminCard>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light uppercase tracking-wide2">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-wide2 text-ink underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <AdminCard>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-stone">
              <Clock className="h-8 w-8 text-mist" strokeWidth={1} />
              <p className="text-sm">No orders yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-stone">{o.customerName}</td>
                    <td className="px-5 py-3 text-stone">{o._count.items}</td>
                    <td className="px-5 py-3">{formatPrice(Number(o.total))}</td>
                    <td className="px-5 py-3"><Badge variant="default">{o.status}</Badge></td>
                    <td className="px-5 py-3 text-stone">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
