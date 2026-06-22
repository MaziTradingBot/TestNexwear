import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/queries";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.name,
    description: brand.description ?? `Shop ${brand.name} at NexWear.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) notFound();

  return (
    <div>
      <section className="relative h-[40vh] min-h-[320px] w-full overflow-hidden">
        {brand.heroImage && (
          <Image src={brand.heroImage} alt={brand.name} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          {brand.isPremium && <p className="eyebrow mb-3 text-gold">Premium House</p>}
          <h1 className="font-serif text-5xl font-light uppercase tracking-wide2 md:text-6xl">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="mx-auto mt-4 max-w-xl px-6 text-sm text-white/80">{brand.description}</p>
          )}
        </div>
      </section>

      <CollectionView
        searchParams={{ ...searchParams, brand: brand.slug }}
        title={`${brand.name} Collection`}
        hideCategoryFilter
      />
    </div>
  );
}
