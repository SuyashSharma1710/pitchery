"use client";

import Image from "next/image";
import { UserPlus, ArrowLeft } from "lucide-react";
import ProfileBadgePreview from "./profile-badge-preview";

export const AVATAR_PRESETS = [
  {
    label: "Robo Tech",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=techno",
  },
  {
    label: "Cyber Founder",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=founder",
  },
  {
    label: "AI Maestro",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=spark",
  },
  {
    label: "Visionary",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "Engineer",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
];

interface StepAvatarProps {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  customAvatar: string;
  isSubmitting: boolean;
  onAvatarSelect: (url: string) => void;
  onCustomAvatarChange: (val: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepAvatar({
  name,
  username,
  bio,
  avatar,
  customAvatar,
  isSubmitting,
  onAvatarSelect,
  onCustomAvatarChange,
  onBack,
  onSubmit,
}: StepAvatarProps) {
  const activeAvatar = customAvatar.trim() || avatar;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="inline-block bg-[#FBE843] border-2 border-black rounded-full px-3.5 py-0.5 font-black text-[11px] uppercase tracking-wider mb-2">
          FINAL TOUCH
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          Pick your founder look
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1">
          Select an avatar preset or paste your own custom photo link.
        </p>
      </div>

      {/* Avatar Presets Grid */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
          Select an Avatar Preset
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-3 px-1">
          {AVATAR_PRESETS.map((item, idx) => {
            const isSelected = avatar === item.url && !customAvatar;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onAvatarSelect(item.url)}
                className={`relative group p-1 rounded-full border-[3px] border-black transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#EE2B69] shadow-[4px_4px_0px_0px_#000000] -translate-y-1"
                    : "bg-white hover:bg-yellow-200 hover:-translate-y-0.5"
                }`}
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#FBE843]">
                  <Image
                    src={item.url}
                    alt={item.label}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FBE843] text-black w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black shadow-[1px_1px_0px_0px_#000000]">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Avatar Input */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Or Paste Image URL (Optional)
        </label>
        <input
          type="url"
          value={customAvatar}
          onChange={(e) => onCustomAvatarChange(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3 text-xs sm:text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
        />
      </div>

      {/* Live Badge Preview (SRP) */}
      <ProfileBadgePreview
        name={name}
        username={username}
        bio={bio}
        avatarUrl={activeAvatar}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-full border-2 border-black text-xs font-black uppercase text-zinc-700 hover:bg-zinc-100 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-4 px-8 font-black uppercase text-sm tracking-wider shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSubmitting ? "LAUNCHING..." : "COMPLETE & LAUNCH 🚀"}</span>
        </button>
      </div>
    </div>
  );
}
