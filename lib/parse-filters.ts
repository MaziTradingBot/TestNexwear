import type { ProductFilters } from "@/lib/queries";

export type SearchParams = { [key: string]: string | string[] | undefined };

function arr(v: string | string[] | undefined): string[] | undefined {
  if (!v) return undefined;
  const list = Array.isArray(v) ? v : v.split(",");
  const cleaned = list.map((s) => s.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  if (typeof v !== "string") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse Next.js searchParams into ProductFilters for a given department. */
export function parseFilters(
  searchParams: SearchParams,
  department?: string,
): ProductFilters {
  return {
    department,
    category: typeof searchParams.category === "string" ? searchParams.category : undefined,
    brands: arr(searchParams.brand),
    colors: arr(searchParams.color),
    sizes: arr(searchParams.size),
    materials: arr(searchParams.material),
    minPrice: num(searchParams.min),
    maxPrice: num(searchParams.max),
    onSale: searchParams.sale === "true",
    search: typeof searchParams.q === "string" ? searchParams.q : undefined,
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
    page: num(searchParams.page) ?? 1,
    perPage: 12,
  };
}

/** Count active filters (for the mobile "Filters (n)" label). */
export function countActiveFilters(f: ProductFilters): number {
  let n = 0;
  if (f.category) n++;
  if (f.brands?.length) n += f.brands.length;
  if (f.colors?.length) n += f.colors.length;
  if (f.sizes?.length) n += f.sizes.length;
  if (f.materials?.length) n += f.materials.length;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.onSale) n++;
  return n;
}
