import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CouponManager } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons = rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type as "PERCENT" | "FIXED",
    value: Number(c.value),
    minSpend: Number(c.minSpend),
    isActive: c.isActive,
    usedCount: c.usedCount,
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Coupons" description={`${coupons.length} coupons`} />
      <CouponManager coupons={coupons} />
    </div>
  );
}
