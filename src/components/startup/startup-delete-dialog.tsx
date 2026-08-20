"use client";

import { AlertTriangle, X } from "lucide-react";

interface StartupDeleteDialogProps {
  isOpen: boolean;
  startupTitle: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StartupDeleteDialog({
  isOpen,
  startupTitle,
  isDeleting,
  onClose,
  onConfirm,
}: StartupDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white border-[4px] border-black rounded-[24px] p-6 shadow-[8px_8px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-tight text-black">
              Delete Startup Pitch?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-semibold text-zinc-600 mb-6 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <span className="font-black text-black">{startupTitle}</span>? This action cannot be undone and will remove all public comments and pitch metrics.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border-[2px] border-black text-xs font-black uppercase text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-[2px] border-black rounded-full py-2 px-5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "DELETING..." : "CONFIRM DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
}
