"use client";

import { ArrowRight, ArrowLeft, Check, Rocket, Briefcase, Code } from "lucide-react";

export const PERSONA_ROLES = [
  {
    id: "founder",
    title: "Startup Founder",
    desc: "I want to pitch my startups, get community upvotes, and attract investors.",
    icon: Rocket,
    defaultBio: "Startup Founder & Builder. Building the future.",
  },
  {
    id: "investor",
    title: "Investor / Scout",
    desc: "I want to discover high-potential startups and reach out directly to founders.",
    icon: Briefcase,
    defaultBio: "Angel Investor & Scout. Backing ambitious founders.",
  },
  {
    id: "builder",
    title: "Developer / Explorer",
    desc: "I want to explore architectures, test MVPs, and join community discussions.",
    icon: Code,
    defaultBio: "Full-Stack Developer & Tech Explorer.",
  },
];

interface StepPersonaProps {
  username: string;
  role: string;
  bio: string;
  onUsernameChange: (val: string) => void;
  onRoleSelect: (roleId: string, defaultBio: string) => void;
  onBioChange: (val: string) => void;
  onBack: () => void;
  onNext: (e: React.FormEvent) => void;
}

export default function StepPersona({
  username,
  role,
  bio,
  onUsernameChange,
  onRoleSelect,
  onBioChange,
  onBack,
  onNext,
}: StepPersonaProps) {
  return (
    <form onSubmit={onNext} className="space-y-5 animate-in fade-in">
      <div>
        <div className="inline-block bg-[#FBE843] border-2 border-black rounded-full px-3.5 py-0.5 font-black text-[11px] uppercase tracking-wider mb-2">
          IDENTITY
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          Choose your handle & role
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1">
          How should other founders and investors discover you?
        </p>
      </div>

      {/* Username Handle */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Username Handle *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 font-black text-sm text-zinc-400">@</span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => onUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="nathansmith"
            className="w-full pl-9 bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
          />
        </div>
      </div>

      {/* Persona Selection */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
          What best describes your primary goal?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PERSONA_ROLES.map((p) => {
            const Icon = p.icon;
            const isSelected = role === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onRoleSelect(p.id, p.defaultBio)}
                className={`p-3.5 rounded-2xl border-[2.5px] border-black text-left transition-all ${
                  isSelected
                    ? "bg-[#FBE843] shadow-[4px_4px_0px_0px_#000000] -translate-x-px -translate-y-px"
                    : "bg-[#F8F8F8] hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-5 h-5 text-black" />
                  {isSelected && <Check className="w-4 h-4 text-[#EE2B69]" />}
                </div>
                <div className="font-black text-xs text-black">{p.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Short Bio */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Tagline / Short Bio
        </label>
        <input
          type="text"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="e.g. Next.js Enthusiast & Climate Tech Founder"
          className="w-full bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-full border-2 border-black text-xs font-black uppercase text-zinc-700 hover:bg-zinc-100 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-3.5 px-7 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Avatar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
