"use client";

import { useEffect } from "react";
import HeroBanner from "@/components/hero-banner";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, Database } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught:", error);
  }, [error]);

  const rawMessage = error?.message || "An unexpected error occurred.";
  const isDbError =
    rawMessage.toLowerCase().includes("database") ||
    rawMessage.toLowerCase().includes("postgres") ||
    rawMessage.toLowerCase().includes("relation") ||
    rawMessage.toLowerCase().includes("neon") ||
    rawMessage.toLowerCase().includes("econnrefused") ||
    rawMessage.toLowerCase().includes("connection");

  return (
    <div className="w-full pb-20">
      <HeroBanner
        badgeText={isDbError ? "DATABASE CONNECTION ERROR" : "SOMETHING WENT WRONG"}
        title={isDbError ? "DATABASE NOT CONNECTED" : "APPLICATION ERROR"}
        subtitle={
          isDbError
            ? "Pitchery failed to query the PostgreSQL database on this environment."
            : "An unexpected issue occurred while rendering this page."
        }
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-white border-[3px] border-black rounded-[28px] p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 border-2 border-black rounded-2xl">
              {isDbError ? (
                <Database className="w-6 h-6 text-red-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase">
                {isDbError ? "Database Query Failed" : "System Error"}
              </h2>
              <p className="text-xs font-bold text-gray-500">
                {isDbError ? "PostgreSQL / Neon Connection Issue" : "Runtime Exception"}
              </p>
            </div>
          </div>

          {/* Exact Error Snippet */}
          <div className="bg-[#FFF5F5] border-2 border-[#EE2B69] rounded-2xl p-4 mb-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#EE2B69] mb-1">
              Error Message:
            </p>
            <p className="font-mono text-xs text-[#991B1B] break-words whitespace-pre-wrap leading-relaxed">
              {rawMessage}
            </p>
            {error.digest && (
              <p className="mt-2 text-[10px] text-gray-500 font-mono">
                Digest: {error.digest}
              </p>
            )}
          </div>

          {/* Vercel Troubleshooting Checklist if DB error */}
          {isDbError && (
            <div className="bg-[#FFFBEB] border-2 border-black rounded-2xl p-5 mb-8 text-xs text-gray-900 space-y-3">
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide text-black flex items-center gap-2">
                <span>🛠️</span> Troubleshooting steps on Vercel:
              </h4>
              <ul className="list-disc pl-5 space-y-2 font-semibold text-gray-800">
                <li>
                  <strong>Set Environment Variable:</strong> In Vercel Project Settings → <strong>Environment Variables</strong>, add <code className="bg-white px-1.5 py-0.5 border border-black rounded font-mono text-[11px]">DATABASE_URL</code> for <strong>Production</strong>, <strong>Preview</strong>, and <strong>Development</strong>.
                </li>
                <li>
                  <strong>SSL Mode:</strong> Ensure the connection string ends with <code className="bg-white px-1.5 py-0.5 border border-black rounded font-mono text-[11px]">?sslmode=require</code>.
                </li>
                <li>
                  <strong>Push Database Tables:</strong> If the table does not exist, run <code className="bg-white px-1.5 py-0.5 border border-black rounded font-mono text-[11px]">npm run db:push</code> locally against your remote Neon database.
                </li>
                <li>
                  <strong>Redeploy:</strong> After saving environment variables in Vercel, trigger a fresh <strong>Redeploy</strong>.
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap pt-2">
            <button
              onClick={() => reset()}
              className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full px-6 py-3 font-black uppercase text-xs sm:text-sm shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[0px] active:translate-y-[0px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <Link
              href="/"
              className="bg-white hover:bg-gray-50 text-black border-[3px] border-black rounded-full px-6 py-3 font-black uppercase text-xs sm:text-sm shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[0px] active:translate-y-[0px] transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
