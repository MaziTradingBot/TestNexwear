import { ProductGrid } from "@/components/product/ProductGrid";
import { CollectionToolbar } from "@/components/product/CollectionToolbar";
import { FilterControls, type FilterOptions } from "@/components/product/FilterControls";
import { ActiveFilterChips } from "@/components/product/ActiveFilterChips";
import { Pagination } from "@/components/product/Pagination";
import { getProducts, getBrands, getCategoriesByDepartment } from "@/lib/queries";
import { FILTER_COLORS, FILTER_MATERIALS } from "@/lib/constants";
import { parseFilters, countActiveFilters, type SearchParams } from "@/lib/parse-filters";

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

function sizesFor(department?: string): string[] {
  if (department === "shoes") return SHOE_SIZES;
  return CLOTHING_SIZES;
}

export async function CollectionView({
  department,
  searchParams,
  title,
  description,
  hideCategoryFilter = false,
}: {
  department?: string;
  searchParams: SearchParams;
  title: string;
  description?: string;
  hideCategoryFilter?: boolean;
}) {
  const filters = parseFilters(searchParams, department);

  const [{ products, total, page, totalPages }, brands, categories] = await Promise.all([
    getProducts(filters),
    getBrands(),
    department ? getCategoriesByDepartment(department) : Promise.resolve([]),
  ]);

  const options: FilterOptions = {
    categories: hideCategoryFilter
      ? []
      : categories.map((c) => ({ name: c.name, slug: c.slug })),
    brands: brands.map((b) => ({ name: b.name, slug: b.slug })),
    colors: FILTER_COLORS,
    sizes: sizesFor(department),
    materials: FILTER_MATERIALS,
  };

  return (
    <div className="container-luxe py-8">
      {/* Heading */}
      <div className="border-b border-line pb-8 pt-2 text-center">
        <h1 className="font-serif text-4xl font-light uppercase tracking-wide2 md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone">{description}</p>
        )}
      </div>

      <CollectionToolbar total={total} options={options} activeCount={countActiveFilters(filters)} />

      <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FilterControls options={options} />
          </div>
        </aside>

        <div>
          <ActiveFilterChips />
          <ProductGrid products={products} priorityCount={4} />
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
