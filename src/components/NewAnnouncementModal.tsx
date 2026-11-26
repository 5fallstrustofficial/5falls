"use client";

import React, { useState } from "react";
import { X, Pin, Mail, Loader2, Send, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredUserCount: number;
  resendConfigured: boolean;
  onSubmit: (payload: {
    title: string;
    description: string;
    isPinned: boolean;
    sendEmail: boolean;
  }) => Promise<string | null>;
}

export default function NewAnnouncementModal({
  isOpen,
  onClose,
  registeredUserCount,
  resendConfigured,
  onSubmit,
}: NewAnnouncementModalProps) {
  const { isTamil } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError(
        isTamil
          ? "தலைப்பு மற்றும் விளக்கம் இரண்டும் அவசியம்."
          : "Title and Description are required."
      );
      return;
    }

    setSubmitting(true);
    const errMsg = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      isPinned,
      sendEmail,
    });
    setSubmitting(false);

    if (errMsg) {
      setError(errMsg);
      return;
    }

    setTitle("");
    setDescription("");
    setIsPinned(false);
    setSendEmail(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-announcement-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-modal border border-[#dce2ea] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
          <h2 id="new-announcement-title" className="text-lg font-bold text-ink">
            {isTamil ? "புதிய அறிவிப்பு" : "New announcement"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:text-ink hover:bg-[#f1f4f8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="ann-title" className="block text-xs font-semibold text-ink mb-1.5">
              {isTamil ? "தலைப்பு" : "Title"} <span className="text-red-500">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isTamil
                  ? "இந்த அறிவிப்பு எதைப் பற்றியது?"
                  : "What is this announcement about?"
              }
              className="w-full h-11 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ann-desc" className="block text-xs font-semibold text-ink mb-1.5">
              {isTamil ? "விளக்கம் / செய்தி" : "Description"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ann-desc"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isTamil
                  ? "அறக்கட்டளை உறுப்பினர்கள் மற்றும் தன்னார்வலர்களுக்கான செய்தியை எழுதுங்கள்..."
                  : "Write the announcement message for Five Falls members and volunteers..."
              }
              className="w-full p-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all resize-y min-h-[120px]"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-center gap-2.5 text-sm text-ink-slate cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-[#dce2ea] text-primary focus:ring-primary/30 accent-[#006aff]"
              />
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium text-ink">
                {isTamil ? "மேலே பொருத்தவும் (Pin to top)" : "Pin to top"}
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-sm text-ink-slate cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#dce2ea] text-primary focus:ring-primary/30 accent-[#006aff]"
              />
              <div>
                <div className="flex items-center gap-1.5 font-medium text-ink">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {isTamil
                      ? "அனைத்து பதிவு செய்யப்பட்ட பயனர்களுக்கும் மின்னஞ்சல் அனுப்பவும்"
                      : "Send notification email to all registered users"}
                  </span>
                </div>
                <p className="text-[11px] text-ink-steel mt-0.5">
                  {registeredUserCount > 0
                    ? `Will notify ${registeredUserCount} registered member${registeredUserCount === 1 ? "" : "s"}${
                        resendConfigured ? " via Resend" : " (preview mode until RESEND_API_KEY is set)"
                      }.`
                    : resendConfigured
                    ? "Will send via Resend to all registered accounts."
                    : "Preview mode: set RESEND_API_KEY in .env.local to dispatch live emails."}
                </p>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#dce2ea]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="pill-secondary text-sm h-10 px-5"
            >
              {isTamil ? "ரத்து செய்" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="pill-primary text-sm h-10 px-5 gap-2 shadow-sm disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isTamil ? "அறிவிப்பை வெளியிடு" : "Post announcement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
