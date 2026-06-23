import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const [user, orders, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.address.findMany({ where: { userId: session.user.id } }),
  ]);

  if (!user) redirect("/login");

  return (
    <AccountDashboard
      isAdmin={user.role === "ADMIN"}
      user={{ name: user.name ?? "Customer", email: user.email, loyaltyPoints: user.loyaltyPoints }}
      orders={orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        trackingNumber: o.trackingNumber,
        deliveryMethod: o.deliveryMethod,
        estimatedDelivery: o.estimatedDelivery?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
        itemCount: o._count.items,
      }))}
      addresses={addresses.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        country: a.country,
        city: a.city,
        address: a.address,
        postalCode: a.postalCode,
      }))}
    />
  );
}
