"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types";
import { Send, LogIn } from "lucide-react";

interface CommentFormProps {
  startupId: string;
  currentUser: User | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function CommentForm({
  startupId,
  currentUser,
  onSubmit,
  isSubmitting,
  error,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content);
    setContent("");
  };

  if (!currentUser) {
    return (
      <div className="bg-yellow-50 border-2 border-black rounded-xl p-4 text-center mb-8">
        <p className="text-sm font-bold text-black mb-3">
          Want to join the discussion and ask the founder a question?
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/startup/${startupId}`)}`}
          className="inline-flex items-center gap-2 bg-black text-white hover:bg-zinc-800 border-2 border-black rounded-full py-2 px-5 font-black text-xs uppercase tracking-wider"
        >
          <LogIn className="w-3.5 h-3.5" /> Sign In to Comment
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-3">
        <div className="relative w-10 h-10 rounded-full border-2 border-black overflow-hidden shrink-0 bg-yellow-100">
          <Image
            src={
              currentUser.image ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
            }
            alt={currentUser.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question or share constructive feedback on this pitch..."
            rows={3}
            className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-3 text-sm font-semibold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
          />
          {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2 px-5 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "POSTING..." : "POST COMMENT"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
