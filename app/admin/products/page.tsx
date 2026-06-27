import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
  });

  const products = rows.map((p) => ({
    id: p.id,
    title: p.title,
    sku: p.sku,
    brand: p.brand.name,
    category: p.category.name,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    isActive: p.isActive,
    variants: p.variants.length,
    stock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Products"
        description={`${products.length} product${products.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/admin/products/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Product</Button>
          </Link>
        }
      />
      <AdminCard className="overflow-x-auto">
        <ProductsTable products={products} />
      </AdminCard>
    </div>
  );
}
