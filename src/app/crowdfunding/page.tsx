"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoModal from "@/components/VideoModal";
import LightboxModal from "@/components/LightboxModal";
import {
  HandHeart,
  Heart,
  MapPin,
  Play,
  Phone,
  Copy,
  Check,
  X,
  ArrowRight,
  Loader2,
  Eye,
} from "lucide-react";
import {
  formatInr,
  type CrowdfundingCampaign,
} from "@/data/crowdfundingData";
import { useLanguage } from "@/context/LanguageContext";

export default function CrowdfundingPage() {
  const { isTamil } = useLanguage();
  const [campaigns, setCampaigns] = useState<CrowdfundingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Media modals
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
  }>({ isOpen: false, src: "", title: "" });
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({ isOpen: false, src: "", alt: "" });

  // Support modal
  const [supportCampaign, setSupportCampaign] =
    useState<CrowdfundingCampaign | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    fetch("/api/crowdfunding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { campaigns?: CrowdfundingCampaign[] } | null) => {
        if (data?.campaigns) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {
        // Ignore gracefully
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleCampaigns = useMemo(() => {
    const publicList = campaigns.filter((c) => c.status !== "paused");
    if (filter === "all") return publicList;
    return publicList.filter((c) => c.status === filter);
  }, [campaigns, filter]);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f9fafb] text-ink">
      <Navbar />

      {/* Page Header */}
      <section className="pt-36 sm:pt-40 pb-14 px-4 sm:px-6 bg-white border-b border-[#dce2ea]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-steel mb-3">
            <Link href="/" className="hover:text-primary">
              {isTamil ? "முகப்பு" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-primary">
              {isTamil ? "நிதி திரட்டல்" : "Crowdfunding"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <HandHeart className="w-3.5 h-3.5" />
            <span>
              {isTamil ? "சமூக உதவி · நேரடி ஆதரவு" : "Verified Community Aid"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            {isTamil
              ? "தேவையில் உள்ளவர்களுக்கு உதவுங்கள்"
              : "Support People in Urgent Need"}
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            {isTamil
              ? "ஐந்தருவி அறக்கட்டளையால் சரிபார்க்கப்பட்ட மருத்துவம், கல்வி மற்றும் அவசரத் தேவைகளுக்கான நேரடி நிதி திரட்டல்."
              : "Every campaign below is verified by Five Falls Women's Welfare Trust. View their story, photos, and videos, and contribute directly."}
          </p>
        </div>
      </section>

      {/* Filter & Campaign Cards */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: isTamil ? "அனைத்தும்" : "All Campaigns" },
                { id: "active", label: isTamil ? "செயலில் உள்ளவை" : "Active Needs" },
                { id: "completed", label: isTamil ? "நிறைவடைந்தவை" : "Funded" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id as "all" | "active" | "completed")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    filter === f.id
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white text-ink-slate border-[#dce2ea] hover:bg-[#f1f4f8]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Link
              href="/donate"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{isTamil ? "பொது அறக்கட்டளை நன்கொடை" : "General Trust Donation"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-16 flex flex-col items-center justify-center gap-3 text-ink-steel">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading campaigns...</span>
            </div>
          ) : visibleCampaigns.length === 0 ? (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <HandHeart className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-ink">
                {isTamil ? "தற்போது நிதி திரட்டல் பதிவுகள் இல்லை" : "No active crowdfunding campaigns right now"}
              </h2>
              <p className="text-sm text-ink-slate max-w-md mx-auto">
                Check back soon or support our ongoing lake restoration and women&apos;s welfare programs on the Donate page.
              </p>
              <Link href="/donate" className="pill-primary text-xs h-9 px-5 gap-1.5 inline-flex">
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Donate to 5Falls Trust</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleCampaigns.map((c) => {
                const pct =
                  c.targetAmount > 0
                    ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100))
                    : 0;
                const remaining = Math.max(0, c.targetAmount - c.raisedAmount);
                const leadImage = c.images[0]?.src;

                return (
                  <article
                    key={c.id}
                    className="bg-white rounded-modal border border-[#dce2ea] overflow-hidden shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Preview */}
                      {(leadImage || c.video?.src) && (
                        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                          {leadImage ? (
                            <img
                              src={leadImage}
                              alt={c.personName}
                              onClick={() =>
                                setLightbox({
                                  isOpen: true,
                                  src: leadImage,
                                  alt: `${c.personName} — ${c.title}`,
                                })
                              }
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <video
                              src={c.video!.src}
                              muted
                              className="w-full h-full object-cover"
                            />
                          )}

                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm border ${
                                c.status === "completed"
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white/95 text-emerald-700 border-white/50"
                              }`}
                            >
                              {c.status === "completed" ? "Goal Reached" : "Active Need"}
                            </span>
                          </div>

                          {c.video?.src && (
                            <button
                              type="button"
                              onClick={() =>
                                setVideoModal({
                                  isOpen: true,
                                  src: c.video!.src,
                                  title: `${c.personName} — ${c.title}`,
                                })
                              }
                              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-lg inline-flex items-center gap-1.5 hover:bg-primary/90"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Watch Video</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Body */}
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-primary uppercase tracking-wider">
                              {c.personName}
                            </span>
                            {c.location && (
                              <span className="inline-flex items-center gap-1 text-ink-steel">
                                <MapPin className="w-3.5 h-3.5" />
                                {c.location}
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-ink leading-snug">
                            {c.title}
                          </h2>
                        </div>

                        <p className="text-sm text-ink-slate leading-relaxed whitespace-pre-line">
                          {c.story}
                        </p>

                        {/* Extra Photos Strip */}
                        {c.images.length > 1 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {c.images.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setLightbox({
                                    isOpen: true,
                                    src: img.src,
                                    alt: img.alt || c.title,
                                  })
                                }
                                className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#dce2ea] group"
                              >
                                <img
                                  src={img.src}
                                  alt={img.alt || c.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-colors">
                                  <Eye className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100" />
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Progress + Support CTA */}
                    <div className="px-6 pb-6 pt-4 border-t border-[#eef2f6] space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <div>
                            <span className="text-lg font-extrabold text-ink">
                              {formatInr(c.raisedAmount)}
                            </span>{" "}
                            <span className="text-xs text-ink-steel">
                              raised of {formatInr(c.targetAmount)}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary">
                            {pct}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-[#eef2f6] overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full rounded-full bg-primary transition-all duration-500"
                          />
                        </div>

                        {c.status !== "completed" && remaining > 0 && (
                          <div className="text-[11px] font-medium text-ink-steel">
                            {formatInr(remaining)} still needed
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSupportCampaign(c)}
                          className="flex-1 pill-primary text-sm h-10 px-5 gap-2 justify-center"
                        >
                          <Heart className="w-4 h-4 fill-white" />
                          <span>
                            {c.status === "completed" ? "View Support Details" : "Support Now"}
                          </span>
                        </button>

                        {c.video?.src && !leadImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setVideoModal({
                                isOpen: true,
                                src: c.video!.src,
                                title: `${c.personName} — ${c.title}`,
                              })
                            }
                            className="pill-secondary text-xs h-10 px-4 gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Video</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Support Details Modal */}
      {supportCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea]">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Support Campaign
                </div>
                <h3 className="text-base font-bold text-ink">
                  {supportCampaign.personName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportCampaign(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:bg-[#f1f4f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <p className="text-ink-slate leading-relaxed">
                Contributing to <strong className="text-ink">{supportCampaign.title}</strong>{" "}
                (Goal: <strong className="text-ink">{formatInr(supportCampaign.targetAmount)}</strong>).
              </p>

              {supportCampaign.upiId ? (
                <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-2">
                  <div className="text-xs font-bold text-ink">Direct UPI ID</div>
                  <div className="flex items-center justify-between gap-2 bg-white border border-[#dce2ea] rounded-lg px-3 py-2">
                    <code className="font-mono text-xs font-bold text-primary truncate">
                      {supportCampaign.upiId}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(supportCampaign.upiId!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-primary shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 text-xs text-ink-slate">
                  You can contribute via the Trust&apos;s official donation page and mention{" "}
                  <strong className="text-ink">{supportCampaign.personName}</strong> in the reference note.
                </div>
              )}

              {supportCampaign.contactPhone && (
                <div className="flex items-center gap-2 text-xs text-ink-slate">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Contact: {supportCampaign.contactPhone}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dce2ea]">
                <button
                  type="button"
                  onClick={() => setSupportCampaign(null)}
                  className="pill-secondary text-xs h-9 px-4"
                >
                  Close
                </button>
                <Link
                  href="/donate"
                  className="pill-primary text-xs h-9 px-4 gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Go to Trust Donate Page</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, src: "", title: "" })}
        videoSrc={videoModal.src}
        title={videoModal.title}
      />

      <LightboxModal
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ isOpen: false, src: "", alt: "" })}
        imageSrc={lightbox.src}
        alt={lightbox.alt}
      />

      <Footer />
    </main>
  );
}
