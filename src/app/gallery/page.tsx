"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaGallery from "@/components/MediaGallery";
import VideoModal from "@/components/VideoModal";
import LightboxModal from "@/components/LightboxModal";
import Link from "next/link";
import { Sparkles, Play, Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
  }>({
    isOpen: false,
    src: "",
    title: "",
  });
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
  });

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
            <span className="text-primary">Photo & Video Gallery</span>
          </div>

          

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            Photos, Reels & Field Archive
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            Browse our full archive of high-definition photographs and video reels chronicling the excavation, bank reshaping, tree planting drives, VIP visits, and community celebrations at Puduthangal Lake.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() =>
                setVideoModal({
                  isOpen: true,
                  src: "/video/u-2026-10-24-tree-planting-reel.mp4",
                  title: "15 Dry Years to Water Again (Narrated by S. Shanthi)",
                })
              }
              className="pill-primary text-sm h-9 px-5 gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Featured Story Reel</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filterable Media Gallery */}
      <MediaGallery
        showHeader={false}
        onOpenVideo={(src, title) => setVideoModal({ isOpen: true, src, title })}
        onOpenLightbox={(src, alt) => setLightboxModal({ isOpen: true, src, alt })}
      />

      <Footer />

      {/* Modals */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        videoSrc={videoModal.src}
        title={videoModal.title}
      />
      <LightboxModal
        isOpen={lightboxModal.isOpen}
        onClose={() => setLightboxModal({ ...lightboxModal, isOpen: false })}
        imageSrc={lightboxModal.src}
        alt={lightboxModal.alt}
      />
    </main>
  );
}
