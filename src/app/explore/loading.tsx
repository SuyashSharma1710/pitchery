import { StartupCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="w-full pb-24">
      {/* Hero Banner Skeleton */}
      <section className="w-full bg-pinstripe border-b-[3px] border-black py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 w-full">
          <Skeleton className="h-6 w-36 rounded-full bg-yellow-200" />
          <Skeleton className="h-12 w-full max-w-xl bg-black/40 rounded-none border-2 border-black" />
          <Skeleton className="h-5 w-2/3 max-w-md bg-white/40 rounded-md" />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {/* Filter Bar Box Skeleton */}
        <div className="bg-white border-[3px] border-black/30 rounded-[28px] p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] mb-10">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between pb-6 border-b-2 border-black/10">
            <Skeleton className="h-12 flex-1 rounded-full bg-zinc-100" />
            <Skeleton className="h-10 w-64 rounded-full bg-zinc-100" />
          </div>

          <div className="pt-6">
            <Skeleton className="h-4 w-32 mb-3 rounded-md" />
            <div className="flex flex-wrap items-center gap-2.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Pitches Grid Skeleton */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-black/20">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
