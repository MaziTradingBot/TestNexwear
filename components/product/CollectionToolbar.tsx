"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { FilterControls, type FilterOptions } from "@/components/product/FilterControls";
import { SORT_OPTIONS } from "@/lib/constants";

export function CollectionToolbar({
  total,
  options,
  activeCount,
}: {
  total: number;
  options: FilterOptions;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "popular";

  function changeSort(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-line py-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-wide2 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter {activeCount > 0 && `(${activeCount})`}
        </button>
        <p className="hidden text-xs text-stone lg:block">{total} products</p>
        <div className="flex items-center gap-2">
          <span className="hidden text-[0.7rem] uppercase tracking-wide2 text-stone sm:inline">
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="border border-line bg-white px-3 py-2 text-xs focus:border-ink focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} side="left" title={`Filter (${activeCount})`}>
        <div className="px-6">
          <FilterControls options={options} />
          <button onClick={() => setOpen(false)} className="btn-primary my-6 w-full">
            Show {total} Results
          </button>
        </div>
      </Sheet>
    </>
  );
}
