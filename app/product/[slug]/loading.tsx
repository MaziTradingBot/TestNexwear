import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-luxe py-6">
      <Skeleton className="h-3 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
