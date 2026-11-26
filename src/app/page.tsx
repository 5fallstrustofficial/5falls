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
import { ScrollStatement } from "@/components/scroll-statement";
import { ServiceShowcase } from "@/components/service-showcase";
import { CertStack } from "@/components/cert-stack";
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
} from "lucide-react";
import { SITE_METADATA, WATER_BODIES, PROGRAMS } from "@/data/siteData";
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

      {/* 3. Trust Scroll Statement (Quarry UI) */}
      <section className="bg-white border-t border-border">
        <ScrollStatement
          eyebrow={isTamil ? "ஐந்தருவி அறக்கட்டளை பற்றி" : "About Five Falls Trust"}
          statement={
            isTamil
              ? "நாங்கள் சென்னை தாம்பரத்தில் இயங்கும் பதிவு பெற்ற ஐந்தருவி மகளிர் நல அறக்கட்டளை. 25 ஆண்டுகளுக்கும் மேலாக நீர்நிலைகளை மீட்டெடுத்து, பெண்களை மேம்படுத்தி, தேவைப்படும் குடும்பங்களுக்கு துணை நின்று வருகிறோம்."
              : "We are Five Falls Women's Welfare Trust, a registered non-profit in Tambaram, Chennai. For over 25 years we have revived lakes and ponds, empowered women, and stood with families in need."
          }
          pills={[]}
        />
      </section>

      {/* 4. Lakes Saved Showcase using Quarry UI ServiceShowcase */}
      <ServiceShowcase
        title={isTamil ? "நாம் மீட்டெடுத்த நீர்நிலைகள்" : "Lakes We've Saved"}
        rows={WATER_BODIES.map((wb) => ({
          title: isTamil ? wb.tamilName : wb.name,
          text: wb.location,
          image: wb.image,
          href: `/water-bodies#${wb.id}`,
          items: [wb.description, ...wb.details.slice(0, 3)],
        }))}
      />

      {/* 6. 6 Programs Highlight using Quarry UI CertStack */}
      <section className="py-12 px-4 sm:px-6 bg-white border-t border-border overflow-x-clip">
        <CertStack
          label={isTamil ? "25 ஆண்டுகால மகளிர் & மக்கள் நலப்பணிகள்" : "More than Lakes · 25 Years of Welfare"}
          note={
            isTamil
              ? "நீர்நிலைகள் மீட்புடன் பெண்கள் நல்வாழ்வு, குடும்ப வன்முறையால் பாதிக்கப்பட்டோருக்கு ஆதரவு, சுயஉதவி குழுக்கள் மற்றும் கல்வி வழிகாட்டல்."
              : "core welfare pillars and counting. Alongside water bodies, our trust drives women's healthcare, survivor rehabilitation, micro-credit, and child tutoring."
          }
          certs={PROGRAMS.map((p) => {
            const programIcons: Record<string, React.ComponentType<{ className?: string }>> = {
              "water-bodies": Waves,
              "womens-health": HeartPulse,
              "survivor-support": HandHeart,
              "self-help-groups": Coins,
              "free-medical-camps": Stethoscope,
              "education-youth": GraduationCap,
            };
            const IconComp = programIcons[p.id] || Waves;
            return {
              title: isTamil && p.tamilTitle ? p.tamilTitle : p.title,
              org: p.description,
              when: p.stats ?? "",
              logo: <IconComp className="size-7" />,
            };
          })}
        />
        <div className="text-center mt-4 pb-6">
          <Link href="/our-work" className="pill-secondary text-xs sm:text-sm h-9 px-5 gap-1.5">
            <span>View Comprehensive Program Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
