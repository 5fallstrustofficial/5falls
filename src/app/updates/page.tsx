"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import { ScrollTimeline } from "@/components/scroll-timeline";
import { VideoDialog } from "@/components/video-dialog";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import { SITE_METADATA, UPDATES_TIMELINE } from "@/data/siteData";

export default function UpdatesPage() {
  const [filter, setFilter] = useState<string>("all");
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const filteredPosts =
    filter === "all"
      ? UPDATES_TIMELINE
      : UPDATES_TIMELINE.filter((p) => p.category === filter);

  return (
    <main className="min-h-screen bg-[#f9fafb] text-ink">
      <Navbar />

      {/* Page Header */}
      <section className="pt-36 sm:pt-40 pb-14 px-4 sm:px-6 bg-white border-b border-[#dce2ea]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-steel mb-3">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">Field Updates</span>
          </div>

          

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            Field Updates & News Archive
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            Direct dispatches from the banks of Puduthangal Lake. Tracking every milestone from the first puja and JCB cut on 2 October to VIP inspections, tree plantations, and water retention.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <a
              href={SITE_METADATA.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-primary text-sm h-9 px-5 gap-1.5 shadow-xs"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow Live on Instagram (@5falls.trust)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Video Dialogs Grid (Quarry UI) */}
      <section className="py-12 px-4 sm:px-6 bg-white border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-4">Featured Video Dispatches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VideoDialog
              src="/video/u-2026-10-24-tree-planting-reel.mp4"
              thumbnail="/img/u-2026-10-24-reel.webp"
              title="15 Dry Years to Water Again"
              subtitle="Reel (2 min)"
            />
            <VideoDialog
              src="/video/u-2026-11-05-lake-event-reel.mp4"
              thumbnail="/img/u-2026-11-05-reel.webp"
              title="Minister Sarathkumar Restoration Walk"
              subtitle="Reel (1 min)"
            />
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="pt-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2">
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
                  : "bg-white text-ink-slate border border-[#dce2ea] hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Quarry UI ScrollTimeline Component */}
      <ScrollTimeline
        items={filteredPosts}
        onOpenLightbox={(src, alt) => setLightboxModal({ isOpen: true, src, alt })}
      />

      {/* Wordmark Footer */}
      <Footer />

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxModal.isOpen}
        onClose={() => setLightboxModal({ ...lightboxModal, isOpen: false })}
        imageSrc={lightboxModal.src}
        alt={lightboxModal.alt}
      />
    </main>
  );
}
