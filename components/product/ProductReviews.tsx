"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Stars } from "@/components/ui/stars";
import { Field, Textarea, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  author: string;
  isVerified: boolean;
  createdAt: string;
};

export function ProductReviews({
  productId,
  rating,
  reviewCount,
  reviews,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
  reviews: ReviewItem[];
}) {
  const { data: session } = useSession();
  const show = useToast((s) => s.show);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      if (res.ok) {
        show("Review submitted for moderation");
        setOpen(false);
        setForm({ rating: 5, title: "", comment: "" });
      } else {
        show("Could not submit review");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-line pt-12">
      <div className="grid gap-10 md:grid-cols-[300px_1fr]">
        {/* Summary */}
        <div>
          <h2 className="font-serif text-2xl font-light uppercase tracking-wide2">Reviews</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif text-5xl">{rating.toFixed(1)}</span>
            <div>
              <Stars rating={rating} size={16} />
              <p className="mt-1 text-xs text-stone">{reviewCount} reviews</p>
            </div>
          </div>
          {session ? (
            <Button variant="outline" className="mt-6" onClick={() => setOpen(true)}>
              Write a Review
            </Button>
          ) : (
            <Link href="/login" className="mt-6 inline-block">
              <Button variant="outline">Sign in to Review</Button>
            </Link>
          )}
        </div>

        {/* List */}
        <div className="space-y-8">
          {reviews.length === 0 && (
            <p className="text-sm text-stone">No reviews yet — be the first to share your thoughts.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-line pb-8 last:border-0">
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="text-xs text-mist">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && <p className="mt-3 text-sm font-medium text-ink">{r.title}</p>}
              <p className="mt-2 text-sm leading-relaxed text-stone">{r.comment}</p>
              <p className="mt-3 text-xs text-stone">
                {r.author}
                {r.isVerified && <span className="ml-2 text-gold">✓ Verified Buyer</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Write a Review" className="max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="label">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: n }))}
                  aria-label={`${n} stars`}
                >
                  <Star className={cn("h-7 w-7", n <= form.rating ? "fill-gold text-gold" : "text-line")} />
                </button>
              ))}
            </div>
          </div>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Sum up your experience"
            />
          </Field>
          <Field label="Review">
            <Textarea
              required
              rows={4}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="What did you think?"
            />
          </Field>
          <Button type="submit" full disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      </Dialog>
    </section>
  );
}
