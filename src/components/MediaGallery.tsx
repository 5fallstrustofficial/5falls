"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Eye, Filter, Sparkles } from "lucide-react";

interface MediaGalleryProps {
  onOpenVideo: (src: string, title: string) => void;
  onOpenLightbox: (src: string, alt: string) => void;
  showHeader?: boolean;
}

const GALLERY_ITEMS = [
  // Videos
  {
    type: "video",
    src: "/video/u-2026-10-24-tree-planting-reel.mp4",
    poster: "/img/u-2026-10-24-reel.webp",
    title: "15 Dry Years to Water Again",
    category: "videos",
  },
  {
    type: "video",
    src: "/video/u-2026-11-05-lake-event-reel.mp4",
    poster: "/img/u-2026-11-05-reel.webp",
    title: "Lake Protection Walk & Tree Planting Reel",
    category: "videos",
  },
  {
    type: "video",
    src: "/video/u-2026-11-08-diwali.mp4",
    poster: "/img/u-2026-11-08-diwali.webp",
    title: "Diwali Message from Puduthangal Lake",
    category: "videos",
  },
  // Key Lake Images
  {
    type: "image",
    src: "/img/hero-excavator.webp",
    title: "Excavator reshaping the bank (13 Oct 2026)",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/lake-with-water.webp",
    title: "Puduthangal Lake holding water with egrets",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/across-the-lake.webp",
    title: "Looking across the reshaped lake basin",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/cleared-bank.webp",
    title: "Cleared and graded lake bund perimeter",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/slope.webp",
    title: "Graded slope constructed to retain runoff",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/levelled-pylon.webp",
    title: "Ground levelled by high-tension power pylon",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/standing-water.webp",
    title: "Fresh catchment basin collecting early rainwater",
    category: "lake",
  },
  {
    type: "image",
    src: "/img/pond-cleaned.webp",
    title: "Thulukankulam pond cleaned and revitalized",
    category: "lake",
  },
  // Events & Dignitaries
  {
    type: "image",
    src: "/img/u-2026-11-05-b-05.webp",
    title: "Minister Sarathkumar with S. Shanthi and team",
    category: "events",
  },
  {
    type: "image",
    src: "/img/u-2026-10-21-minister-1.webp",
    title: "Minister & Corporation officials inspecting inlet",
    category: "events",
  },
  {
    type: "image",
    src: "/img/u-2026-10-23-1.webp",
    title: "Mega tree planting drive at lake bund",
    category: "events",
  },
  {
    type: "image",
    src: "/img/u-2026-11-05-b-10.webp",
    title: "College student volunteers and community rally",
    category: "events",
  },
  {
    type: "image",
    src: "/img/u-2026-11-06-news.webp",
    title: "Chenthamil Naadu weekly front-page coverage",
    category: "events",
  },
  {
    type: "image",
    src: "/img/u-2026-11-05-invitation.webp",
    title: "Official restoration event invitation letter",
    category: "events",
  },
  // Work in Progress
  {
    type: "image",
    src: "/img/u-2026-10-15-1.webp",
    title: "Excavator working beneath dark monsoon clouds",
    category: "work",
  },
  {
    type: "image",
    src: "/img/u-2026-10-15-2.webp",
    title: "Uprooting invasive thorny vegetation by root",
    category: "work",
  },
  {
    type: "image",
    src: "/img/u-2026-10-15-3.webp",
    title: "Piles of cleared thorny brush along bund",
    category: "work",
  },
  {
    type: "image",
    src: "/img/u-2026-10-21-4.webp",
    title: "Water flowing into lake via stone inlet channel",
    category: "work",
  },
];

export default function MediaGallery({
  onOpenVideo,
  onOpenLightbox,
  showHeader = true,
}: MediaGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems =
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className={`${showHeader ? "py-20" : "pt-8 pb-16"} px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]`}>
      <div className="max-w-6xl mx-auto">
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              Media & Field Documentation
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              High-definition photographs and video reels chronicling every milestone of the lake revival.
            </p>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "all", label: "All Media (21 Featured)" },
            { id: "videos", label: "Reels & Videos (3)" },
            { id: "lake", label: "Lake & Water (8)" },
            { id: "events", label: "Events & Ministers (6)" },
            { id: "work", label: "Field Operations (4)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-ink-slate border border-[#dce2ea] hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] rounded-card overflow-hidden border border-[#dce2ea] bg-slate-900 cursor-pointer shadow-xs hover:border-primary/50 transition-all"
              onClick={() => {
                if (item.type === "video") {
                  onOpenVideo(item.src, item.title);
                } else {
                  onOpenLightbox(item.src, item.title);
                }
              }}
            >
              <Image
                src={item.poster || item.src}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Type Badge */}
              <div className="absolute top-2.5 right-2.5">
                {item.type === "video" ? (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <p className="text-xs font-semibold line-clamp-2 drop-shadow-sm leading-tight">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
