import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { demoSaleTarget } from "@/lib/sale";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import type { ProductCard } from "@/lib/queries";

export function FlashSale({ products }: { products: ProductCard[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-ink py-16 text-white">
      <div className="container-luxe">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-luxe text-gold">
              Limited Time
            </p>
            <h2 className="font-serif text-4xl font-light uppercase tracking-wide2 md:text-5xl">
              Flash Sale
            </h2>
            <p className="mt-3 text-sm text-white/70">Up to 50% off — ends soon.</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <CountdownTimer target={demoSaleTarget()} light />
            <Link href="/sale" className="btn-label mt-2">
              Shop All Sale
            </Link>
          </div>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
