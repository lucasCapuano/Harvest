import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ClientsLoading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 shrink-0 border-r p-4 space-y-6">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Header skeleton */}
        <div className="flex h-10 items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-7 w-32 rounded-md" />
          </div>
        </div>

        {/* Table rows */}
        <Card className="overflow-hidden">
          <div className="border-b px-4 py-3">
            <div className="flex gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-4">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
