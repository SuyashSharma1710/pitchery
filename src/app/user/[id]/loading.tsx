import { ProfileCardSkeleton, StartupCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function UserProfileLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Sidebar Skeleton */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <ProfileCardSkeleton />
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black/20">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StartupCardSkeleton />
            <StartupCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
