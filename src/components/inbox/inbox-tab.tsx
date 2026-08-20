"use client";

import { useState, useOptimistic, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reachout, ReachoutReply } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  markReachoutAsReadAction,
  toggleTalkMoreAction,
  sendReachoutReplyAction,
  getReachoutThreadAction,
} from "@/lib/actions";
import {
  Mail,
  MailOpen,
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
} from "lucide-react";

interface InboxTabProps {
  initialMessages: Reachout[];
  initialSentMessages?: Reachout[];
  currentUserId: string;
}

export default function InboxTab({
  initialMessages,
  initialSentMessages = [],
  currentUserId,
}: InboxTabProps) {
  const [folder, setFolder] = useState<"received" | "sent">("received");
  const [receivedMessages, setReceivedMessages] = useState<Reachout[]>(initialMessages);
  const [sentMessages, setSentMessages] = useState<Reachout[]>(initialSentMessages);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(() => {
    if (initialMessages.length > 0) return initialMessages[0].id;
    if (initialSentMessages.length > 0) return initialSentMessages[0].id;
    return null;
  });

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

  // Scroll to bottom of message thread when replies update
  const scrollToBottom = () => {
    setTimeout(() => {
      threadBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSelectMessage = (msg: Reachout) => {
    setActiveMessageId(msg.id);
    setStatusMessage(null);

    if (!msg.isRead && isReceiver) {
      startTransition(async () => {
        setOptimisticMessages(msg.id);
        await markReachoutAsReadAction(msg.id);
        setReceivedMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      });
    }
  };

  // Accept or Decline "Talk More" permission
  const handleToggleTalkMore = async (status: "ACCEPTED" | "DECLINED") => {
    if (!activeMessage || isTogglingStatus) return;
    setIsTogglingStatus(true);
    setStatusMessage(null);

    const res = await toggleTalkMoreAction(activeMessage.id, status);
    setIsTogglingStatus(false);

    if (res.status === "SUCCESS" && res.data) {
      const updated = res.data;
      setReceivedMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      setStatusMessage(
        status === "ACCEPTED"
          ? "🎉 Talk More enabled! You and the sender can now converse in real time."
          : "Reachout declined."
      );
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
      {/* Sub-tab Switcher: Received Inquiries vs Sent Reachouts */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setFolder("received");
              if (receivedMessages.length > 0) setActiveMessageId(receivedMessages[0].id);
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
                {unreadReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setFolder("sent");
              if (sentMessages.length > 0) setActiveMessageId(sentMessages[0].id);
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
              ? "When investors, partners, or founders reach out regarding your pitches, discussions will appear here."
              : "When you reach out to other startup founders, your conversations and their replies will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Messages List */}
          <div className="lg:col-span-5 space-y-3 max-h-160 overflow-y-auto pr-1">
            {optimisticMessages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              const isTalkMore = msg.status === "ACCEPTED";
              const isDeclined = msg.status === "DECLINED";

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#FBE843] shadow-[4px_4px_0px_0px_#000000] -translate-x-px -translate-y-px"
                      : msg.isRead || folder === "sent"
                      ? "bg-[#F8F8F8] hover:bg-zinc-100"
                      : "bg-pink-50 hover:bg-pink-100 font-bold border-[#EE2B69]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {folder === "received" && (
                        msg.isRead ? (
                          <MailOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-[#EE2B69] shrink-0 fill-current" />
                        )
                      )}
                      <span className="font-black text-xs text-black truncate">
                        {folder === "received"
                          ? msg.senderName
                          : `To: ${msg.receiver?.name || "Founder"}`}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>

                  <div className="font-black text-xs text-zinc-900 truncate mb-1">
                    {msg.subject}
                  </div>

                  <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed mb-2">
                    {msg.message}
                  </p>

                  {/* Status Badges */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/10">
                    {msg.startup ? (
                      <span className="text-[10px] font-black text-[#EE2B69] truncate">
                        Pitch: {msg.startup.title}
                      </span>
                    ) : (
                      <span />
                    )}

                    {isTalkMore ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                        💬 Talk More Active
                      </span>
                    ) : isDeclined ? (
                      <span className="bg-zinc-200 text-zinc-700 border border-zinc-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                        ⛔ Declined
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-900 border border-yellow-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                        ⏳ Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Two-Way Conversation Timeline ("Reachout Revert") */}
          <div className="lg:col-span-7 bg-[#F8F8F8] border-2 border-black rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-140">
            {activeMessage ? (
              <div className="flex flex-col h-full justify-between">
                {/* Conversation Header */}
                <div>
                  <div className="pb-4 border-b-2 border-zinc-200 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#EE2B69] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                          {folder === "received" ? "RECEIVED INQUIRY" : "SENT REACHOUT"}
                        </span>
                        {activeMessage.status === "ACCEPTED" && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            TALK MORE ACTIVE
                          </span>
                        )}
                        {activeMessage.status === "DECLINED" && (
                          <span className="bg-zinc-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            DECLINED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(activeMessage.createdAt)}</span>
                      </div>
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-black mb-2 leading-snug">
                      {activeMessage.subject}
                    </h4>

                    <div className="text-xs font-semibold text-zinc-700 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div>
                          <span className="font-black text-black">Sender:</span>{" "}
                          {activeMessage.senderName} ({activeMessage.senderEmail})
                        </div>
                        {activeMessage.senderId && (
                          <Link
                            href={`/user/${activeMessage.senderId}`}
                            className="text-[#EE2B69] hover:underline font-bold text-[11px] inline-flex items-center gap-0.5"
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
                            className="text-[#EE2B69] hover:underline font-bold inline-flex items-center gap-1"
                          >
                            {activeMessage.startup.title} <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Founder Permission Banner ("Talk More" Selector) */}
                  {isReceiver && activeMessage.status === "PENDING" && (
                    <div className="bg-yellow-100 border-2 border-black rounded-2xl p-4 mb-5 shadow-[3px_3px_0px_0px_#000000]">
                      <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#EE2B69]" />
                        <span>Founder Permission: Enable &quot;Talk More&quot;?</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 mb-3 leading-relaxed">
                        Allow <span className="font-black">{activeMessage.senderName}</span> to converse with you on Pitchery directly. If declined, further reachouts on this pitch are blocked.
                      </p>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={isTogglingStatus}
                          onClick={() => handleToggleTalkMore("ACCEPTED")}
                          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2 px-4 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept &amp; Talk More</span>
                        </button>

                        <button
                          type="button"
                          disabled={isTogglingStatus}
                          onClick={() => handleToggleTalkMore("DECLINED")}
                          className="bg-white hover:bg-zinc-100 text-zinc-800 border-2 border-black rounded-full py-2 px-3.5 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {statusMessage && (
                    <div className="bg-emerald-100 border-2 border-emerald-700 text-emerald-900 rounded-xl p-3 text-xs font-bold mb-4">
                      {statusMessage}
                    </div>
                  )}

                  {/* Threaded Conversation Timeline (Reachout Revert) */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1 mb-6">
                    {/* 1. Initial Reachout Message Bubble */}
                    <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full border border-black overflow-hidden bg-[#FBE843] shrink-0">
                            {activeMessage.sender?.image ? (
                              <Image
                                src={activeMessage.sender.image}
                                alt={activeMessage.senderName}
                                width={28}
                                height={28}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-[10px]">
                                {activeMessage.senderName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs text-black">
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
                            className={`max-w-[88%] sm:max-w-[80%] rounded-2xl border-2 border-black p-3.5 shadow-[2px_2px_0px_0px_#000000] ${
                              isMyReply
                                ? "bg-[#FBE843] text-black"
                                : "bg-white text-zinc-900"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-black border-b border-black/10 pb-1">
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
                </div>

                {/* Bottom: In-App Interactive Reply Form ("Reachout Revert") */}
                <div className="pt-3 border-t-2 border-zinc-200">
                  {activeMessage.status === "ACCEPTED" ? (
                    <form onSubmit={handleSendReply} className="space-y-3">
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Type your reply to ${
                            isReceiver ? activeMessage.senderName : activeMessage.receiver?.name || "Founder"
                          }...`}
                          className="w-full bg-white border-2 border-black rounded-2xl p-3 text-xs sm:text-sm font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
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
                            placeholder={`Reply directly to ${activeMessage.senderName} (will automatically enable Talk More)...`}
                            className="w-full bg-white border-2 border-black rounded-2xl p-3 text-xs sm:text-sm font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-bold text-zinc-500">
                            Replying automatically accepts Talk More for this pitch.
                          </div>

                          <button
                            type="submit"
                            disabled={!replyText.trim() || isSendingReply}
                            className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSendingReply ? "SENDING..." : "REPLY & ACCEPT"}</span>
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
                          You sent 1 reachout on this pitch. Once the founder accepts &quot;Talk More&quot;, the interactive reply thread will unlock here.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="bg-zinc-100 border-2 border-zinc-300 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-700 font-black text-xs uppercase mb-1">
                        <XCircle className="w-4 h-4 text-zinc-500" />
                        <span>Conversation Closed</span>
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-500">
                        This reachout request was declined. Further messaging on this pitch is restricted.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400 font-bold text-xs">
                <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <span>Select a conversation from the left to view the thread and send replies</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
