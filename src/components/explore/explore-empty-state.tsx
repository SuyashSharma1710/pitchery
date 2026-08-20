"use client";

import { Startup } from "@/types";
import StartupCard from "@/components/startup-card";
import { Search, Compass } from "lucide-react";

interface ExploreEmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  suggestedPitches: Startup[];
  onResetFilters: () => void;
}

export default function ExploreEmptyState({
  searchQuery,
  selectedCategory,
  suggestedPitches,
  onResetFilters,
}: ExploreEmptyStateProps) {
  return (
    <div className="space-y-12">
      {/* Search Empty State Banner */}
      <div className="bg-white border-[3px] border-black rounded-[28px] p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
        <div className="w-16 h-16 bg-pink-100 border-[3px] border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#000000]">
          <Search className="w-8 h-8 text-[#EE2B69]" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">
          NO PITCHES FOUND
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-zinc-500 max-w-sm mx-auto mb-6">
          We couldn&apos;t find any startup pitches matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try adjusting your keywords or clearing active filters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-3 px-8 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all inline-flex items-center gap-2"
        >
          <span>RESET ALL FILTERS</span>
        </button>
      </div>

      {/* Suggested Pitches Section */}
      {suggestedPitches.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-black/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FBE843] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000000]">
                <Compass className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  PITCHES YOU MIGHT LIKE
                </h3>
                <p className="text-xs font-semibold text-zinc-500">
                  Trending and popular startup pitches from our founder community
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider text-[#EE2B69]">
              RECOMMENDED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {suggestedPitches.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
