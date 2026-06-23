import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: [{ department: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const categories = rows.map((c) => ({ id: c.id, name: c.name, department: c.department, productCount: c._count.products }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Categories" description={`${categories.length} categories`} />
      <CategoryManager categories={categories} />
    </div>
  );
}
