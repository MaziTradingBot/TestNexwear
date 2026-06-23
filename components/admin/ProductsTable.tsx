"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";

export type AdminProduct = {
  id: string;
  title: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  discountPrice: number | null;
  isActive: boolean;
  variants: number;
};

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function remove(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      show("Product deleted");
      router.refresh();
    } else {
      show("Could not delete product");
    }
  }

  if (products.length === 0) {
    return <p className="p-12 text-center text-sm text-stone">No products yet. Click “Add Product” to create one.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
          <th className="px-5 py-3">Product</th>
          <th className="px-5 py-3">Brand</th>
          <th className="px-5 py-3">Category</th>
          <th className="px-5 py-3">Price</th>
          <th className="px-5 py-3">Variants</th>
          <th className="px-5 py-3">Status</th>
          <th className="px-5 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-b border-line last:border-0 hover:bg-bone/50">
            <td className="px-5 py-3">
              <p className="font-medium text-ink">{p.title}</p>
              <p className="text-[0.65rem] text-mist">{p.sku}</p>
            </td>
            <td className="px-5 py-3 text-stone">{p.brand}</td>
            <td className="px-5 py-3 text-stone">{p.category}</td>
            <td className="px-5 py-3">
              {p.discountPrice ? (
                <span className="text-sale">{formatPrice(p.discountPrice)}</span>
              ) : (
                formatPrice(p.price)
              )}
            </td>
            <td className="px-5 py-3 text-stone">{p.variants}</td>
            <td className="px-5 py-3">
              <Badge variant={p.isActive ? "gold" : "default"}>{p.isActive ? "Active" : "Hidden"}</Badge>
            </td>
            <td className="px-5 py-3">
              <div className="flex items-center justify-end gap-2">
                <Link href={`/admin/products/${p.id}`} className="text-stone hover:text-ink" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => remove(p.id, p.title)}
                  disabled={deleting === p.id}
                  className="text-stone hover:text-sale disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
