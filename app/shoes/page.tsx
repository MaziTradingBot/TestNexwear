import type { Metadata } from "next";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shoes",
  description: "Shop shoes — sneakers, boots, formal shoes, running shoes and sandals at NexWear.",
};

export default function ShoesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <CollectionView
      department="shoes"
      searchParams={searchParams}
      title="Shoes"
      description="From everyday sneakers to refined leather — step into the season."
    />
  );
}
