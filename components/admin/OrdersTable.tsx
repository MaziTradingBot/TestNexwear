"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { formatPrice, formatDate } from "@/lib/format";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);

  async function update(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { show("Order updated"); router.refresh(); }
    else show("Could not update order");
  }

  if (orders.length === 0) {
    return <p className="p-12 text-center text-sm text-stone">No orders yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
          <th className="px-5 py-3">Order</th>
          <th className="px-5 py-3">Customer</th>
          <th className="px-5 py-3">Items</th>
          <th className="px-5 py-3">Total</th>
          <th className="px-5 py-3">Date</th>
          <th className="px-5 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b border-line last:border-0 hover:bg-bone/50">
            <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
            <td className="px-5 py-3 text-stone">
              <p className="text-ink">{o.customerName}</p>
              <p className="text-[0.65rem] text-mist">{o.customerEmail}</p>
            </td>
            <td className="px-5 py-3 text-stone">{o.itemCount}</td>
            <td className="px-5 py-3">{formatPrice(o.total)}</td>
            <td className="px-5 py-3 text-stone">{formatDate(o.createdAt)}</td>
            <td className="px-5 py-3">
              <select
                value={o.status}
                onChange={(e) => update(o.id, e.target.value)}
                className="border border-line bg-white px-2 py-1.5 text-xs focus:border-ink focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
