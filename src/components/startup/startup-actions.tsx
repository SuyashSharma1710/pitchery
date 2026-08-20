"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteStartupAction } from "@/lib/actions";
import StartupDeleteDialog from "./startup-delete-dialog";
import { Edit, Trash2 } from "lucide-react";

interface StartupActionsProps {
  startupId: string;
  authorId: string;
  currentUserId?: string;
  startupTitle: string;
}

export default function StartupActions({
  startupId,
  authorId,
  currentUserId,
  startupTitle,
}: StartupActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Only render if the current logged in user is the author
  if (!currentUserId || currentUserId !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteStartupAction(startupId);
    if (res.status === "SUCCESS") {
      router.push(`/user/${currentUserId}`);
      router.refresh();
    } else {
      alert(res.error || "Failed to delete pitch.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/startup/${startupId}/edit`}
          className="bg-white hover:bg-zinc-100 text-black border-2 border-black rounded-full py-2 px-4 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1.5"
        >
          <Edit className="w-3.5 h-3.5 text-[#EE2B69]" />
          EDIT PITCH
        </Link>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-50 hover:bg-red-100 text-red-600 border-2 border-black rounded-full py-2 px-3.5 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-1 cursor-pointer"
          title="Delete this startup pitch"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Delete Confirmation Modal (SRP) */}
      <StartupDeleteDialog
        isOpen={showConfirm}
        startupTitle={startupTitle}
        isDeleting={isDeleting}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
