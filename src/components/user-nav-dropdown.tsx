"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types";
import { logoutAction, getLiveUnreadCountAction } from "@/lib/actions";

interface UserNavDropdownProps {
  user: User;
  unreadCount?: number;
}

export default function UserNavDropdown({ user, unreadCount = 0 }: UserNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(unreadCount);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live polling for unread messages (every 8s)
  useEffect(() => {
    async function fetchUnread() {
      const res = await getLiveUnreadCountAction();
      if (res.status === "SUCCESS" && typeof res.data === "number") {
        setLiveCount(res.data);
      }
    }

    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative block rounded-full focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-full border-[2.5px] border-black overflow-hidden bg-[#FBE843] flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:scale-105 transition-transform">
          <Image
            src={user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Unread Inbox Indicator Dot on Avatar */}
        {liveCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EE2B69] text-white text-[9px] font-black w-4 h-4 rounded-full border border-black flex items-center justify-center animate-pulse">
            {liveCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150 w-64">
          <div className="bg-white border-[3px] border-black rounded-[22px] p-2 shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
            {/* Header info */}
            <div className="px-3.5 py-3 border-b-2 border-black/10 bg-yellow-50/50 rounded-t-2xl mb-1.5">
              <div className="font-black text-sm text-black truncate">{user.name}</div>
              <div className="text-xs font-bold text-[#EE2B69] truncate">@{user.username}</div>
              <div className="text-[11px] font-semibold text-zinc-500 truncate">{user.email}</div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1">
              {/* Profile Link */}
              <Link
                href={`/user/${user.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-black hover:bg-[#FBE843] transition-colors"
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>View Profile</span>
              </Link>

              {/* Inbox Link */}
              <Link
                href={`/user/${user.id}?tab=inbox`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-black hover:bg-[#FBE843] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Private Inbox</span>
                </div>
                {liveCount > 0 && (
                  <span className="bg-[#EE2B69] text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
                    {liveCount}
                  </span>
                )}
              </Link>

              {/* Submit Pitch Link */}
              <Link
                href="/startup/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-black hover:bg-[#FBE843] transition-colors"
              >
                <svg
                  className="w-4 h-4 text-black"
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
                <span>Submit New Pitch</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="my-1.5 border-t-2 border-black/10" />

            {/* Logout Action */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition-colors text-left uppercase tracking-wider"
              >
                <svg
                  className="w-4 h-4 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
