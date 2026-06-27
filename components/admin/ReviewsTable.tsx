"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";

export type AdminReview = {
  id: string;
  product: string;
  author: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
};

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [busy, setBusy] = useState<string | null>(null);

  async function setApproved(id: string, isApproved: boolean) {
    setBusy(id);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    setBusy(null);
    if (res.ok) { show(isApproved ? "Review approved" : "Review unpublished"); router.refresh(); }
    else show("Could not update review");
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) { show("Review deleted"); router.refresh(); }
    else show("Could not delete review");
  }

  if (reviews.length === 0) {
    return <p className="p-12 text-center text-sm text-stone">No reviews yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
          <th className="px-5 py-3">Review</th>
          <th className="px-5 py-3">Product</th>
          <th className="px-5 py-3">Status</th>
          <th className="px-5 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((r) => (
          <tr key={r.id} className="border-b border-line align-top last:border-0 hover:bg-bone/40">
            <td className="px-5 py-4">
              <Stars rating={r.rating} />
              {r.title && <p className="mt-1.5 text-sm font-medium text-ink">{r.title}</p>}
              <p className="mt-1 max-w-md text-sm text-stone">{r.comment}</p>
              <p className="mt-1.5 text-[0.7rem] text-mist">
                {r.author}{r.isVerified && " · ✓ Verified"} · {formatDate(r.createdAt)}
              </p>
            </td>
            <td className="px-5 py-4 text-stone">{r.product}</td>
            <td className="px-5 py-4">
              <Badge variant={r.isApproved ? "gold" : "default"}>{r.isApproved ? "Published" : "Pending"}</Badge>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center justify-end gap-3">
                {r.isApproved ? (
                  <button onClick={() => setApproved(r.id, false)} disabled={busy === r.id} className="flex items-center gap-1 text-xs text-stone hover:text-ink disabled:opacity-50">
                    <Undo2 className="h-4 w-4" /> Unpublish
                  </button>
                ) : (
                  <button onClick={() => setApproved(r.id, true)} disabled={busy === r.id} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark disabled:opacity-50">
                    <Check className="h-4 w-4" /> Approve
                  </button>
                )}
                <button onClick={() => remove(r.id)} disabled={busy === r.id} className="text-stone hover:text-sale disabled:opacity-50" aria-label="Delete">
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
