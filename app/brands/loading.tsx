import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-luxe py-12">
      <div className="flex flex-col items-center gap-3 border-b border-line pb-10">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-px bg-line py-12 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
