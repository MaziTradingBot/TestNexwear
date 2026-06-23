import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { items: true } } },
  });

  const orders = rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    itemCount: o._count.items,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Orders" description={`${orders.length} orders`} />
      <AdminCard className="overflow-x-auto">
        <OrdersTable orders={orders} />
      </AdminCard>
    </div>
  );
}
