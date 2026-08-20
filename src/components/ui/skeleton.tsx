import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "brutal" | "circle" | "badge" | "pinstripe";
}

/**
 * Neo-Brutalist Accessible Skeleton Primitive
 * Provides smooth shimmering pulse states with sharp brutalist borders & accents.
 */
export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variantStyles = {
    default: "bg-zinc-200 animate-pulse rounded-xl",
    brutal:
      "bg-zinc-100 border-[2.5px] border-black/20 animate-pulse rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]",
    circle: "bg-zinc-200 animate-pulse rounded-full border-2 border-black/20",
    badge: "bg-zinc-200 animate-pulse rounded-full border-[1.5px] border-black/20",
    pinstripe: "bg-pink-100/60 animate-pulse border-2 border-black/20 rounded-2xl",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

/**
 * Startup Card Skeleton matching Neo-Brutalist card layout
 */
export function StartupCardSkeleton() {
  return (
    <div className="relative bg-white border-[3px] border-black/40 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] flex flex-col justify-between animate-pulse">
      <div>
        {/* Top Header: Date pill & Views */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-24 rounded-full bg-pink-100" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>

        {/* Author info & avatar */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-full border-[1.5px] border-black/20 bg-yellow-100" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />

        {/* Description snippet */}
        <div className="space-y-1.5 mb-4">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
        </div>

        {/* Thumbnail Preview */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-black/10">
          <Skeleton className="aspect-video w-full rounded-2xl bg-zinc-200" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 mt-auto">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-full bg-zinc-300" />
      </div>
    </div>
  );
}

/**
 * Startup Details View Skeleton
 */
export function StartupDetailsSkeleton() {
  return (
    <div className="w-full pb-24 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full bg-pinstripe border-b-[3px] border-black py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 w-full">
          <Skeleton className="h-6 w-32 rounded-full bg-yellow-200" />
          <Skeleton className="h-12 w-3/4 max-w-xl rounded-xl bg-black/40" />
          <Skeleton className="h-5 w-2/3 max-w-md bg-white/40 rounded-md" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Media Showcase Skeleton */}
        <div className="relative w-full aspect-video md:aspect-21/10 bg-zinc-200 border-[3px] border-black/30 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] mb-8 overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Author row & category */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-b-2 border-black/10">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full border-2 border-black/20 bg-yellow-100" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-full bg-pink-100" />
            <Skeleton className="h-10 w-36 rounded-full bg-yellow-200" />
          </div>
        </div>

        {/* Markdown breakdown skeleton */}
        <div className="bg-white border-[3px] border-black/20 rounded-3xl p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-4 mb-12">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-6 w-1/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
        </div>

        {/* Comments Skeleton */}
        <div className="bg-white border-[3px] border-black/20 rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black/10">
            <Skeleton className="w-10 h-10 rounded-xl bg-yellow-100" />
            <Skeleton className="h-6 w-40 rounded-lg" />
          </div>
          <div className="space-y-4">
            <CommentItemSkeleton />
            <CommentItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Card Skeleton
 */
export function ProfileCardSkeleton() {
  return (
    <div className="relative w-full max-w-sm mx-auto bg-[#EE2B69]/80 border-[3px] border-black rounded-[28px] p-6 text-center shadow-[6px_6px_0px_0px_#000000] animate-pulse">
      <div className="inline-block bg-white/80 border-[2.5px] border-black rounded-xl px-6 py-2 mb-6">
        <Skeleton className="h-5 w-28 rounded-md bg-zinc-300" />
      </div>
      <div className="relative mx-auto w-40 h-40 rounded-full border-[3.5px] border-black bg-[#FBE843] p-1.5 shadow-[4px_4px_0px_0px_#000000] mb-5 overflow-hidden">
        <Skeleton className="w-full h-full rounded-full bg-zinc-200" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 mx-auto rounded-lg bg-white/60" />
        <Skeleton className="h-12 w-48 mx-auto rounded-xl bg-white/40" />
      </div>
    </div>
  );
}

/**
 * Comment Item Skeleton
 */
export function CommentItemSkeleton() {
  return (
    <div className="bg-[#F8F8F8] border-2 border-black/20 rounded-xl p-4 flex gap-3.5 animate-pulse">
      <Skeleton className="w-9 h-9 rounded-full border-2 border-black/10 bg-yellow-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-3/4 rounded-md" />
      </div>
    </div>
  );
}
