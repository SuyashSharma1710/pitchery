"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface ProfileBadgePreviewProps {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

export default function ProfileBadgePreview({
  name,
  username,
  bio,
  avatarUrl,
}: ProfileBadgePreviewProps) {
  return (
    <div className="p-4 bg-yellow-50 border-[2.5px] border-black rounded-2xl">
      <div className="text-[10px] font-black uppercase text-zinc-600 mb-2 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#EE2B69]" />
        YOUR PROFILE BADGE PREVIEW
      </div>
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-black">
        <div className="relative w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-[#FBE843] shrink-0">
          <Image
            src={avatarUrl}
            alt={name || "Avatar"}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-sm text-black truncate">{name || "Your Name"}</h4>
          <p className="text-xs font-bold text-[#EE2B69]">@{username || "username"}</p>
          <p className="text-[11px] text-zinc-600 truncate">{bio || "Your short bio"}</p>
        </div>
      </div>
    </div>
  );
}
