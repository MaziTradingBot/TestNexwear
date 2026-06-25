import { Skeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

/** Instant skeleton shown while a collection/listing page streams in. */
export function CollectionLoading() {
  return (
    <div className="container-luxe py-8">
      <div className="flex flex-col items-center gap-3 border-b border-line pb-8 pt-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="flex items-center justify-between border-b border-line py-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-[420px] w-full" />
        </div>
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  );
}
