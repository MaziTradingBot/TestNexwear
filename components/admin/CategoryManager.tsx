"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Category = { id: string; name: string; department: string; productCount: number };
const DEPARTMENTS = ["men", "women", "shoes", "accessories"];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [form, setForm] = useState({ name: "", department: "women", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
    });
    setSaving(false);
    if (res.ok) {
      show("Category created");
      setForm({ name: "", department: "women", imageUrl: "" });
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Could not create category");
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) { show("Category deleted"); router.refresh(); }
    else { const d = await res.json(); show(d.error ?? "Could not delete"); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form onSubmit={create} className="h-fit space-y-4 border border-line bg-white p-6">
        <h3 className="text-sm font-medium uppercase tracking-wide2">New Category</h3>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. Coats" />
        </Field>
        <Field label="Department">
          <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="w-full border border-line bg-white px-3 py-2.5 text-sm capitalize focus:border-ink focus:outline-none">
            {DEPARTMENTS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        </Field>
        <Field label="Image URL (optional)">
          <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
        </Field>
        {error && <p className="text-xs text-sale">{error}</p>}
        <Button type="submit" full disabled={saving}><Plus className="h-4 w-4" /> {saving ? "Saving…" : "Add Category"}</Button>
      </form>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bone/50">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3"><Badge variant="default">{c.department}</Badge></td>
                <td className="px-5 py-3 text-stone">{c.productCount}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(c.id, c.name)} className="text-stone hover:text-sale" aria-label="Delete">
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
