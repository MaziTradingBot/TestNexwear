"use client";

import Link from "next/link";

export function BrandMarquee({ brands }: { brands: { name: string; slug: string }[] }) {
  if (brands.length === 0) return null;
  const items = [...brands, ...brands];
  return (
    <section className="border-y border-line bg-white py-10">
      <div className="marquee-paused overflow-hidden">
        <div className="marquee-track flex w-max items-center whitespace-nowrap">
          {items.map((b, i) => (
            <Link
              key={`${b.slug}-${i}`}
              href={`/brands/${b.slug}`}
              className="mx-10 font-serif text-2xl font-medium uppercase tracking-wide2 text-stone transition-colors hover:text-ink"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
