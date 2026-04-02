import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0 border-r p-4 space-y-6">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="rounded-xl border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border p-5 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border p-5 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
          <div className="rounded-xl border p-5 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
