"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/** Lets a customer cancel an order that hasn't shipped yet. */
export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Cancel this order? If it was paid, you'll be refunded.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/account/orders/${orderNumber}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(data.error ?? "Could not cancel the order");
        return;
      }
      show(data.refunded ? "Order cancelled — refund issued" : "Order cancelled");
      router.refresh();
    } catch {
      show("Could not cancel the order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={cancel}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide2 text-sale underline-offset-4 hover:underline disabled:opacity-50"
    >
      <XCircle className="h-3.5 w-3.5" /> {loading ? "Cancelling…" : "Cancel Order"}
    </button>
  );
}
