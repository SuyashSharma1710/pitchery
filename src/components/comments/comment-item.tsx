"use client";

import Image from "next/image";
import { Comment } from "@/types";
import { formatDate } from "@/lib/utils";
import { Trash2, Clock } from "lucide-react";

interface CommentItemProps {
  comment: Comment & { isOptimistic?: boolean };
  isAuthor: boolean;
  onDelete: (commentId: string) => void;
}

export default function CommentItem({ comment, isAuthor, onDelete }: CommentItemProps) {
  const author = comment.user;

  return (
    <div
      className={`border-2 border-black rounded-xl p-4 flex gap-3.5 transition-all ${
        comment.isOptimistic
          ? "bg-yellow-50/70 border-dashed border-amber-500 animate-pulse"
          : "bg-[#F8F8F8]"
      }`}
    >
      <div className="relative w-9 h-9 rounded-full border-2 border-black overflow-hidden shrink-0 bg-yellow-200">
        <Image
          src={
            author?.image ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${author?.username || "user"}`
          }
          alt={author?.name || "Commenter"}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-black">
              {author?.name || "Founder"}
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              @{author?.username || "user"}
            </span>
            <span className="text-zinc-300 font-bold text-xs">•</span>
            {comment.isOptimistic ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 animate-spin" /> Posting...
              </span>
            ) : (
              <span className="text-[11px] font-bold text-zinc-400">
                {formatDate(comment.createdAt)}
              </span>
            )}
          </div>

          {isAuthor && !comment.isOptimistic && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm font-medium text-zinc-800 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
