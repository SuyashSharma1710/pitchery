"use client";

import { Flame, Clock, ArrowDownAZ, SlidersHorizontal } from "lucide-react";
import { StartupSortOption } from "@/core/interfaces/startup.interface";

interface ExploreSortProps {
  sortBy: StartupSortOption;
  onSortChange: (sort: StartupSortOption) => void;
}

export default function ExploreSort({ sortBy, onSortChange }: ExploreSortProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500 hidden sm:inline flex items-center gap-1">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#EE2B69]" /> Sort:
      </span>
      <div className="flex items-center bg-[#F8F8F8] border-[2.5px] border-black rounded-full p-1 shadow-[2px_2px_0px_0px_#000000]">
        <button
          type="button"
          onClick={() => onSortChange("popular")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
            sortBy === "popular"
              ? "bg-[#EE2B69] text-white shadow-[2px_2px_0px_0px_#000000]"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Popular
        </button>

        <button
          type="button"
          onClick={() => onSortChange("latest")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
            sortBy === "latest"
              ? "bg-[#EE2B69] text-white shadow-[2px_2px_0px_0px_#000000]"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Latest
        </button>

        <button
          type="button"
          onClick={() => onSortChange("alphabetical")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
            sortBy === "alphabetical"
              ? "bg-[#EE2B69] text-white shadow-[2px_2px_0px_0px_#000000]"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          <ArrowDownAZ className="w-3.5 h-3.5" /> A-Z
        </button>
      </div>
    </div>
  );
}
