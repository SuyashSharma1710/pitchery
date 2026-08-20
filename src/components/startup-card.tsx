"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import { Startup } from "@/types";
import { formatDate, formatViews } from "@/lib/utils";

export interface StartupCardProps {
  startup: Startup;
}

export default function StartupCard({ startup }: StartupCardProps) {
  const {
    id,
    title,
    description,
    category,
    image,
    views = 0,
    author,
    createdAt,
  } = startup;

  const authorName = author?.name || "Anonymous Founder";
  const authorImage =
    author?.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
  const authorId = author?.id || "anonymous";

  return (
    <div className="group relative bg-white border-[3px] border-black rounded-[24px] p-5 shadow-[4px_4px_0px_0px_#000000] hover:border-[#EE2B69] hover:shadow-[5px_5px_0px_0px_#EE2B69] transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Date & Views */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-[#FFE4E6] text-black px-3 py-1 rounded-full text-xs font-bold tracking-tight">
            {formatDate(createdAt)}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-black">
            <Eye className="w-3.5 h-3.5 text-[#EE2B69]" />
            <span>{formatViews(views)}</span>
          </div>
        </div>

        {/* Author Info & Avatar */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/user/${authorId}`}
            className="text-xs font-semibold text-gray-800 hover:text-[#EE2B69] transition-colors"
          >
            {authorName}
          </Link>

          <Link href={`/user/${authorId}`}>
            <div className="w-8 h-8 rounded-full border-[1.5px] border-black overflow-hidden bg-[#FBE843] flex-shrink-0">
              <Image
                src={authorImage}
                alt={authorName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        {/* Startup Title */}
        <Link href={`/startup/${id}`}>
          <h3 className="font-extrabold text-xl md:text-2xl text-black leading-snug mb-2 group-hover:text-[#EE2B69] transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="text-xs md:text-sm text-gray-700 font-medium line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Thumbnail Preview */}
        <Link href={`/startup/${id}`} className="block mb-4 overflow-hidden rounded-[16px] border border-black/15 bg-black">
          <div className="relative aspect-[16/9] w-full group-hover:scale-[1.02] transition-transform duration-300">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </Link>
      </div>

      {/* Footer: Category Pill & Details Action */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 mt-auto">
        <span className="text-xs font-bold text-gray-900 tracking-wide">
          {category}
        </span>

        <Link
          href={`/startup/${id}`}
          className="bg-black text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#EE2B69] hover:shadow-[2px_2px_0px_0px_#000000] active:scale-95 transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
