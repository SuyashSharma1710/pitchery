"use client";

import { useState, useMemo } from "react";
import { Startup } from "@/types";
import StartupCard from "@/components/startup-card";
import ExploreSort from "./explore-sort";
import ExploreFilters from "./explore-filters";
import ExploreEmptyState from "./explore-empty-state";
import { StartupSortOption } from "@/core/interfaces/startup.interface";
import { defaultSortRegistry } from "@/core/strategies/startup-sort.strategy";
import {
  CategoryFilterPredicate,
  QueryFilterPredicate,
  StartupFilterEngine,
} from "@/core/strategies/startup-filter.strategy";
import { Search, X } from "lucide-react";

interface ExploreViewProps {
  initialStartups: Startup[];
}

export default function ExploreView({ initialStartups }: ExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<StartupSortOption>("popular");

  // Dynamically extract categories from available startups + core defaults
  const categories = useMemo(() => {
    const defaultCats = [
      "All",
      "Tech",
      "Education",
      "EdTech",
      "Climate",
      "Management",
      "AI",
      "Senior level",
    ];
    const fromData = Array.from(
      new Set(initialStartups.map((s) => s.category).filter(Boolean))
    );
    return Array.from(new Set([...defaultCats, ...fromData]));
  }, [initialStartups]);

  // Filter and sort startups in real time using extensible OCP strategies
  const filteredStartups = useMemo(() => {
    const predicates = [
      new CategoryFilterPredicate(selectedCategory),
      new QueryFilterPredicate(searchQuery),
    ];

    const filtered = StartupFilterEngine.filter(initialStartups, predicates);
    return defaultSortRegistry.sort(filtered, sortBy);
  }, [initialStartups, searchQuery, selectedCategory, sortBy]);

  // Suggested / Recommended Pitches when zero direct results match
  const suggestedPitches = useMemo(() => {
    if (filteredStartups.length > 0) return [];
    return defaultSortRegistry.sort(initialStartups, "popular").slice(0, 6);
  }, [filteredStartups.length, initialStartups]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== "All" || sortBy !== "popular";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("popular");
  };

  return (
    <div className="w-full">
      {/* Filter & Control Bar Box */}
      <div className="bg-white border-[3px] border-black rounded-[28px] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] mb-10">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between pb-6 border-b-2 border-black/10">
          {/* Search Bar Input */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-3.5 text-zinc-400">
              <Search className="w-5 h-5 text-black" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup name, idea, keyword, or founder..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#F8F8F8] border-[2.5px] border-black rounded-full font-bold text-sm text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-3.5 p-1 rounded-full text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Extracted Sort Controls (SRP) */}
          <ExploreSort sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Extracted Category Filter Pills (SRP) */}
        <ExploreFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Pitches Counter & Active Filter Reset Bar */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            {selectedCategory === "All" ? "All Startup Pitches" : `${selectedCategory} Pitches`}
          </h2>
          <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full border-[1.5px] border-black shadow-[2px_2px_0px_0px_#EE2B69]">
            {filteredStartups.length} {filteredStartups.length === 1 ? "Pitch" : "Pitches"}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#EE2B69] hover:underline"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Pitches Grid OR Smart Suggestion Flow */}
      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredStartups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      ) : (
        <ExploreEmptyState
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          suggestedPitches={suggestedPitches}
          onResetFilters={handleResetFilters}
        />
      )}
    </div>
  );
}
