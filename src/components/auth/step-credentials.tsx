"use client";

import { ArrowRight } from "lucide-react";

interface StepCredentialsProps {
  name: string;
  email: string;
  password: string;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onNext: (e: React.FormEvent) => void;
}

export default function StepCredentials({
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onNext,
}: StepCredentialsProps) {
  return (
    <form onSubmit={onNext} className="space-y-5 animate-in fade-in">
      <div>
        <div className="inline-block bg-[#FBE843] border-2 border-black rounded-full px-3.5 py-0.5 font-black text-[11px] uppercase tracking-wider mb-2">
          WELCOME
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          Let&apos;s start with the basics
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1">
          Enter your name and login credentials to begin pitching.
        </p>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Your Full Name *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Nathan Smith"
          className="w-full bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Email Address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="nathan@startup.com"
          className="w-full bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
          Create Password * (Min 6 chars)
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-[#F8F8F8] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-4 px-6 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
      >
        <span>Continue to Profile Setup</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
