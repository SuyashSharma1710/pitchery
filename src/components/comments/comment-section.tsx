"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Comment, User } from "@/types";
import { createCommentAction, deleteCommentAction } from "@/lib/actions";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import { MessageSquare } from "lucide-react";

interface CommentSectionProps {
  startupId: string;
  initialComments: Comment[];
  currentUser: User | null;
}

type OptimisticComment = Comment & { isOptimistic?: boolean };

type OptimisticAction =
  | { type: "add"; comment: OptimisticComment }
  | { type: "delete"; id: string };

export default function CommentSection({
  startupId,
  initialComments,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // React 19 Optimistic state for comments
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    comments,
    (state: OptimisticComment[], action: OptimisticAction) => {
      if (action.type === "add") {
        return [action.comment, ...state];
      }
      if (action.type === "delete") {
        return state.filter((c) => c.id !== action.id);
      }
      return state;
    }
  );

  const handleAddComment = async (content: string) => {
    if (!currentUser) {
      setError("You must be logged in to leave a comment.");
      return;
    }

    setError(null);

    const tempComment: OptimisticComment = {
      id: `temp-${Date.now()}`,
      startupId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser,
      isOptimistic: true,
    };

    startTransition(async () => {
      // 1. Instant Optimistic Render
      setOptimisticComments({ type: "add", comment: tempComment });

      // 2. Dispatch Server Action
      const res = await createCommentAction(startupId, content);
      if (res.status === "SUCCESS" && res.data) {
        setComments((prev) => [res.data!, ...prev]);
      } else {
        setError(res.error || "Failed to post comment.");
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      // 1. Instant Optimistic Removal
      setOptimisticComments({ type: "delete", id: commentId });

      // 2. Dispatch Server Action
      const res = await deleteCommentAction(commentId, startupId);
      if (res.status === "SUCCESS") {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(res.error || "Failed to delete comment.");
      }
    });
  };

  return (
    <div className="w-full bg-white border-[3px] border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] mt-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-black mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#FBE843] p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <MessageSquare className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-black">
              Community Discussion
            </h3>
            <p className="text-xs font-bold text-zinc-500">
              {optimisticComments.length}{" "}
              {optimisticComments.length === 1 ? "Comment" : "Comments"}
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form Island (SRP) */}
      <CommentForm
        startupId={startupId}
        currentUser={currentUser}
        onSubmit={handleAddComment}
        isSubmitting={isPending}
        error={error}
      />

      {/* Comments List with Optimistic Entries */}
      <div className="space-y-4">
        {optimisticComments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 font-bold text-sm">
            No comments yet. Be the first to share your thoughts on this startup pitch!
          </div>
        ) : (
          optimisticComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthor={currentUser?.id === comment.userId}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
