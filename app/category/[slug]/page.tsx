import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CollectionView } from "@/components/product/CollectionView";
import type { SearchParams } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: `Shop ${category.name} at NexWear.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  return (
    <CollectionView
      department={category.department}
      searchParams={{ ...searchParams, category: category.slug }}
      title={category.name}
      description={category.description ?? undefined}
    />
  );
}
