import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, department: true } }),
  ]);

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Add Product" description="Create a new product for your store." />
      <ProductForm
        brands={brands}
        categories={categories.map((c) => ({ id: c.id, name: `${c.name} (${c.department})` }))}
      />
    </div>
  );
}
