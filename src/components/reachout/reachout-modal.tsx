"use client";

import { useState } from "react";
import { User, Startup } from "@/types";
import { createReachoutAction } from "@/lib/actions";
import { Mail, Send, X, CheckCircle2 } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (res.status === "SUCCESS") {
      setStatus("SUCCESS");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("IDLE");
        setMessage("");
      }, 2000);
    } else {
      setStatus("ERROR");
      setErrorMessage(res.error || "Failed to deliver message.");
    }
  };

  return (
    <>
      {/* Reach Out Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#FBE843] hover:bg-[#ebd729] text-black border-[3px] border-black rounded-full py-3 px-6 font-black uppercase text-xs sm:text-sm tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Mail className="w-4 h-4" />
        REACH OUT TO FOUNDER
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border-4 border-black rounded-[28px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000]">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 bg-[#F8F8F8] hover:bg-zinc-200 border-2 border-black rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-block bg-[#EE2B69] text-white border-2 border-black rounded-full px-3.5 py-1 font-black text-xs uppercase tracking-wider mb-2">
                PRIVATE MESSAGE
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                REACH OUT TO {founder.name}
              </h2>
              <p className="text-xs font-semibold text-zinc-600 mt-1">
                This direct inquiry lands securely in {founder.name}&apos;s private Pitchery inbox.
              </p>
            </div>

            {status === "SUCCESS" ? (
              <div className="py-8 text-center bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-black uppercase text-emerald-900">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  The founder has been notified in their private inbox.
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

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-full border-2 border-black font-black uppercase text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#EE2B69] hover:bg-[#d9225c] text-white border-2 border-black rounded-full py-2.5 px-6 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "SENDING..." : "SEND REACHOUT"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
