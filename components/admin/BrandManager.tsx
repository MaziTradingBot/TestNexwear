"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Brand = { id: string; name: string; isPremium: boolean; productCount: number };

export function BrandManager({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [form, setForm] = useState({ name: "", isPremium: false, heroImage: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, heroImage: form.heroImage || null, description: form.description || null }),
    });
    setSaving(false);
    if (res.ok) {
      show("Brand created");
      setForm({ name: "", isPremium: false, heroImage: "", description: "" });
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Could not create brand");
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete brand "${name}"?`)) return;
    const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    if (res.ok) { show("Brand deleted"); router.refresh(); }
    else { const d = await res.json(); show(d.error ?? "Could not delete"); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form onSubmit={create} className="h-fit space-y-4 border border-line bg-white p-6">
        <h3 className="text-sm font-medium uppercase tracking-wide2">New Brand</h3>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </Field>
        <Field label="Hero Image URL (optional)">
          <Input value={form.heroImage} onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))} placeholder="https://…" />
        </Field>
        <Field label="Description (optional)">
          <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} className="h-4 w-4" />
          Premium house
        </label>
        {error && <p className="text-xs text-sale">{error}</p>}
        <Button type="submit" full disabled={saving}><Plus className="h-4 w-4" /> {saving ? "Saving…" : "Add Brand"}</Button>
      </form>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
              <th className="px-5 py-3">Brand</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0 hover:bg-bone/50">
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 text-stone">{b.productCount}</td>
                <td className="px-5 py-3">{b.isPremium ? <Badge variant="gold">Premium</Badge> : <span className="text-stone">Standard</span>}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(b.id, b.name)} className="text-stone hover:text-sale" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
