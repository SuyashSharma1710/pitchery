"use client";

import { useState, useOptimistic, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reachout, ReachoutReply, ReachoutStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  markReachoutAsReadAction,
  toggleTalkMoreAction,
  sendReachoutReplyAction,
  getReachoutThreadAction,
} from "@/lib/actions";
import {
  ExternalLink,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Inbox,
  SendHorizontal,
  Lock,
  Sparkles,
  ArrowLeft,
  Search,
  Ban,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InboxTabProps {
  initialMessages: Reachout[];
  initialSentMessages?: Reachout[];
  currentUserId: string;
}

type FilterStatus = "ALL" | "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";

export default function InboxTab({
  initialMessages,
  initialSentMessages = [],
  currentUserId,
}: InboxTabProps) {
  const [folder, setFolder] = useState<"received" | "sent">("received");
  const [receivedMessages, setReceivedMessages] = useState<Reachout[]>(initialMessages);
  const [sentMessages, setSentMessages] = useState<Reachout[]>(initialSentMessages);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Filter & Search State for Grid View
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [, startTransition] = useTransition();
  const threadBottomRef = useRef<HTMLDivElement>(null);

  // Active messages list based on current sub-tab
  const activeFolderList = folder === "received" ? receivedMessages : sentMessages;

  // React 19 Optimistic state for unread toggle
  const [optimisticMessages, setOptimisticMessages] = useOptimistic(
    activeFolderList,
    (state: Reachout[], readMessageId: string) =>
      state.map((m) => (m.id === readMessageId ? { ...m, isRead: true } : m))
  );

  const activeMessage =
    optimisticMessages.find((m) => m.id === activeMessageId) ||
    activeFolderList.find((m) => m.id === activeMessageId) ||
    null;

  const isReceiver = activeMessage?.receiverId === currentUserId;

  // Filtered list for Grid View
  const filteredMessages = optimisticMessages.filter((msg) => {
    // Status Filter
    if (statusFilter !== "ALL" && msg.status !== statusFilter) {
      return false;
    }

    // Text Search (senderName, receiverName, subject, pitch title, message)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSubject = msg.subject?.toLowerCase().includes(q);
      const matchSender = msg.senderName?.toLowerCase().includes(q);
      const matchReceiver = msg.receiver?.name?.toLowerCase().includes(q);
      const matchStartup = msg.startup?.title?.toLowerCase().includes(q);
      const matchMessage = msg.message?.toLowerCase().includes(q);
      if (!matchSubject && !matchSender && !matchReceiver && !matchStartup && !matchMessage) {
        return false;
      }
    }

    return true;
  });

  // Calculate status counts for filter tabs
  const pendingCount = activeFolderList.filter((m) => m.status === "PENDING").length;
  const approvedCount = activeFolderList.filter((m) => m.status === "ACCEPTED").length;
  const deniedCount = activeFolderList.filter((m) => m.status === "DECLINED").length;
  const blockedCount = activeFolderList.filter((m) => m.status === "BLOCKED").length;

  // Scroll to bottom of message thread when replies update
  const scrollToBottom = () => {
    setTimeout(() => {
      threadBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleOpenReachout = (msg: Reachout) => {
    setActiveMessageId(msg.id);
    setStatusMessage(null);

    if (!msg.isRead && msg.receiverId === currentUserId) {
      startTransition(async () => {
        setOptimisticMessages(msg.id);
        await markReachoutAsReadAction(msg.id);
        setReceivedMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      });
    }
  };

  const handleBackToGrid = () => {
    setActiveMessageId(null);
    setStatusMessage(null);
  };

  // Navigate to Prev / Next inquiry while in Conversation View
  const currentMessageIndex = activeFolderList.findIndex((m) => m.id === activeMessageId);
  const hasPrevMessage = currentMessageIndex > 0;
  const hasNextMessage = currentMessageIndex >= 0 && currentMessageIndex < activeFolderList.length - 1;

  const handleNavigateMessage = (direction: "prev" | "next") => {
    if (direction === "prev" && hasPrevMessage) {
      const prevMsg = activeFolderList[currentMessageIndex - 1];
      handleOpenReachout(prevMsg);
    } else if (direction === "next" && hasNextMessage) {
      const nextMsg = activeFolderList[currentMessageIndex + 1];
      handleOpenReachout(nextMsg);
    }
  };

  // Change Reachout Permission & Status (Pending, Approved, Denied, Blocked)
  const handleUpdateReachoutStatus = async (newStatus: ReachoutStatus) => {
    if (!activeMessage || isTogglingStatus) return;
    setIsTogglingStatus(true);
    setStatusMessage(null);

    const res = await toggleTalkMoreAction(activeMessage.id, newStatus);
    setIsTogglingStatus(false);

    if (res.status === "SUCCESS" && res.data) {
      const updated = res.data;
      const updateLocally = (prev: Reachout[]) =>
        prev.map((m) => (m.id === updated.id ? updated : m));

      setReceivedMessages(updateLocally);
      setSentMessages(updateLocally);

      if (newStatus === "ACCEPTED") {
        setStatusMessage("🎉 Talk More Approved! You and the sender can now converse freely in real time.");
      } else if (newStatus === "DECLINED") {
        setStatusMessage("⛔ Reachout Denied. The conversation has been closed.");
      } else if (newStatus === "BLOCKED") {
        setStatusMessage("🚫 User Blocked. This sender is blocked from sending further reachouts or replies to you.");
      } else if (newStatus === "PENDING") {
        setStatusMessage("⏳ Status set back to Pending Approval.");
      }
    } else {
      alert(res.error || "Failed to update status.");
    }
  };

  // Submit in-thread reply ("Reachout Revert")
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessage || !replyText.trim() || isSendingReply) return;

    const messageContent = replyText.trim();
    setIsSendingReply(true);
    setReplyText("");

    // Optimistically update conversation thread
    const tempReply: ReachoutReply = {
      id: "temp-" + crypto.randomUUID(),
      reachoutId: activeMessage.id,
      senderId: currentUserId,
      message: messageContent,
      createdAt: new Date().toISOString(),
    };

    const updateThreadLocally = (prev: Reachout[]) =>
      prev.map((m) => {
        if (m.id === activeMessage.id) {
          const newReplies = [...(m.replies || []), tempReply];
          return {
            ...m,
            status: isReceiver && m.status === "PENDING" ? "ACCEPTED" : m.status,
            replies: newReplies,
          };
        }
        return m;
      });

    setReceivedMessages(updateThreadLocally);
    setSentMessages(updateThreadLocally);
    scrollToBottom();

    const res = await sendReachoutReplyAction(activeMessage.id, messageContent);
    setIsSendingReply(false);

    if (res.status === "SUCCESS" && res.data) {
      const confirmedReply = res.data;
      const syncWithServer = (prev: Reachout[]) =>
        prev.map((m) => {
          if (m.id === activeMessage.id) {
            const repliesWithoutTemp = (m.replies || []).filter(
              (r) => r.id !== tempReply.id
            );
            return {
              ...m,
              status: isReceiver && m.status === "PENDING" ? "ACCEPTED" : m.status,
              replies: [...repliesWithoutTemp, confirmedReply],
            };
          }
          return m;
        });

      setReceivedMessages(syncWithServer);
      setSentMessages(syncWithServer);
      scrollToBottom();
    } else {
      alert(res.error || "Failed to send reply.");
    }
  };

  // Live Polling (every 5 seconds) to fetch updated replies and thread status
  const pollActiveThread = useCallback(async () => {
    if (!activeMessageId) return;

    const res = await getReachoutThreadAction(activeMessageId);
    if (res.status === "SUCCESS" && res.data) {
      const refreshed = res.data;
      setReceivedMessages((prev) =>
        prev.map((m) => (m.id === refreshed.id ? refreshed : m))
      );
      setSentMessages((prev) =>
        prev.map((m) => (m.id === refreshed.id ? refreshed : m))
      );
    }
  }, [activeMessageId]);

  useEffect(() => {
    if (!activeMessageId) return;
    const interval = setInterval(pollActiveThread, 5000);
    return () => clearInterval(interval);
  }, [activeMessageId, pollActiveThread]);

  const unreadReceivedCount = receivedMessages.filter((m) => !m.isRead).length;

  return (
    <div className="bg-white border-[3px] border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000]">
      {/* Top Folder Switcher: Received Inquiries vs Sent Reachouts */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setFolder("received");
              setActiveMessageId(null);
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-full border-2 border-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              folder === "received"
                ? "bg-[#EE2B69] text-white shadow-[2px_2px_0px_0px_#000000] -translate-x-px -translate-y-px"
                : "bg-[#F8F8F8] text-black hover:bg-zinc-100"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Received Inquiries ({receivedMessages.length})</span>
            {unreadReceivedCount > 0 && (
              <span className="bg-[#FBE843] text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black animate-pulse">
                {unreadReceivedCount} NEW
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setFolder("sent");
              setActiveMessageId(null);
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-full border-2 border-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              folder === "sent"
                ? "bg-black text-white shadow-[2px_2px_0px_0px_#EE2B69] -translate-x-px -translate-y-px"
                : "bg-[#F8F8F8] text-black hover:bg-zinc-100"
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Sent Reachouts ({sentMessages.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-zinc-500 hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Conversation Stream Active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: GRID VIEW (When no reachout conversation is currently opened)     */}
      {/* ========================================================================= */}
      {!activeMessage ? (
        <div>
          {/* Filter Bar & Search Input */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>

              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-black text-white shadow-[2px_2px_0px_0px_#EE2B69]"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                All ({activeFolderList.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "PENDING"
                    ? "bg-[#FBE843] text-black shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-yellow-50 text-yellow-900 hover:bg-yellow-100"
                }`}
              >
                ⏳ Pending ({pendingCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("ACCEPTED")}
                className={`px-3 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "ACCEPTED"
                    ? "bg-emerald-500 text-white shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                }`}
              >
                💬 Approved ({approvedCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("DECLINED")}
                className={`px-3 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "DECLINED"
                    ? "bg-zinc-700 text-white shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                ⛔ Denied ({deniedCount})
              </button>

              {folder === "received" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("BLOCKED")}
                  className={`px-3 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === "BLOCKED"
                      ? "bg-red-600 text-white shadow-[2px_2px_0px_0px_#000000]"
                      : "bg-red-50 text-red-900 hover:bg-red-100"
                  }`}
                >
                  🚫 Blocked ({blockedCount})
                </button>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, sender, pitch..."
                className="w-full bg-[#F8F8F8] border-2 border-black rounded-full pl-9 pr-4 py-1.5 text-xs font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black font-black text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Grid Content */}
          {activeFolderList.length === 0 ? (
            <div className="bg-[#F8F8F8] border-2 border-dashed border-zinc-300 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-pink-100 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_#000000]">
                {folder === "received" ? (
                  <Inbox className="w-6 h-6 text-[#EE2B69]" />
                ) : (
                  <SendHorizontal className="w-6 h-6 text-black" />
                )}
              </div>
              <h3 className="text-lg font-black uppercase text-black mb-1">
                {folder === "received" ? "No Received Inquiries" : "No Sent Reachouts"}
              </h3>
              <p className="text-xs font-semibold text-zinc-500 max-w-md mx-auto">
                {folder === "received"
                  ? "When investors, partners, or founders reach out regarding your pitches, discussions will appear in this grid."
                  : "When you reach out to other startup founders, your conversations and their replies will appear here."}
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="bg-[#F8F8F8] border-2 border-dashed border-zinc-300 rounded-2xl p-10 text-center">
              <Filter className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <h4 className="text-sm font-black uppercase text-black mb-1">
                No Reachouts Match Your Filters
              </h4>
              <p className="text-xs font-semibold text-zinc-500 mb-4">
                Try resetting your status filter or search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="bg-black text-white border-2 border-black rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Reachouts Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMessages.map((msg) => {
                const isUnread = !msg.isRead && folder === "received";
                const isTalkMore = msg.status === "ACCEPTED";
                const isDeclined = msg.status === "DECLINED";
                const isBlocked = msg.status === "BLOCKED";
                const repliesCount = (msg.replies || []).length;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenReachout(msg)}
                    className={`bg-white border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#EE2B69] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isUnread ? "bg-pink-50/50 border-[#EE2B69]" : ""
                    }`}
                  >
                    {/* Top Metadata Row */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-black/10">
                        {/* Status Badge */}
                        {isTalkMore ? (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Approved</span>
                          </span>
                        ) : isDeclined ? (
                          <span className="bg-zinc-200 text-zinc-700 border border-zinc-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-zinc-600" />
                            <span>Denied</span>
                          </span>
                        ) : isBlocked ? (
                          <span className="bg-red-100 text-red-900 border border-red-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <Ban className="w-3 h-3 text-red-600" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-900 border border-yellow-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <Clock className="w-3 h-3 text-yellow-700" />
                            <span>Pending</span>
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {isUnread && (
                            <span className="bg-[#EE2B69] text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-black animate-pulse">
                              NEW
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-zinc-500">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Sender Info */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-[#FBE843] shrink-0 flex items-center justify-center">
                          {msg.sender?.image ? (
                            <Image
                              src={msg.sender.image}
                              alt={msg.senderName}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-black text-xs text-black">
                              {msg.senderName.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-black text-xs text-black truncate">
                            {folder === "received"
                              ? msg.senderName
                              : `To: ${msg.receiver?.name || "Founder"}`}
                          </div>
                          <div className="text-[10px] font-semibold text-zinc-500 truncate">
                            {folder === "received"
                              ? msg.senderEmail
                              : msg.receiver?.email || "founder@pitchery.com"}
                          </div>
                        </div>
                      </div>

                      {/* Startup Pitch Tag */}
                      {msg.startup && (
                        <div className="mb-2">
                          <span className="inline-block bg-pink-100 text-[#EE2B69] border border-[#EE2B69]/30 text-[10px] font-black px-2.5 py-0.5 rounded-full truncate max-w-full">
                            Pitch: {msg.startup.title}
                          </span>
                        </div>
                      )}

                      {/* Subject */}
                      <h4 className="font-black text-sm text-black leading-snug mb-1.5 line-clamp-1 group-hover:text-[#EE2B69] transition-colors">
                        {msg.subject}
                      </h4>

                      {/* Message Preview */}
                      <p className="text-xs font-semibold text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                        {msg.message}
                      </p>
                    </div>

                    {/* Card Footer & Action Button */}
                    <div className="pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {repliesCount > 0
                            ? `${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`
                            : "1 initial message"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="bg-black group-hover:bg-[#EE2B69] text-white border-2 border-black rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: DEDICATED CONVERSATION & CHATBOX VIEW (When a reachout is opened) */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Top Bar: Back to Grid + Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black/10">
            <button
              type="button"
              onClick={handleBackToGrid}
              className="bg-white hover:bg-zinc-100 text-black border-2 border-black rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Inquiries Grid ({activeFolderList.length})</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 hidden sm:inline">
                Inquiry {currentMessageIndex + 1} of {activeFolderList.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!hasPrevMessage}
                  onClick={() => handleNavigateMessage("prev")}
                  className="p-1.5 bg-white hover:bg-zinc-100 border-2 border-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Inquiry"
                >
                  <ChevronLeft className="w-4 h-4 text-black" />
                </button>

                <button
                  type="button"
                  disabled={!hasNextMessage}
                  onClick={() => handleNavigateMessage("next")}
                  className="p-1.5 bg-white hover:bg-zinc-100 border-2 border-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Inquiry"
                >
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Conversation Container */}
          <div className="bg-[#F8F8F8] border-[3px] border-black rounded-3xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_#000000]">
            {/* Header Details */}
            <div className="pb-5 border-b-2 border-zinc-200 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#EE2B69] text-white text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-wider">
                    {folder === "received" ? "RECEIVED INQUIRY" : "SENT REACHOUT"}
                  </span>

                  {activeMessage.status === "ACCEPTED" && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> TALK MORE ACTIVE
                    </span>
                  )}
                  {activeMessage.status === "PENDING" && (
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> PENDING APPROVAL
                    </span>
                  )}
                  {activeMessage.status === "DECLINED" && (
                    <span className="bg-zinc-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-wider flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> DENIED
                    </span>
                  )}
                  {activeMessage.status === "BLOCKED" && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-wider flex items-center gap-1">
                      <Ban className="w-3 h-3" /> BLOCKED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(activeMessage.createdAt)}</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-black mb-3 leading-snug">
                {activeMessage.subject}
              </h3>

              <div className="text-xs font-semibold text-zinc-700 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div>
                    <span className="font-black text-black">Sender:</span>{" "}
                    {activeMessage.senderName} ({activeMessage.senderEmail})
                  </div>
                  {activeMessage.senderId && (
                    <Link
                      href={`/user/${activeMessage.senderId}`}
                      className="text-[#EE2B69] hover:underline font-black text-xs inline-flex items-center gap-0.5"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {activeMessage.startup && (
                  <div>
                    <span className="font-black text-black">Startup Pitch:</span>{" "}
                    <Link
                      href={`/startup/${activeMessage.startup.id}`}
                      className="text-[#EE2B69] hover:underline font-black inline-flex items-center gap-1"
                    >
                      {activeMessage.startup.title} <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================== */}
            {/* RECEIVER CONTROL BAR (Pending, Approved, Denied, Blocked)       */}
            {/* ============================================================== */}
            {isReceiver && (
              <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 mb-6 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EE2B69]" />
                    <span className="font-black text-xs uppercase tracking-wider text-black">
                      Receiver Controls &amp; Conversation Permission:
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">
                    Control who can message you
                  </span>
                </div>

                {/* 4 Status Buttons Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                  {/* 1. Approve / Talk More */}
                  <button
                    type="button"
                    disabled={isTogglingStatus || activeMessage.status === "ACCEPTED"}
                    onClick={() => handleUpdateReachoutStatus("ACCEPTED")}
                    className={`py-2 px-3 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      activeMessage.status === "ACCEPTED"
                        ? "bg-emerald-500 text-white shadow-[2px_2px_0px_0px_#000000] ring-2 ring-emerald-300"
                        : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:-translate-x-px hover:-translate-y-px"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeMessage.status === "ACCEPTED" ? "Approved ✓" : "Approve"}</span>
                  </button>

                  {/* 2. Pending */}
                  <button
                    type="button"
                    disabled={isTogglingStatus || activeMessage.status === "PENDING"}
                    onClick={() => handleUpdateReachoutStatus("PENDING")}
                    className={`py-2 px-3 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      activeMessage.status === "PENDING"
                        ? "bg-[#FBE843] text-black shadow-[2px_2px_0px_0px_#000000] ring-2 ring-yellow-300"
                        : "bg-yellow-50 text-yellow-900 hover:bg-yellow-100 hover:-translate-x-px hover:-translate-y-px"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeMessage.status === "PENDING" ? "Pending ⏳" : "Set Pending"}</span>
                  </button>

                  {/* 3. Denied */}
                  <button
                    type="button"
                    disabled={isTogglingStatus || activeMessage.status === "DECLINED"}
                    onClick={() => handleUpdateReachoutStatus("DECLINED")}
                    className={`py-2 px-3 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      activeMessage.status === "DECLINED"
                        ? "bg-zinc-700 text-white shadow-[2px_2px_0px_0px_#000000] ring-2 ring-zinc-400"
                        : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:-translate-x-px hover:-translate-y-px"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{activeMessage.status === "DECLINED" ? "Denied ⛔" : "Deny"}</span>
                  </button>

                  {/* 4. Block User */}
                  <button
                    type="button"
                    disabled={isTogglingStatus}
                    onClick={() =>
                      handleUpdateReachoutStatus(
                        activeMessage.status === "BLOCKED" ? "PENDING" : "BLOCKED"
                      )
                    }
                    className={`py-2 px-3 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeMessage.status === "BLOCKED"
                        ? "bg-red-600 text-white shadow-[2px_2px_0px_0px_#000000] ring-2 ring-red-300"
                        : "bg-red-50 text-red-900 hover:bg-red-100 hover:-translate-x-px hover:-translate-y-px"
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>
                      {activeMessage.status === "BLOCKED" ? "Unblock User" : "Block User"}
                    </span>
                  </button>
                </div>

                {/* Explanation text */}
                <p className="text-[11px] font-semibold text-zinc-600">
                  {activeMessage.status === "ACCEPTED"
                    ? `🎉 Talk More is approved. You and ${activeMessage.senderName} can exchange messages in real-time.`
                    : activeMessage.status === "PENDING"
                    ? `⏳ Reachout is awaiting your approval. You can approve to unlock 2-way chat, or type a reply below to automatically approve.`
                    : activeMessage.status === "DECLINED"
                    ? `⛔ Reachout has been denied. The sender cannot post further messages unless you approve.`
                    : `🚫 ${activeMessage.senderName} is blocked and cannot contact you on Pitchery.`}
                </p>
              </div>
            )}

            {statusMessage && (
              <div className="bg-emerald-100 border-2 border-emerald-700 text-emerald-900 rounded-xl p-3 text-xs font-bold mb-4">
                {statusMessage}
              </div>
            )}

            {/* Conversation Timeline & Messages */}
            <div className="space-y-4 max-h-120 overflow-y-auto pr-1 mb-6">
              {/* 1. Initial Reachout Message Bubble */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-[#FBE843] shrink-0 flex items-center justify-center">
                      {activeMessage.sender?.image ? (
                        <Image
                          src={activeMessage.sender.image}
                          alt={activeMessage.senderName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-xs">
                          {activeMessage.senderName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-black">
                        {activeMessage.senderName}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold ml-1.5">
                        (Original Inquiry)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {formatDate(activeMessage.createdAt)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-zinc-900 whitespace-pre-wrap leading-relaxed">
                  {activeMessage.message}
                </p>
              </div>

              {/* 2. Chronological Thread Replies */}
              {(activeMessage.replies || []).map((reply) => {
                const isMyReply = reply.senderId === currentUserId;
                const replySenderName =
                  reply.sender?.name ||
                  (reply.senderId === activeMessage.senderId
                    ? activeMessage.senderName
                    : activeMessage.receiver?.name || "Founder");

                return (
                  <div
                    key={reply.id}
                    className={`flex flex-col ${
                      isMyReply ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-2xl border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000] ${
                        isMyReply
                          ? "bg-[#FBE843] text-black"
                          : "bg-white text-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] font-black border-b border-black/10 pb-1">
                        <span>{isMyReply ? "You" : replySenderName}</span>
                        <span className="text-zinc-600 font-bold">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={threadBottomRef} />
            </div>

            {/* In-App Interactive Reply Form ("Reachout Revert") */}
            <div className="pt-4 border-t-2 border-zinc-200">
              {activeMessage.status === "ACCEPTED" ? (
                <form onSubmit={handleSendReply} className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type your reply to ${
                        isReceiver
                          ? activeMessage.senderName
                          : activeMessage.receiver?.name || "Founder"
                      }...`}
                      className="w-full bg-white border-2 border-black rounded-2xl p-3.5 text-xs sm:text-sm font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-zinc-500">
                      Press Send to deliver revert directly in-app.
                    </div>

                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSendingReply}
                      className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingReply ? "SENDING..." : "SEND REVERT"}</span>
                    </button>
                  </div>
                </form>
              ) : activeMessage.status === "PENDING" ? (
                isReceiver ? (
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply directly to ${activeMessage.senderName} (will automatically Approve Talk More)...`}
                        className="w-full bg-white border-2 border-black rounded-2xl p-3.5 text-xs sm:text-sm font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-zinc-500">
                        Replying automatically approves Talk More for this pitch.
                      </div>

                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSendingReply}
                        className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingReply ? "SENDING..." : "REPLY & APPROVE"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-yellow-900 font-black text-xs uppercase mb-1">
                      <Lock className="w-4 h-4 text-yellow-700" />
                      <span>Awaiting Founder Approval</span>
                    </div>
                    <p className="text-[11px] font-semibold text-yellow-800">
                      You sent 1 reachout on this pitch. Once the founder approves &quot;Talk More&quot;, the interactive reply thread will unlock here.
                    </p>
                  </div>
                )
              ) : activeMessage.status === "BLOCKED" ? (
                <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-red-900 font-black text-xs uppercase mb-1">
                    <Ban className="w-4 h-4 text-red-700" />
                    <span>User Blocked</span>
                  </div>
                  <p className="text-[11px] font-semibold text-red-800">
                    {isReceiver
                      ? "You have blocked this sender. Use the controls above if you want to unblock."
                      : "Communication for this conversation is restricted."}
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-100 border-2 border-zinc-300 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-700 font-black text-xs uppercase mb-1">
                    <XCircle className="w-4 h-4 text-zinc-500" />
                    <span>Conversation Closed (Denied)</span>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-500">
                    {isReceiver
                      ? "This reachout was declined. You can re-open or approve at any time using the controls above."
                      : "This reachout request was declined. Further messaging on this pitch is restricted."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
