import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBrands } from "@/lib/queries";
import { SectionHeader } from "@/components/layout/SectionHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brands",
  description: "Discover the designers and labels we love at NexWear — premium and emerging fashion brands.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const premium = brands.filter((b) => b.isPremium);
  const all = brands;

  return (
    <div className="container-luxe py-12">
      <div className="border-b border-line pb-10 text-center">
        <p className="eyebrow mb-3">The Designer Edit</p>
        <h1 className="font-serif text-4xl font-light uppercase tracking-wide2 md:text-5xl">
          Our Brands
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-stone">
          From established houses to emerging labels — a curated roster of the brands
          defining modern luxury.
        </p>
      </div>

      {/* Premium showcase */}
      {premium.length > 0 && (
        <section className="py-12">
          <SectionHeader eyebrow="Featured" title="Premium Houses" />
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {premium.slice(0, 6).map((b) => (
              <Link key={b.id} href={`/brands/${b.slug}`} className="group relative block bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {b.heroImage && (
                    <Image
                      src={b.heroImage}
                      alt={b.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform [transition-duration:1200ms] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-ink/30 transition-colors group-hover:bg-ink/45" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                    <h3 className="font-serif text-2xl font-medium uppercase tracking-wide2">{b.name}</h3>
                    <span className="mt-2 text-[0.65rem] uppercase tracking-luxe text-white/80">
                      {b.productCount} pieces
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All brands A–Z */}
      <section className="py-8">
        <SectionHeader eyebrow="A–Z" title="All Brands" />
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4">
          {all.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="group flex flex-col items-center justify-center gap-1 bg-white px-4 py-10 text-center transition-colors hover:bg-bone"
            >
              <span className="font-serif text-xl font-medium uppercase tracking-wide2 text-ink group-hover:text-gold">
                {b.name}
              </span>
              <span className="text-[0.65rem] uppercase tracking-wide2 text-mist">
                {b.productCount} items
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
