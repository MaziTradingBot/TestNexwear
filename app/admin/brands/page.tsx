import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { BrandManager } from "@/components/admin/BrandManager";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const rows = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const brands = rows.map((b) => ({ id: b.id, name: b.name, isPremium: b.isPremium, productCount: b._count.products }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Brands" description={`${brands.length} brands`} />
      <BrandManager brands={brands} />
    </div>
  );
}
