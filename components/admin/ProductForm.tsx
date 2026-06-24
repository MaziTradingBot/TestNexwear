"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Option = { id: string; name: string };

export type ProductFormValues = {
  title: string;
  sku: string;
  description: string;
  brandId: string;
  categoryId: string;
  price: string;
  discountPrice: string;
  material: string;
  collection: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  images: string[];
  variants: { size: string; color: string; colorHex: string; stock: string }[];
};

const EMPTY: ProductFormValues = {
  title: "", sku: "", description: "", brandId: "", categoryId: "",
  price: "", discountPrice: "", material: "", collection: "",
  isActive: true, isFeatured: false, isNewArrival: false,
  images: [""],
  variants: [{ size: "", color: "", colorHex: "#111111", stock: "0" }],
};

export function ProductForm({
  brands,
  categories,
  initial,
  productId,
}: {
  brands: Option[];
  categories: Option[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [form, setForm] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const { upload } = await import("@vercel/blob/client");
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        urls.push(res.url);
      }
      setForm((f) => ({ ...f, images: [...f.images.filter(Boolean), ...urls] }));
      show(urls.length > 1 ? `${urls.length} images uploaded` : "Image uploaded");
    } catch (e) {
      const msg = (e as Error).message ?? "";
      setError(
        msg.includes("store") || msg.includes("token") || msg.includes("BLOB")
          ? "Upload failed — connect a Vercel Blob store first (see setup)."
          : `Upload failed: ${msg || "please try again"}`,
      );
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title: form.title,
      sku: form.sku || undefined,
      description: form.description,
      brandId: form.brandId,
      categoryId: form.categoryId,
      price: parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      material: form.material || null,
      collection: form.collection || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      images: form.images.map((i) => i.trim()).filter(Boolean),
      variants: form.variants
        .filter((v) => v.size && v.color)
        .map((v) => ({ size: v.size, color: v.color, colorHex: v.colorHex || null, stock: parseInt(v.stock || "0", 10) })),
    };

    try {
      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save product");
        setSaving(false);
        return;
      }
      show(productId ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Main */}
      <div className="space-y-6">
        <div className="border border-line bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide2">Details</h3>
          <div className="space-y-4">
            <Field label="Product Name">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Material">
                <Input value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="Cotton" />
              </Field>
              <Field label="Collection">
                <Input value={form.collection} onChange={(e) => set("collection", e.target.value)} placeholder="Summer 2026" />
              </Field>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide2">Images</h3>
            <div className="flex items-center gap-4">
              <label className={`flex cursor-pointer items-center gap-1 text-xs ${uploading ? "text-mist" : "text-ink hover:text-gold"}`}>
                <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
              <button type="button" onClick={() => set("images", [...form.images, ""])} className="flex items-center gap-1 text-xs text-stone hover:text-ink">
                <Plus className="h-4 w-4" /> Paste URL
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-bone">
                  {url ? <Image src={url} alt="" fill className="object-cover" /> : null}
                </div>
                <Input
                  value={url}
                  onChange={(e) => set("images", form.images.map((u, j) => (j === i ? e.target.value : u)))}
                  placeholder="https://images.unsplash.com/..."
                />
                <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="text-mist hover:text-sale">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide2">Variants (size · color · stock)</h3>
            <button
              type="button"
              onClick={() => set("variants", [...form.variants, { size: "", color: "", colorHex: "#111111", stock: "0" }])}
              className="flex items-center gap-1 text-xs text-ink hover:text-gold"
            >
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </div>
          <div className="space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input className="w-20" placeholder="Size" value={v.size} onChange={(e) => set("variants", form.variants.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))} />
                <Input className="flex-1" placeholder="Color" value={v.color} onChange={(e) => set("variants", form.variants.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))} />
                <input type="color" value={v.colorHex} onChange={(e) => set("variants", form.variants.map((x, j) => (j === i ? { ...x, colorHex: e.target.value } : x)))} className="h-10 w-10 shrink-0 border border-line" />
                <Input className="w-20" type="number" placeholder="Stock" value={v.stock} onChange={(e) => set("variants", form.variants.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} />
                <button type="button" onClick={() => set("variants", form.variants.filter((_, j) => j !== i))} className="text-mist hover:text-sale">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="border border-line bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide2">Organize</h3>
          <div className="space-y-4">
            <Field label="Brand">
              <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)} required className="w-full border border-line bg-white px-3 py-2.5 text-sm focus:border-ink focus:outline-none">
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required className="w-full border border-line bg-white px-3 py-2.5 text-sm focus:border-ink focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="SKU (optional)">
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Auto-generated" />
            </Field>
          </div>
        </div>

        <div className="border border-line bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide2">Pricing</h3>
          <div className="space-y-4">
            <Field label="Price (USD)">
              <Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </Field>
            <Field label="Sale Price (optional)">
              <Input type="number" step="0.01" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} placeholder="Leave blank if not on sale" />
            </Field>
          </div>
        </div>

        <div className="border border-line bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide2">Status</h3>
          <div className="space-y-3 text-sm">
            {([["isActive", "Active (visible in store)"], ["isFeatured", "Featured"], ["isNewArrival", "New Arrival"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5">
                <input type="checkbox" checked={form[key] as boolean} onChange={(e) => set(key, e.target.checked)} className="h-4 w-4" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-sale">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" full disabled={saving}>{saving ? "Saving…" : productId ? "Update Product" : "Create Product"}</Button>
        </div>
        <button type="button" onClick={() => router.push("/admin/products")} className="w-full text-center text-xs text-stone hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
