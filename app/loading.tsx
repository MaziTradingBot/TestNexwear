import { Skeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Hero placeholder */}
      <Skeleton className="h-[92vh] min-h-[560px] w-full" />
      <div className="container-luxe space-y-6 py-16">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-56" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
