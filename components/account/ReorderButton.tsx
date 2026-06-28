"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/toast";

/** Re-adds a past order's items to the bag, then opens the cart. */
export function ReorderButton({
  orderNumber,
  className = "",
}: {
  orderNumber: string;
  className?: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const show = useToast((s) => s.show);
  const [loading, setLoading] = useState(false);

  async function reorder() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(data.error ?? "Could not reorder");
        return;
      }
      const lines: Parameters<typeof addItem>[0][] = data.lines ?? [];
      if (lines.length === 0) {
        show("Those items are no longer available");
        return;
      }
      for (const line of lines) addItem(line);
      show(
        data.skipped > 0
          ? `Added ${lines.length} item${lines.length !== 1 ? "s" : ""} · ${data.skipped} unavailable`
          : `Added ${lines.length} item${lines.length !== 1 ? "s" : ""} to your bag`,
      );
      router.push("/cart");
    } catch {
      show("Could not reorder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={reorder}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide2 text-ink underline-offset-4 hover:underline disabled:opacity-50 ${className}`}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Reorder
    </button>
  );
}
