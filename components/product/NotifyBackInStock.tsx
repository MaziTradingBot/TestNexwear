"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Back-in-stock waitlist form, shown on sold-out products. */
export function NotifyBackInStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
      } else {
        setError(data.error ?? "Could not sign you up. Please try again.");
        setState("error");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="mt-8 border border-line bg-bone p-6">
      <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide2 text-ink">
        <BellRing className="h-4 w-4 text-gold" /> Sold Out
      </p>
      {state === "done" ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-gold">
          <Check className="h-4 w-4" /> We&apos;ll email you the moment it&apos;s back.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs text-stone">
            Enter your email and we&apos;ll let you know as soon as this piece is restocked.
          </p>
          <form onSubmit={submit} className="mt-4 flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 border border-line bg-cream px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
            <Button type="submit" size="sm" disabled={state === "loading"} className="border-l-0">
              {state === "loading" ? "…" : "Notify Me"}
            </Button>
          </form>
          {error && <p className="mt-2 text-xs text-sale">{error}</p>}
        </>
      )}
    </div>
  );
}
