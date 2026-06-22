import type { Metadata } from "next";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Women's Clothing",
  description: "Shop women's clothing — dresses, tops, jackets, skirts, jeans, handbags and more at NexWear.",
};

export default function WomenPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <CollectionView
      department="women"
      searchParams={searchParams}
      title="Women"
      description="Effortless dressing and considered design for every occasion."
    />
  );
}
