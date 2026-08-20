"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Reachout } from "@/types";
import { formatDate } from "@/lib/utils";
import { markReachoutAsReadAction } from "@/lib/actions";
import { Mail, MailOpen, ExternalLink, Reply, Clock } from "lucide-react";

interface InboxTabProps {
  initialMessages: Reachout[];
}

export default function InboxTab({ initialMessages }: InboxTabProps) {
  const [messages, setMessages] = useState<Reachout[]>(initialMessages);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(
    initialMessages.length > 0 ? initialMessages[0].id : null
  );
  const [, startTransition] = useTransition();

  // React 19 Optimistic state for instant read status toggle
  const [optimisticMessages, setOptimisticMessages] = useOptimistic(
    messages,
    (state: Reachout[], readMessageId: string) =>
      state.map((m) => (m.id === readMessageId ? { ...m, isRead: true } : m))
  );

  const activeMessage =
    optimisticMessages.find((m) => m.id === activeMessageId) || null;

  const handleSelectMessage = (msg: Reachout) => {
    setActiveMessageId(msg.id);

    if (!msg.isRead) {
      startTransition(async () => {
        // 1. Optimistic update
        setOptimisticMessages(msg.id);

        // 2. Server Action call
        await markReachoutAsReadAction(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      });
    }
  };

  const unreadCount = optimisticMessages.filter((m) => !m.isRead).length;

  if (optimisticMessages.length === 0) {
    return (
      <div className="bg-white border-[3px] border-black rounded-3xl p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
        <div className="w-16 h-16 bg-pink-100 border-[3px] border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#000000]">
          <Mail className="w-8 h-8 text-[#EE2B69]" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">
          Your Inbox is Clear
        </h3>
        <p className="text-xs font-semibold text-zinc-500 max-w-sm mx-auto">
          When investors, partners, or fellow entrepreneurs reach out to you regarding your pitches, their direct inquiries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000000]">
      <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black uppercase tracking-tight text-black">
            Direct Reach-Out Inquiries
          </h3>
          {unreadCount > 0 && (
            <span className="bg-[#EE2B69] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border-[1.5px] border-black animate-pulse">
              {unreadCount} UNREAD
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Column */}
        <div className="lg:col-span-5 space-y-3 max-h-125 overflow-y-auto pr-1">
          {optimisticMessages.map((msg) => {
            const isSelected = activeMessage?.id === msg.id;

            return (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-4 rounded-xl border-2 border-black cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#FBE843] shadow-[3px_3px_0px_0px_#000000] -translate-x-px -translate-y-px"
                    : msg.isRead
                    ? "bg-[#F8F8F8] hover:bg-zinc-100"
                    : "bg-pink-50 hover:bg-pink-100 font-bold border-[#EE2B69]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {msg.isRead ? (
                      <MailOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-[#EE2B69] shrink-0 fill-current" />
                    )}
                    <span className="font-black text-xs text-black truncate">
                      {msg.senderName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                <div className="font-black text-xs text-zinc-900 truncate mb-1">
                  {msg.subject}
                </div>

                <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                  {msg.message}
                </p>

                {msg.startup && (
                  <div className="mt-2 text-[10px] font-black text-[#EE2B69] flex items-center gap-1">
                    <span>Target: {msg.startup.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message Viewer Column */}
        <div className="lg:col-span-7 bg-[#F8F8F8] border-2 border-black rounded-2xl p-6 flex flex-col justify-between">
          {activeMessage ? (
            <div>
              <div className="pb-4 border-b-2 border-zinc-200 mb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-[#EE2B69] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border-[1.5px] border-black uppercase tracking-wider">
                    DIRECT INQUIRY
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(activeMessage.createdAt)}
                  </div>
                </div>

                <h4 className="text-lg font-black text-black mb-2">
                  {activeMessage.subject}
                </h4>

                <div className="text-xs font-semibold text-zinc-700 space-y-1">
                  <div>
                    <span className="font-black text-black">From:</span>{" "}
                    {activeMessage.senderName} (
                    <a
                      href={`mailto:${activeMessage.senderEmail}`}
                      className="text-[#EE2B69] hover:underline"
                    >
                      {activeMessage.senderEmail}
                    </a>
                    )
                  </div>
                  {activeMessage.startup && (
                    <div>
                      <span className="font-black text-black">Regarding Pitch:</span>{" "}
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

              {/* Message Content */}
              <div className="bg-white border-2 border-black rounded-xl p-4 text-xs sm:text-sm font-medium text-zinc-900 whitespace-pre-wrap leading-relaxed mb-6">
                {activeMessage.message}
              </div>

              {/* Reply Button */}
              <div className="flex justify-end gap-2">
                <a
                  href={`mailto:${activeMessage.senderEmail}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject
                  )}`}
                  className="inline-flex items-center gap-2 bg-black text-white hover:bg-zinc-800 border-2 border-black rounded-full py-2 px-5 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#EE2B69] hover:-translate-x-px hover:-translate-y-px transition-all"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply to {activeMessage.senderName}
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400 font-bold text-xs">
              Select a message on the left to read details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
