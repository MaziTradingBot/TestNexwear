"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ProductCard } from "@/lib/queries";

const POPULAR = ["Linen Shirt", "Midi Dress", "Sneakers", "Blazer", "Tote Bag", "Chelsea Boot"];
const HISTORY_KEY = "nexwear-search-history";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      try {
        setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"));
      } catch {
        setHistory([]);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&perPage=6`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function submit(term: string) {
    const q = term.trim();
    if (!q) return;
    const next = [q, ...history.filter((h) => h !== q)].slice(0, 6);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="absolute inset-x-0 top-0 bg-white"
          >
            <div className="container-luxe py-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(query);
                }}
                className="flex items-center gap-4 border-b border-ink pb-4"
              >
                <Search className="h-5 w-5 text-stone" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands and more…"
                  className="flex-1 bg-transparent font-serif text-2xl text-ink placeholder:text-mist focus:outline-none"
                />
                <button type="button" onClick={onClose} aria-label="Close search">
                  <X className="h-5 w-5 text-ink hover:text-gold" />
                </button>
              </form>

              <div className="mt-6 grid gap-8 pb-8 md:grid-cols-[1fr_2fr]">
                <div className="space-y-6">
                  {history.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Recent Searches</p>
                      <ul className="space-y-1.5">
                        {history.map((h) => (
                          <li key={h}>
                            <button onClick={() => submit(h)} className="text-sm text-stone hover:text-ink">
                              {h}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-3">Popular</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR.map((p) => (
                        <button
                          key={p}
                          onClick={() => submit(p)}
                          className="border border-line px-3 py-1.5 text-xs text-ink hover:border-ink"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3">
                    {query ? (loading ? "Searching…" : "Results") : "Start typing to search"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="group"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                          {p.image && (
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="200px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <p className="mt-2 text-[0.7rem] uppercase tracking-wide2 text-stone">{p.brand}</p>
                        <p className="truncate text-xs text-ink">{p.title}</p>
                        <p className="text-xs text-ink">{formatPrice(p.discountPrice ?? p.price)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
