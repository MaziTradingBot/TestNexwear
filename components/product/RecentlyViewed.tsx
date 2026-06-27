"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewedStore } from "@/store/recently-viewed";
import { useMoney } from "@/components/providers/CurrencyProvider";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [mounted, setMounted] = useState(false);
  const items = useRecentlyViewedStore((s) => s.items);
  const { format: formatPrice } = useMoney();
  useEffect(() => setMounted(true), []);

  const list = items.filter((i) => i.productId !== excludeId).slice(0, 6);
  if (!mounted || list.length === 0) return null;

  return (
    <section className="container-luxe py-16">
      <div className="mb-8">
        <p className="eyebrow mb-2">Recently Viewed</p>
        <h2 className="font-serif text-2xl font-light uppercase tracking-wide2">Pick Up Where You Left Off</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {list.map((p) => (
          <Link key={p.productId} href={`/product/${p.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-bone">
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 text-[0.65rem] uppercase tracking-wide2 text-stone">{p.brand}</p>
            <p className="truncate text-xs text-ink">{p.title}</p>
            <p className="text-xs text-ink">{formatPrice(p.discountPrice ?? p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
