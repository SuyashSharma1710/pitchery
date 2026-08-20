"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import MarkdownEditor from "./markdown-editor";
import { createStartupAction } from "@/lib/actions";

export default function StartupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [pitch, setPitch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", image);
    formData.append("pitch", pitch);

    startTransition(async () => {
      const res = await createStartupAction(null, formData);
      if (res.status === "SUCCESS" && res.data) {
        router.push(`/startup/${res.data.id}`);
      } else {
        setError(res.error || "An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-7">
      {error && (
        <div className="bg-[#FFF1F2] border-[2.5px] border-[#EE2B69] rounded-[18px] p-4 text-[#EE2B69] font-bold text-sm shadow-[3px_3px_0px_0px_#000000]">
          ⚠️ {error}
        </div>
      )}

      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          className="block font-black text-xs md:text-sm uppercase tracking-wider text-black mb-2"
        >
          Title
        </label>
        <div className="bg-white border-[3px] border-black rounded-full px-6 py-3.5 shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="JSM Academy Masterclass"
            className="w-full bg-transparent font-bold text-black placeholder:text-gray-400 outline-none text-sm md:text-base"
          />
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block font-black text-xs md:text-sm uppercase tracking-wider text-black mb-2"
        >
          Description
        </label>
        <div className="bg-white border-[3px] border-black rounded-3xl px-6 py-4 shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of your startup idea"
            className="w-full bg-transparent font-bold text-black placeholder:text-gray-400 outline-none text-sm md:text-base resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="category"
          className="block font-black text-xs md:text-sm uppercase tracking-wider text-black mb-2"
        >
          Category
        </label>
        <div className="bg-white border-[3px] border-black rounded-full px-6 py-3.5 shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <input
            id="category"
            name="category"
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Choose a category (e.g., Tech, Health, Education, etc.)"
            className="w-full bg-transparent font-bold text-black placeholder:text-gray-400 outline-none text-sm md:text-base"
          />
        </div>
      </div>

      {/* Image/Video Link Field */}
      <div>
        <label
          htmlFor="image"
          className="block font-black text-xs md:text-sm uppercase tracking-wider text-black mb-2"
        >
          Image/Video Link
        </label>
        <div className="bg-white border-[3px] border-black rounded-full px-6 py-3.5 shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <input
            id="image"
            name="image"
            type="url"
            required
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Paste a link to your demo or promotional media"
            className="w-full bg-transparent font-bold text-black placeholder:text-gray-400 outline-none text-sm md:text-base"
          />
        </div>
      </div>

      {/* Pitch Markdown Field */}
      <div>
        <label
          htmlFor="pitch"
          className="block font-black text-xs md:text-sm uppercase tracking-wider text-black mb-2"
        >
          Pitch
        </label>
        <MarkdownEditor
          value={pitch}
          onChange={setPitch}
          placeholder="Briefly describe your idea and what problem it solves"
        />
      </div>

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#EE2B69] text-white border-[3px] border-black rounded-full py-4 px-8 font-black uppercase text-sm md:text-base tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting pitch...</span>
            </>
          ) : (
            <>
              <span>SUBMIT YOUR PITCH</span>
              <Send className="w-4 h-4 fill-white rotate-12" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
