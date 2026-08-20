"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { User } from "@/types";
import { updateUserBioAction } from "@/lib/actions";

interface ProfileCardProps {
  user: User;
  isOwner?: boolean;
}

export default function ProfileCard({ user, isOwner = false }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio || "");
  const [persistedBio, setPersistedBio] = useState(user.bio || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // React 19 Optimistic state for founder bio
  const [optimisticBio, setOptimisticBio] = useOptimistic(
    persistedBio,
    (_, newBio: string) => newBio
  );

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setError(null);
    const targetBio = bioInput.trim();

    startTransition(async () => {
      // 1. Instant Optimistic Render
      setOptimisticBio(targetBio);
      setIsEditing(false);

      // 2. Server Action Mutation
      const res = await updateUserBioAction(targetBio);
      if (res.status === "SUCCESS" && res.data) {
        setPersistedBio(res.data.bio || targetBio);
      } else {
        setError(res.error || "Failed to update bio.");
        setPersistedBio((prev) => prev); // fallback
        setIsEditing(true);
      }
    });
  };

  const handleCancel = () => {
    setBioInput(persistedBio);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-[#EE2B69] border-[3px] border-black rounded-[28px] p-6 text-center shadow-[6px_6px_0px_0px_#000000]">
      {/* Doodle Sparks Accent in Top-Left */}
      <div className="absolute -top-4 -left-4 text-black font-black select-none">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black"
        >
          <path d="M12 3v3" />
          <path d="M4.93 4.93l2.12 2.12" />
          <path d="M3 12h3" />
        </svg>
      </div>

      {/* Top Founder Name Badge */}
      <div className="inline-block bg-white border-[2.5px] border-black rounded-xl px-6 py-2 shadow-[3px_3px_0px_0px_#000000] mb-6">
        <h2 className="font-black text-base md:text-lg uppercase tracking-wider text-black">
          {user.name}
        </h2>
      </div>

      {/* Profile Avatar with Yellow Ring */}
      <div className="relative mx-auto w-40 h-40 rounded-full border-[3.5px] border-black bg-[#FBE843] p-1.5 shadow-[4px_4px_0px_0px_#000000] mb-5 overflow-hidden">
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <Image
            src={user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Handle & Bio */}
      <div className="text-white space-y-3">
        <h3 className="font-black text-xl md:text-2xl tracking-tight">
          @{user.username}
        </h3>

        {isEditing ? (
          /* Inline Bio Editor Form */
          <form onSubmit={handleSaveBio} className="space-y-3 pt-1">
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              required
              rows={3}
              placeholder="Write a punchy bio about yourself and your startups..."
              className="w-full bg-white text-black border-[2.5px] border-black rounded-xl p-3 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FBE843] resize-none shadow-[2px_2px_0px_0px_#000000]"
            />
            {error && <p className="text-[11px] font-black text-yellow-300">{error}</p>}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="bg-zinc-900 hover:bg-black text-white border-[2px] border-black rounded-full py-1.5 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending || !bioInput.trim()}
                className="bg-[#FBE843] hover:bg-[#ebd729] text-black border-[2px] border-black rounded-full py-1.5 px-5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "SAVING..." : "SAVE BIO"}
              </button>
            </div>
          </form>
        ) : (
          /* Bio Display with Optimistic Updates */
          <div className="space-y-3">
            <p className="text-white font-semibold text-sm md:text-base leading-relaxed max-w-xs mx-auto">
              {optimisticBio || "No bio added yet."}
            </p>

            {/* Edit Bio Button (Visible to Profile Owner) */}
            {isOwner && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setBioInput(persistedBio);
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white border-[2px] border-white/80 rounded-full py-1 px-4 text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:scale-105 cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#FBE843]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Edit Bio</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
