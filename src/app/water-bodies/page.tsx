"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaterBodiesSection from "@/components/WaterBodiesSection";
import LightboxModal from "@/components/LightboxModal";
import DonateModal from "@/components/DonateModal";
import Link from "next/link";
import { Droplets, Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function WaterBodiesPage() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const { isTamil } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f9fafb] text-ink">
      <Navbar onOpenDonate={() => setDonateModalOpen(true)} />

      {/* Page Header */}
      <section className="pt-36 sm:pt-40 pb-14 px-4 sm:px-6 bg-white border-b border-[#dce2ea]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-steel mb-3">
            <Link href="/" className="hover:text-primary">
              {isTamil ? "முகப்பு" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-primary">{isTamil ? "நீர்நிலைகள்" : "Water Bodies"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            {isTamil ? "நீர்நிலைகள் மீட்புப் பணிகள்" : "Reviving Neglected Lakes & Ponds"}
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            {isTamil
              ? "தாம்பரம் புதுத்தாங்கல் ஏரி முதல் திண்டிவனம், காஞ்சிபுரம் கிராமப்புற குளங்கள் வரை தூர்வாரி, கரைகளில் பனை மரக்கன்றுகளை நட்டு நீர்வளத்தைப் பாதுகாக்கிறோம்."
              : "From the 15-year dry bed of Puduthangal Lake in Tambaram to village ponds across Tindivanam and Kanchipuram, we desilt, reshape, and plant palm saplings to retain rainwater and prevent floods."}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setDonateModalOpen(true)}
              className="pill-primary text-sm h-9 px-5 gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isTamil ? "நீர்நிலையை தத்தெடுக்க" : "Sponsor a Water Body"}</span>
            </button>
            <Link href="/updates" className="pill-secondary text-sm h-9 px-5 gap-1.5">
              <span>{isTamil ? "களப் பதிவுகளைப் பார்க்க" : "View Field Updates"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* In-Depth Water Bodies Explorer */}
      <WaterBodiesSection
        showHeader={false}
        onOpenDonate={() => setDonateModalOpen(true)}
        onOpenLightbox={(src, alt) => setLightboxModal({ isOpen: true, src, alt })}
      />

      <Footer />

      {/* Modals */}
      <LightboxModal
        isOpen={lightboxModal.isOpen}
        onClose={() => setLightboxModal({ ...lightboxModal, isOpen: false })}
        imageSrc={lightboxModal.src}
        alt={lightboxModal.alt}
      />
      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />
    </main>
  );
}
