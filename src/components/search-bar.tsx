"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-xl mx-auto flex items-center relative"
    >
      <div className="w-full bg-white border-[3px] border-black rounded-full px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH STARTUP"
          className="w-full bg-transparent font-black text-black placeholder:text-gray-400 placeholder:font-black tracking-wide text-sm md:text-base outline-none uppercase"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-10 h-10 -mr-2 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
