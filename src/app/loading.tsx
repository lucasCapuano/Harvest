import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="w-56 shrink-0 border-r p-4 space-y-4">
        <Skeleton className="h-5 w-32 mb-6" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      <div className="flex-1">
        {/* Header */}
        <div className="flex h-14 items-center justify-end border-b px-6 gap-3">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Form content */}
        <div className="mx-auto w-full max-w-2xl px-8 py-10 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
