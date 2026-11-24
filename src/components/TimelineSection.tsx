"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UPDATES_TIMELINE } from "@/data/siteData";
import { Calendar, Play, Image as ImageIcon, ArrowRight, ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

interface TimelineSectionProps {
  onOpenVideo: (videoSrc: string, title: string) => void;
  onOpenLightbox: (imageSrc: string, alt: string) => void;
}

export default function TimelineSection({
  onOpenVideo,
  onOpenLightbox,
}: TimelineSectionProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredPosts =
    filter === "all"
      ? UPDATES_TIMELINE
      : UPDATES_TIMELINE.filter((p) => p.category === filter);

  return (
    <section id="updates" className="py-20 px-4 sm:px-6 bg-white border-t border-[#dce2ea]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
            Every Post from the Lake
          </h2>
          <p className="text-ink-slate text-base sm:text-lg">
            Chronological documentation of Puduthangal Lake&apos;s revival, synchronized with{" "}
            <a
              href="https://www.instagram.com/5falls.trust"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
            >
              @5falls.trust <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>

        {/* Filter Pills (from Bluesky DESIGN.md) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {[
            { id: "all", label: "All Updates" },
            { id: "event", label: "Events & Dignitaries" },
            { id: "work", label: "Excavation & Engineering" },
            { id: "news", label: "News & Press" },
            { id: "celebration", label: "Festivals & Thanks" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === cat.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-[#f9fafb] text-ink-slate border border-[#dce2ea] hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vertical Scroll Timeline (Quarry UI pattern) */}
        <div className="relative border-l border-[#dce2ea] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {filteredPosts.map((post) => (
            <div key={post.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:scale-125 transition-transform" />

              {/* Post Container Card */}
              <div className="bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-5 sm:p-7 hover:border-primary/40 transition-all shadow-xs">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                      {post.displayDate}
                    </span>
                    <span className="text-xs text-ink-steel font-medium capitalize">
                      · {post.category}
                    </span>
                  </div>

                  {post.instagramUrl && (
                    <a
                      href={post.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ink-steel hover:text-primary flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>View on Instagram</span>
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-ink mb-1">
                  {post.title}
                </h3>
                {post.tamilTitle && (
                  <p className="text-xs sm:text-sm font-semibold text-primary mb-3">
                    {post.tamilTitle}
                  </p>
                )}

                {/* Narrative */}
                <p className="text-xs sm:text-sm text-ink-slate leading-relaxed mb-3">
                  {post.description}
                </p>
                {post.tamilDescription && (
                  <p className="text-xs text-ink-steel leading-relaxed mb-5 italic bg-white/70 p-3 rounded-lg border border-[#dce2ea]/60">
                    {post.tamilDescription}
                  </p>
                )}

                {/* Video Reel Banner if present */}
                {post.video && (
                  <div className="mb-5">
                    <div
                      className="relative rounded-2xl overflow-hidden border border-[#dce2ea] bg-black cursor-pointer group/vid aspect-video max-h-72"
                      onClick={() => onOpenVideo(post.video!.src, post.title)}
                    >
                      {post.video.poster && (
                        <Image
                          src={post.video.poster}
                          alt={post.title}
                          fill
                          className="object-cover opacity-80 group-hover/vid:scale-102 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover/vid:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-semibold">
                        {post.video.caption || "Watch Instagram Reel"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Gallery Grid */}
                {post.images && post.images.length > 0 && (
                  <div
                    className={`grid gap-2 ${
                      post.images.length === 1
                        ? "grid-cols-1"
                        : post.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    }`}
                  >
                    {post.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-card overflow-hidden border border-[#dce2ea] cursor-pointer group/img"
                        onClick={() => onOpenLightbox(img.src, img.alt)}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
