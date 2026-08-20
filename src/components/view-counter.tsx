"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { incrementViewsAction } from "@/lib/actions";
import { formatViews } from "@/lib/utils";

export default function ViewCounter({
  id,
  initialViews = 0,
}: {
  id: string;
  initialViews?: number;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let mounted = true;
    const increment = async () => {
      try {
        const newViews = await incrementViewsAction(id);
        if (mounted && newViews > 0) {
          setViews(newViews);
        }
      } catch (err) {
        console.error("View increment error:", err);
      }
    };

    increment();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-[#FFE4E6] border-[2.5px] border-black rounded-full px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_#000000]">
      <Eye className="w-4 h-4 text-[#EE2B69]" />
      <span className="font-extrabold text-xs md:text-sm text-black">
        {formatViews(views)} views
      </span>
    </div>
  );
}
