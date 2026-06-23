import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { color: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, department: true } }),
  ]);

  if (!product) notFound();

  const initial: Partial<ProductFormValues> = {
    title: product.title,
    sku: product.sku,
    description: product.description,
    brandId: product.brandId,
    categoryId: product.categoryId,
    price: String(Number(product.price)),
    discountPrice: product.discountPrice ? String(Number(product.discountPrice)) : "",
    material: product.material ?? "",
    collection: product.collection ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    images: product.images.length ? product.images.map((i) => i.url) : [""],
    variants: product.variants.length
      ? product.variants.map((v) => ({ size: v.size, color: v.color, colorHex: v.colorHex ?? "#111111", stock: String(v.stock) }))
      : [{ size: "", color: "", colorHex: "#111111", stock: "0" }],
  };

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Edit Product" description={product.title} />
      <ProductForm
        productId={product.id}
        brands={brands}
        categories={categories.map((c) => ({ id: c.id, name: `${c.name} (${c.department})` }))}
        initial={initial}
      />
    </div>
  );
}
