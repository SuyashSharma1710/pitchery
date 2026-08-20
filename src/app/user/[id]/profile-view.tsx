"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Startup, Reachout } from "@/types";
import StartupCard from "@/components/startup-card";
import InboxTab from "@/components/inbox/inbox-tab";
import ReachoutModal from "@/components/reachout/reachout-modal";
import Link from "next/link";
import { Layers, Mail, Plus } from "lucide-react";

interface ProfileViewProps {
  user: User;
  currentUser: User | null;
  startups: Startup[];
  inboxMessages: Reachout[];
  sentMessages?: Reachout[];
  initialTab?: "pitches" | "inbox";
}

export default function ProfileView({
  user,
  currentUser,
  startups,
  inboxMessages,
  sentMessages = [],
  initialTab = "pitches",
}: ProfileViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const isOwner = currentUser?.id === user.id;

  // Derive active tab from queryTab, initialTab prop, or fallback to pitches
  const [localTab, setLocalTab] = useState<"pitches" | "inbox">(
    initialTab === "inbox" ? "inbox" : "pitches"
  );

  const activeTab =
    queryTab === "inbox" || queryTab === "pitches" ? queryTab : localTab;

  const handleTabChange = (tab: "pitches" | "inbox") => {
    setLocalTab(tab);
    const newUrl = `/user/${user.id}?tab=${tab}`;
    router.replace(newUrl, { scroll: false });
  };

  const unreadCount = inboxMessages.filter((m) => !m.isRead).length;

  return (
    <div className="w-full">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          {/* Pitches Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("pitches")}
            className={`px-5 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "pitches"
                ? "bg-black text-white shadow-[3px_3px_0px_0px_#EE2B69] -translate-x-px -translate-y-px"
                : "bg-white text-black hover:bg-zinc-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pitches ({startups.length})</span>
          </button>

          {/* Inbox Tab (Visible for account owner) */}
          {isOwner && (
            <button
              type="button"
              onClick={() => handleTabChange("inbox")}
              className={`relative px-5 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "inbox"
                  ? "bg-[#EE2B69] text-white shadow-[3px_3px_0px_0px_#000000] -translate-x-px -translate-y-px"
                  : "bg-white text-black hover:bg-pink-50"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Private Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-[#FBE843] text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Action Button: Create Pitch if owner, or Reach Out if visitor */}
        <div>
          {isOwner ? (
            <Link
              href="/startup/create"
              className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-5 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Pitch</span>
            </Link>
          ) : (
            <ReachoutModal founder={user} currentUser={currentUser} />
          )}
        </div>
      </div>

      {/* Tab 1: Pitches */}
      {activeTab === "pitches" && (
        <div>
          {startups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startups.map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-[3px] border-black rounded-3xl p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
              <div className="w-16 h-16 bg-yellow-100 border-[3px] border-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                No Pitches Published Yet
              </h3>
              <p className="text-xs font-semibold text-zinc-500 max-w-sm mx-auto mb-6">
                {isOwner
                  ? "Pitch your startup idea to the global community of entrepreneurs, mentors, and investors."
                  : `${user.name} hasn't published any startup pitches on Pitchery yet.`}
              </p>
              {isOwner && (
                <Link
                  href="/startup/create"
                  className="inline-flex items-center gap-2 bg-[#EE2B69] text-white hover:bg-[#d9225c] border-2 border-black rounded-full py-3 px-6 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]"
                >
                  <Plus className="w-4 h-4" /> Submit Your First Pitch
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Private Founder Inbox & Conversations */}
      {activeTab === "inbox" && isOwner && (
        <InboxTab
          initialMessages={inboxMessages}
          initialSentMessages={sentMessages}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
