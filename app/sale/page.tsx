import type { Metadata } from "next";
import { CountdownTimer } from "@/components/CountdownTimer";
import { demoSaleTarget } from "@/lib/sale";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale — Up To 50% Off",
  description: "Shop the NexWear sale. Limited-time offers on women's, men's and shoes.",
};

export default function SalePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div>
      <section className="bg-ink py-16 text-white">
        <div className="container-luxe flex flex-col items-center text-center">
          <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-luxe text-gold">
            Limited Time Only
          </p>
          <h1 className="font-serif text-5xl font-light uppercase tracking-wide2 md:text-7xl">
            Summer Sale
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Up to 50% off selected styles. Hurry — offers end soon.
          </p>
          <div className="mt-8">
            <CountdownTimer target={demoSaleTarget()} light />
          </div>
        </div>
      </section>

      <CollectionView
        searchParams={{ ...searchParams, sale: "true" }}
        title="Sale"
        description="Every reduced piece, in one place."
        hideCategoryFilter
      />
    </div>
  );
}
