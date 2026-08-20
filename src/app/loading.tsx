import { StartupCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="w-full pb-20">
      {/* Hero Banner Skeleton */}
      <section className="w-full bg-pinstripe border-b-[3px] border-black py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 w-full">
          <Skeleton className="h-6 w-44 rounded-full bg-yellow-200" />
          <Skeleton className="h-14 w-full max-w-2xl bg-black/40 rounded-none border-2 border-black" />
          <Skeleton className="h-5 w-3/4 max-w-lg bg-white/40 rounded-md" />

          {/* Search Bar Skeleton */}
          <div className="w-full max-w-xl mx-auto mt-4">
            <Skeleton className="h-12 w-full rounded-full bg-white/80 border-[3px] border-black/40" />
          </div>
        </div>
      </section>

      {/* Main Pitch Feed Skeleton Grid */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
