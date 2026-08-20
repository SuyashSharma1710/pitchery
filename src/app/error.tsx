"use client";

import { useEffect } from "react";
import HeroBanner from "@/components/hero-banner";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error caught:", error);
  }, [error]);

  return (
    <div className="w-full pb-20">
      <HeroBanner
        badgeText="SOMETHING WENT WRONG"
        title="APPLICATION ERROR"
        subtitle="An unexpected issue occurred while rendering this page."
      />

      <div className="max-w-xl mx-auto px-6 pt-12 text-center">
        <div className="bg-white border-[3px] border-black rounded-[28px] p-8 md:p-12 shadow-[6px_6px_0px_0px_#000000]">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-black text-black mb-3">System Glitch</h2>
          <p className="text-sm font-semibold text-gray-700 mb-8 leading-relaxed">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <button
            onClick={() => reset()}
            className="inline-block bg-[#EE2B69] text-white border-[3px] border-black rounded-full px-8 py-3.5 font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[0px] active:translate-y-[0px] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
