"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-ink">
        <Check className="h-5 w-5 text-gold" />
        Thank you — you&apos;re on the list.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md items-center border-b border-ink">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 bg-transparent py-3 text-sm text-ink placeholder:text-mist focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 py-3 pl-4 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink hover:text-gold disabled:opacity-50"
      >
        {compact ? "" : "Subscribe"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
