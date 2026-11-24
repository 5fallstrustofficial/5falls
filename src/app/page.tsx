"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import DonateModal from "@/components/DonateModal";
import { VideoDialog } from "@/components/video-dialog";
import { WaveLines } from "@/components/wave-lines";
import { ScrollTimeline } from "@/components/scroll-timeline";
import {
  Droplets,
  ArrowRight,
  Heart,
  Calendar,
  Waves,
  HeartPulse,
  HandHeart,
  Coins,
  Stethoscope,
  GraduationCap,
  Clock,
  FileCheck,
  Building,
  Sprout,
} from "lucide-react";
import { SITE_METADATA, UPDATES_TIMELINE, PROGRAMS } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const { isTamil, t } = useLanguage();
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const handleOpenLightbox = (src: string, alt: string) => {
    setLightboxModal({ isOpen: true, src, alt });
  };

  return (
    <main className="min-h-screen bg-[#f9fafb] text-ink selection:bg-primary selection:text-white">
      {/* 1. Quarry UI Morphing Navbar */}
      <Navbar onOpenDonate={() => setDonateModalOpen(true)} />

      {/* 2. Hero with Scrim, Photo Wash & NumberTicker */}
      <Hero
        onOpenDonate={() => setDonateModalOpen(true)}
        onOpenVideo={() => {}}
      />

      {/* 3. Quarry UI WaveLines: Interactive Water Ripple Section */}
      <section className="relative overflow-hidden border-t border-border bg-gradient-to-b from-[#f9fafb] to-white py-14">
        <WaveLines
          color="#006aff"
          accent="#8798b0"
          lines={22}
          amplitude={14}
          speed={0.35}
          interaction="lift"
          className="py-6"
        >
          <div className="relative z-10 text-center max-w-3xl mx-auto px-4 pointer-events-none">
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Water is Life. Restoring Lakes is Our Sacred Duty.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Move your pointer across the ripples to feel the living water surface.
            </p>
          </div>
        </WaveLines>
      </section>

      {/* 4. Executive Spotlight: Puduthangal Lake Revival with Quarry UI VideoDialog */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Column with VideoDialog */}
            <div className="lg:col-span-6 space-y-4">
              <VideoDialog
                src="/video/u-2026-10-24-tree-planting-reel.mp4"
                thumbnail="/img/lake-with-water.webp"
                title="15 Dry Years to Water Again"
                subtitle="Watch Video Reel"
              />
              <p className="text-center text-xs text-muted-foreground">
                Click to expand the 2-minute documentary reel narrated in S. Shanthi&apos;s own voice.
              </p>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-4">
              

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink">
                Dry for 15 Years. <br />
                Now Holding Fresh Water Again.
              </h2>

              <p className="text-sm sm:text-base text-ink-slate leading-relaxed">
                For over 15 years, Puduthangal Lake on Mudichur Road was choked with thorny bushes and accumulated debris. Surrounding colonies faced high flood risks every monsoon. On Gandhi Jayanti 2026, 5Falls mobilized heavy excavators to clear and reshape the bed.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-slate">
                  <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span>Formal Water Resources Department (WRD) NOC permission</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-slate">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span>Tambaram Corporation Zone 4 collaboration and civic support</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-slate">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>Over 500 tree saplings & 1,000 palm seeds planted along banks</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/water-bodies"
                  className="pill-primary text-xs sm:text-sm h-9 px-5 gap-1.5"
                >
                  <span>Explore All 30+ Water Bodies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/about"
                  className="pill-secondary text-xs sm:text-sm h-9 px-4 gap-1.5"
                >
                  <span>About S. Shanthi & Team</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Field Dispatches using Quarry UI ScrollTimeline */}
      <section className="py-20 px-4 sm:px-6 bg-[#f9fafb] border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 text-center sm:text-left">
            <div>
              
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Fresh Dispatches from the Field
              </h2>
            </div>
            <Link
              href="/updates"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center justify-center sm:justify-start gap-1"
            >
              <span>View Full Updates Archive ({UPDATES_TIMELINE.length} posts)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ScrollTimeline
            items={UPDATES_TIMELINE.slice(0, 4)}
            onOpenLightbox={handleOpenLightbox}
          />
        </div>
      </section>

      {/* 6. 6 Programs Highlight Banner */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              {isTamil ? "25 ஆண்டுகால மகளிர் & மக்கள் நலப்பணிகள்" : "More than Lakes: 25 Years of Welfare"}
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              {isTamil
                ? "நீர்நிலைகள் மீட்புடன் பெண்கள் நல்வாழ்வு, குடும்ப வன்முறையால் பாதிக்கப்பட்டோருக்கு ஆதரவு, சுயஉதவி குழுக்கள் மற்றும் கல்வி வழிகாட்டல் வழங்கி வருகிறோம்."
                : "Alongside water bodies, our trust drives women's healthcare, trauma-informed survivor rehabilitation, micro-credit enterprises, and child tutoring."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROGRAMS.map((p) => {
              const programIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                "water-bodies": Waves,
                "womens-health": HeartPulse,
                "survivor-support": HandHeart,
                "self-help-groups": Coins,
                "free-medical-camps": Stethoscope,
                "education-youth": GraduationCap,
              };
              const IconComp = programIcons[p.id] || Waves;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-modal border border-border bg-[#f9fafb] text-center hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-between group shadow-xs"
                >
                  <div>
                    <div className="w-11 h-11 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-3 text-primary group-hover:scale-110 transition-transform shadow-xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-xs text-ink mb-1 group-hover:text-primary transition-colors">
                      {isTamil && p.tamilTitle ? p.tamilTitle : p.title}
                    </h3>
                    <p className="text-[10px] text-ink-steel line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] font-semibold text-primary">
                    {p.stats}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/our-work" className="pill-secondary text-xs sm:text-sm h-9 px-5 gap-1.5">
              <span>View Comprehensive Program Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Quick UPI Donation Strip */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-t border-border">
        <div className="max-w-4xl mx-auto bg-white rounded-modal border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            
            <h3 className="text-xl sm:text-2xl font-bold text-ink">
              Help Fuel an Excavator for a Day
            </h3>
            <p className="text-xs sm:text-sm text-ink-slate max-w-md">
              Every ₹100 funds saplings and volunteer tools. ₹5,500 covers a full day’s machinery hire.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/donate"
              className="pill-primary h-11 px-6 text-sm gap-2 shadow-[0_4px_16px_rgba(0,106,255,0.35)]"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Scan QR / Donate Now</span>
            </Link>
            <Link
              href="/contact"
              className="pill-secondary h-11 px-5 text-sm gap-1.5"
            >
              <span>Volunteer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Strategic Partners */}
      <PartnersSection />

      {/* 9. Quarry UI Wordmark Footer */}
      <Footer />

      {/* Lightbox & Donate Modals */}
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
