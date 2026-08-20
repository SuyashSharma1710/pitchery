import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { messageService } from "@/core/container";
import UserNavDropdown from "./user-nav-dropdown";

export default async function Navbar() {
  const user = await getCurrentUser();
  const unreadCount = user ? await messageService.getUnreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-[3px] border-black px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="font-black text-2xl tracking-tight text-black flex items-center">
            <span className="text-[#EE2B69]">Pitch</span>ery
          </span>
          <span className="text-black font-black text-xl select-none group-hover:rotate-12 transition-transform">
            ⚡
          </span>
        </Link>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Explore Link */}
          <Link
            href="/explore"
            className="font-black text-xs sm:text-sm text-black hover:text-[#EE2B69] transition-colors flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span>Explore</span>
          </Link>

          {user ? (
            <>
              {/* Create Pitch Link */}
              <Link
                href="/startup/create"
                className="font-black text-xs sm:text-sm text-black hover:text-[#EE2B69] transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4 text-[#EE2B69]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span className="hidden sm:inline">Create</span>
              </Link>

              {/* User Profile Avatar with Hover Dropdown Menu */}
              <UserNavDropdown user={user} unreadCount={unreadCount} />
            </>
          ) : (
            <>
              <Link
                href="/startup/create"
                className="font-black text-xs sm:text-sm text-black hover:text-[#EE2B69] transition-colors hidden sm:block"
              >
                Submit Pitch
              </Link>

              <Link
                href="/login"
                className="font-black text-xs sm:text-sm text-black hover:text-[#EE2B69] transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                Log in
              </Link>

              <Link
                href="/register"
                className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[2px] border-black rounded-full py-1.5 px-4 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000000] transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
