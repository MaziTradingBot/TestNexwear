"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Banner = {
  id: string;
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
  position: number;
  isActive: boolean;
};

const EMPTY = { eyebrow: "", title: "", subtitle: "", ctaLabel: "", ctaHref: "", imageUrl: "", position: "0" };

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        eyebrow: form.eyebrow || null,
        subtitle: form.subtitle || null,
        ctaLabel: form.ctaLabel || null,
        ctaHref: form.ctaHref || null,
        imageUrl: form.imageUrl,
        position: parseInt(form.position || "0", 10),
      }),
    });
    setSaving(false);
    if (res.ok) { show("Banner created"); setForm(EMPTY); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Could not create banner"); }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    if (res.ok) { show("Banner deleted"); router.refresh(); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <form onSubmit={create} className="h-fit space-y-4 border border-line bg-white p-6">
        <h3 className="text-sm font-medium uppercase tracking-wide2">New Banner</h3>
        <Field label="Image URL"><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} required placeholder="https://…" /></Field>
        <Field label="Eyebrow (small label)"><Input value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} placeholder="Summer Sale" /></Field>
        <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required placeholder="Up To 50% Off" /></Field>
        <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button text"><Input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="Shop Sale" /></Field>
          <Field label="Button link"><Input value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} placeholder="/sale" /></Field>
        </div>
        <Field label="Position (order)"><Input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} /></Field>
        {error && <p className="text-xs text-sale">{error}</p>}
        <Button type="submit" full disabled={saving}><Plus className="h-4 w-4" /> {saving ? "Saving…" : "Add Banner"}</Button>
      </form>

      <div className="space-y-4">
        {banners.length === 0 && <p className="border border-line p-10 text-center text-sm text-stone">No banners yet. Active banners appear in the homepage promo section.</p>}
        {banners.map((b) => (
          <div key={b.id} className="flex gap-4 border border-line bg-white p-4">
            <div className="relative h-20 w-32 shrink-0 overflow-hidden bg-bone">
              {b.imageUrl && <Image src={b.imageUrl} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1">
              {b.eyebrow && <p className="text-[0.6rem] uppercase tracking-wide2 text-stone">{b.eyebrow}</p>}
              <p className="font-medium text-ink">{b.title}</p>
              {b.subtitle && <p className="text-xs text-stone">{b.subtitle}</p>}
              <p className="mt-1 text-[0.65rem] text-mist">Pos {b.position}{b.ctaHref ? ` · → ${b.ctaHref}` : ""}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => toggle(b.id, b.isActive)}>
                <Badge variant={b.isActive ? "gold" : "default"}>{b.isActive ? "Active" : "Hidden"}</Badge>
              </button>
              <button onClick={() => remove(b.id)} className="text-stone hover:text-sale" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
