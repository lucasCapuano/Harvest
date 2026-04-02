import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ApplicationsLoading() {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>

        {/* Section 1: Les essentiels */}
        <div className="mb-10">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 2: Disponibles sur demande */}
        <div>
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i} className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="ml-auto size-6 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
