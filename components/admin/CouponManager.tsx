"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  isActive: boolean;
  usedCount: number;
};

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "", minSpend: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        minSpend: form.minSpend ? parseFloat(form.minSpend) : 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      show("Coupon created");
      setForm({ code: "", type: "PERCENT", value: "", minSpend: "" });
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Could not create coupon");
    }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) { show("Coupon deleted"); router.refresh(); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form onSubmit={create} className="h-fit space-y-4 border border-line bg-white p-6">
        <h3 className="text-sm font-medium uppercase tracking-wide2">New Coupon</h3>
        <Field label="Code">
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="WELCOME10" />
        </Field>
        <Field label="Type">
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-line bg-white px-3 py-2.5 text-sm focus:border-ink focus:outline-none">
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount ($)</option>
          </select>
        </Field>
        <Field label={form.type === "PERCENT" ? "Percent off" : "Amount off (USD)"}>
          <Input type="number" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} required />
        </Field>
        <Field label="Minimum spend (optional)">
          <Input type="number" step="0.01" value={form.minSpend} onChange={(e) => setForm((f) => ({ ...f, minSpend: e.target.value }))} placeholder="0" />
        </Field>
        {error && <p className="text-xs text-sale">{error}</p>}
        <Button type="submit" full disabled={saving}><Plus className="h-4 w-4" /> {saving ? "Saving…" : "Add Coupon"}</Button>
      </form>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Min Spend</th>
              <th className="px-5 py-3">Used</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bone/50">
                <td className="px-5 py-3 font-medium">{c.code}</td>
                <td className="px-5 py-3">{c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="px-5 py-3 text-stone">{c.minSpend > 0 ? formatPrice(c.minSpend) : "—"}</td>
                <td className="px-5 py-3 text-stone">{c.usedCount}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggle(c.id, c.isActive)}>
                    <Badge variant={c.isActive ? "gold" : "default"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(c.id, c.code)} className="text-stone hover:text-sale" aria-label="Delete">
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
