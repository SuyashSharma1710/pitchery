"use client";

import { Sparkles } from "lucide-react";

interface ExploreFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function ExploreFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: ExploreFiltersProps) {
  return (
    <div className="pt-6">
      <div className="text-xs font-black uppercase tracking-wider mb-3 text-black flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#EE2B69]" />
        <span>Filter By Category:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all ${
                isSelected
                  ? "bg-[#FBE843] text-black shadow-[3px_3px_0px_0px_#000000] -translate-x-px -translate-y-px"
                  : "bg-[#F8F8F8] text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
