import type { Metadata } from "next";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Men's Clothing",
  description: "Shop men's clothing — shirts, t-shirts, hoodies, jackets, jeans, trousers and more at NexWear.",
};

export default function MenPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <CollectionView
      department="men"
      searchParams={searchParams}
      title="Men"
      description="Modern essentials and refined tailoring, built to last."
    />
  );
}
