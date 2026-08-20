"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, quickDemoLoginAction } from "@/lib/actions";
import { LogIn, Sparkles, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const res = await loginAction(prev, formData);
    if (res.status === "SUCCESS") {
      router.push(callbackUrl);
      router.refresh();
    }
    return res;
  }, null);

  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemoLogin = async (userId: string) => {
    setDemoLoading(userId);
    const res = await quickDemoLoginAction(userId);
    if (res.status === "SUCCESS") {
      router.push(callbackUrl);
      router.refresh();
    }
    setDemoLoading(null);
  };

  return (
    <div className="w-full max-w-md bg-white border-[3px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_#000000]">
      <div className="text-center mb-8">
        <div className="inline-block bg-[#FBE843] border-2 border-black rounded-full px-4 py-1 font-black text-xs uppercase tracking-wider mb-3">
          PITCHERY AUTH
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-black">
          WELCOME BACK
        </h1>
        <p className="text-sm font-semibold text-zinc-600 mt-1">
          Log in to pitch startups, upvote, comment & connect
        </p>
      </div>

      {state?.status === "ERROR" && (
        <div className="mb-6 bg-red-100 border-2 border-red-600 text-red-700 px-4 py-3 rounded-xl font-bold text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="founder@startup.com"
            className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-3 text-sm font-bold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-3 text-sm font-bold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-3.5 px-6 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          {isPending ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>

      {/* 1-Click Quick Demo Login Switcher */}
      <div className="mt-8 pt-6 border-t-2 border-zinc-200">
        <div className="flex items-center justify-center gap-1 text-xs font-black uppercase text-zinc-500 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#EE2B69]" />
          <span>OR 1-CLICK DEMO LOGIN</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("user_nathan_smith")}
            disabled={Boolean(demoLoading)}
            className="p-2.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-left text-xs font-black transition-all cursor-pointer"
          >
            👑 Nathan Smith
            <div className="text-[10px] text-zinc-600 font-normal">DevFlow Founder</div>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("user_suyash_sharma")}
            disabled={Boolean(demoLoading)}
            className="p-2.5 bg-pink-100 hover:bg-pink-200 border-2 border-black rounded-xl text-left text-xs font-black transition-all cursor-pointer"
          >
            🚀 Suyash Sharma
            <div className="text-[10px] text-zinc-600 font-normal">YC Academy Founder</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs font-bold text-zinc-600">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-[#EE2B69] hover:underline font-black inline-flex items-center gap-1"
          >
            Create Account <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center py-12 px-4">
      <Suspense fallback={<div className="font-bold text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
