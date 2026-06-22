import type { Metadata } from "next";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  return (
    <CollectionView
      searchParams={searchParams}
      title={q ? `“${q}”` : "Search"}
      description={q ? "Search results" : "Find your next favourite piece."}
      hideCategoryFilter
    />
  );
}
