"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Startup } from "@/types";
import { updateStartupAction } from "@/lib/actions";
import MarkdownEditor from "@/components/markdown-editor";
import { Send, Image as ImageIcon, Tag, FileText, Type } from "lucide-react";

export default function EditStartupForm({ startup }: { startup: Startup }) {
  const router = useRouter();
  const [pitchContent, setPitchContent] = useState(startup.pitch);

  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      formData.set("pitch", pitchContent);
      const res = await updateStartupAction(startup.id, prev, formData);
      if (res.status === "SUCCESS") {
        router.push(`/startup/${startup.id}`);
        router.refresh();
      }
      return res;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-8">
      {state?.status === "ERROR" && (
        <div className="p-4 bg-red-100 border-[3px] border-red-600 rounded-2xl text-red-700 font-bold text-sm">
          {state.error}
        </div>
      )}

      {/* 1. TITLE */}
      <div>
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-2 text-black">
          <Type className="w-4 h-4 text-[#EE2B69]" />
          TITLE
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={startup.title}
          placeholder="Startup Name (e.g. EcoTrack, YC Academy)"
          className="w-full bg-[#F8F8F8] border-[3px] border-black rounded-2xl p-4 font-bold text-base text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20 transition-all"
        />
      </div>

      {/* 2. DESCRIPTION */}
      <div>
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-2 text-black">
          <FileText className="w-4 h-4 text-[#EE2B69]" />
          DESCRIPTION
        </label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={startup.description}
          placeholder="Short, punchy one-sentence summary of what your startup does"
          className="w-full bg-[#F8F8F8] border-[3px] border-black rounded-2xl p-4 font-bold text-base text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20 transition-all resize-none"
        />
      </div>

      {/* 3. CATEGORY */}
      <div>
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-2 text-black">
          <Tag className="w-4 h-4 text-[#EE2B69]" />
          CATEGORY
        </label>
        <input
          type="text"
          name="category"
          required
          defaultValue={startup.category}
          placeholder="Choose a category (e.g. Tech, Health, Education, Climate)"
          className="w-full bg-[#F8F8F8] border-[3px] border-black rounded-2xl p-4 font-bold text-base text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20 transition-all"
        />
      </div>

      {/* 4. IMAGE/VIDEO LINK */}
      <div>
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-2 text-black">
          <ImageIcon className="w-4 h-4 text-[#EE2B69]" />
          IMAGE / VIDEO LINK
        </label>
        <input
          type="url"
          name="image"
          required
          defaultValue={startup.image}
          placeholder="Paste an image URL from Unsplash or direct media URL"
          className="w-full bg-[#F8F8F8] border-[3px] border-black rounded-2xl p-4 font-bold text-base text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EE2B69]/20 transition-all"
        />
      </div>

      {/* 5. PITCH (MARKDOWN STUDIO) */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wider mb-2 text-black">
          PITCH
        </label>
        <MarkdownEditor
          value={pitchContent}
          onChange={setPitchContent}
          placeholder="Detailed breakdown of the problem, your solution, market size, and technology architecture..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-[3px] border-black rounded-full py-4 px-10 font-black uppercase text-sm sm:text-base tracking-wider shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          <span>{isPending ? "SAVING CHANGES..." : "SAVE PITCH CHANGES"}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
