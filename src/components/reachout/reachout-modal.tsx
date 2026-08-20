"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Startup, Reachout } from "@/types";
import { createReachoutAction, checkPitchReachoutStatusAction } from "@/lib/actions";
import {
  Mail,
  Send,
  X,
  CheckCircle2,
  Lock,
  LogIn,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";

interface ReachoutModalProps {
  founder: User;
  startup?: Startup;
  currentUser: User | null;
}

export default function ReachoutModal({
  founder,
  startup,
  currentUser,
}: ReachoutModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState(currentUser?.name || "");
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || "");
  const [subject, setSubject] = useState(
    startup ? `Inquiry regarding ${startup.title}` : `Connecting via Pitchery`
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  // Existing pitch reachout check
  const [hasExistingReachout, setHasExistingReachout] = useState(false);
  const [existingReachout, setExistingReachout] = useState<Reachout | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  // Check if current user already sent reachout for this pitch
  useEffect(() => {
    async function checkExisting() {
      if (!isOpen || !currentUser || !startup?.id) return;
      setIsCheckingExisting(true);
      const res = await checkPitchReachoutStatusAction(startup.id);
      setIsCheckingExisting(false);

      if (res.status === "SUCCESS" && res.data) {
        setHasExistingReachout(res.data.hasSent);
        setExistingReachout(res.data.reachout);
      }
    }

    checkExisting();
  }, [isOpen, currentUser, startup?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!senderName || !senderEmail || !subject || !message || isSubmitting) return;

    setIsSubmitting(true);
    setStatus("IDLE");

    const res = await createReachoutAction(founder.id, startup?.id || null, {
      senderName,
      senderEmail,
      subject,
      message,
    });

    setIsSubmitting(false);

    if (res.status === "SUCCESS" && res.data) {
      setStatus("SUCCESS");
      setHasExistingReachout(true);
      setExistingReachout(res.data);
      setTimeout(() => {
        setIsOpen(false);
        setStatus("IDLE");
        setMessage("");
      }, 2500);
    } else {
      setStatus("ERROR");
      setErrorMessage(res.error || "Failed to deliver message.");
    }
  };

  return (
    <>
      {/* Reach Out Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#FBE843] hover:bg-[#ebd729] text-black border-2 border-black rounded-full py-2.5 sm:py-3 px-5 sm:px-6 font-black uppercase text-xs sm:text-sm tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Mail className="w-4 h-4" />
        REACH OUT TO FOUNDER
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000]">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 bg-[#F8F8F8] hover:bg-zinc-200 border-2 border-black rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            {/* Case 1: Unauthenticated User Prompt */}
            {!currentUser ? (
              <div className="py-4 text-center">
                <div className="w-14 h-14 bg-pink-100 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#000000]">
                  <Lock className="w-7 h-7 text-[#EE2B69]" />
                </div>
                <div className="inline-block bg-[#EE2B69] text-white border-2 border-black rounded-full px-3.5 py-1 font-black text-xs uppercase tracking-wider mb-2">
                  AUTHENTICATION REQUIRED
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-2">
                  SIGN IN TO REACH OUT
                </h2>
                <p className="text-xs font-semibold text-zinc-600 max-w-sm mx-auto mb-6 leading-relaxed">
                  To protect founder privacy and prevent unsolicited spam, you must be signed into Pitchery to send direct reachout inquiries.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(
                      startup ? `/startup/${startup.id}` : `/user/${founder.id}`
                    )}`}
                    className="w-full sm:w-auto bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Continue</span>
                  </Link>
                </div>
              </div>
            ) : hasExistingReachout && existingReachout ? (
              /* Case 2: 1-Reachout Limit Hit (Already Sent for this Pitch) */
              <div className="py-2">
                <div className="mb-4">
                  <div className="inline-block bg-[#FBE843] text-black border-2 border-black rounded-full px-3.5 py-1 font-black text-xs uppercase tracking-wider mb-2">
                    1-REACHOUT LIMIT ACTIVE
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                    REACHOUT ALREADY SENT
                  </h2>
                  <p className="text-xs font-semibold text-zinc-600 mt-1">
                    You have already submitted an inquiry to {founder.name} for this pitch.
                  </p>
                </div>

                <div className="bg-[#F8F8F8] border-2 border-black rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <span className="text-xs font-black text-black">Status:</span>
                    {existingReachout.status === "ACCEPTED" ? (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-600 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                        💬 Talk More Active
                      </span>
                    ) : existingReachout.status === "DECLINED" ? (
                      <span className="bg-zinc-200 text-zinc-700 border border-zinc-400 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                        ⛔ Declined
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-900 border border-yellow-500 text-xs font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Founder Approval
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                    {existingReachout.status === "ACCEPTED"
                      ? "Great news! The founder accepted 'Talk More'. You can converse directly in your Private Inbox thread."
                      : existingReachout.status === "DECLINED"
                      ? "The founder has declined further reachouts for this pitch."
                      : "Senders are limited to 1 initial reachout per pitch. Once the founder accepts 'Talk More', you will be able to converse freely in your Inbox."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Close
                  </button>

                  <Link
                    href={`/user/${currentUser.id}?tab=inbox`}
                    className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>View in Private Inbox</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Case 3: Initial Reachout Form */
              <div>
                {/* Modal Header */}
                <div className="mb-6">
                  <div className="inline-block bg-[#EE2B69] text-white border-2 border-black rounded-full px-3.5 py-1 font-black text-xs uppercase tracking-wider mb-2">
                    PRIVATE MESSAGE
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                    REACH OUT TO {founder.name}
                  </h2>
                  <p className="text-xs font-semibold text-zinc-600 mt-1">
                    Send 1 initial inquiry. Once {founder.name} accepts &quot;Talk More&quot;, two-way live messaging unlocks in your inbox.
                  </p>
                </div>

                {status === "SUCCESS" ? (
                  <div className="py-8 text-center bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase text-emerald-900">
                      Reachout Sent Successfully!
                    </h3>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {founder.name} has been notified. You can track their response in your Private Inbox.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {status === "ERROR" && (
                      <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-700">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
                          Your Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="jane@partner.com"
                          className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
                        Subject Line *
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Investment / Partnership Inquiry"
                        className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1 text-black">
                        Private Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share details about your partnership, investment, or collaboration proposal..."
                        className="w-full bg-[#F8F8F8] border-2 border-black rounded-xl p-3 text-xs sm:text-sm font-semibold text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EE2B69] resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#EE2B69]" />
                        <span>1 initial reachout per pitch</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || isCheckingExisting}
                          className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? "SENDING..." : "SEND REACHOUT"}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
