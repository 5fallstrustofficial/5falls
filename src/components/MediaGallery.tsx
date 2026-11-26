"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Play, Eye } from "lucide-react";
import { DEFAULT_GALLERY_ITEMS, type GalleryItem } from "@/data/galleryData";

interface MediaGalleryProps {
  onOpenVideo: (src: string, title: string) => void;
  onOpenLightbox: (src: string, alt: string) => void;
  showHeader?: boolean;
}

export default function MediaGallery({
  onOpenVideo,
  onOpenLightbox,
  showHeader = true,
}: MediaGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: GalleryItem[] } | null) => {
        if (data?.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {
        // Keep static fallback cleanly
      });
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      videos: items.filter((i) => i.category === "videos").length,
      lake: items.filter((i) => i.category === "lake").length,
      events: items.filter((i) => i.category === "events").length,
      work: items.filter((i) => i.category === "work").length,
    }),
    [items]
  );

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

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
            { id: "all", label: `All Media (${counts.all})` },
            { id: "videos", label: `Reels & Videos (${counts.videos})` },
            { id: "lake", label: `Lake & Water (${counts.lake})` },
            { id: "events", label: `Events & Ministers (${counts.events})` },
            { id: "work", label: `Field Operations (${counts.work})` },
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
              key={item.id ?? idx}
              className="group relative aspect-[4/3] rounded-card overflow-hidden border border-[#dce2ea] bg-slate-900 cursor-pointer shadow-xs hover:border-primary/50 transition-all"
              onClick={() => {
                if (item.type === "video") {
                  onOpenVideo(item.src, item.title);
                } else {
                  onOpenLightbox(item.src, item.title);
                }
              }}
            >
              {item.type === "video" && !item.poster ? (
                <video
                  src={item.src}
                  muted
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Image
                  src={item.poster || item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
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
