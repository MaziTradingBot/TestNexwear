"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/** Social sharing + copy-link for a product. */
export function ProductShare({ title }: { title: string }) {
  const show = useToast((s) => s.show);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${enc}&text=${text}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${enc}&description=${text}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${enc}` },
  ];

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user dismissed */
      }
    } else {
      copyLink();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      show("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      show("Could not copy link");
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
      <span className="mr-1 flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-stone">
        <Share2 className="h-4 w-4" /> Share
      </span>
      <button
        onClick={nativeShare}
        className="border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink"
      >
        Share…
      </button>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink"
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
