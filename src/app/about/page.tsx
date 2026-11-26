"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import PartnersSection from "@/components/PartnersSection";
import Link from "next/link";
import { ArrowRight, Heart, Users, ShieldCheck } from "lucide-react";
import { SITE_METADATA } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { isTamil } = useLanguage();

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
            <span className="text-primary">{isTamil ? "எங்களை பற்றி" : "About Us"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            {isTamil ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை" : "A Women's Trust, Working for Our Water"}
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            {isTamil
              ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை (பதிவு எண்: 87/2018) சென்னை கிழக்கு தாம்பரம் சேலையூரில் இயங்கும் ஒரு பதிவு பெற்ற அறக்கட்டளையாகும். 25 ஆண்டுகளாக மகளிர் முன்னேற்றம் மற்றும் நீர்நிலைகள் பாதுகாப்பில் செயல்பட்டு வருகிறது."
              : "Five Falls Women's Welfare Trust is a registered trust (Regd. No. 87/2018) based in Selaiyur, East Tambaram, Chennai. For 25 years, we have empowered women and championed community water revival."}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link href="/water-bodies" className="pill-primary text-sm h-9 px-5 gap-1.5">
              <span>{isTamil ? "நீர்நிலைகள் பார்க்க" : "View Water Bodies"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/donate" className="pill-secondary text-sm h-9 px-5 gap-1.5">
              <Heart className="w-4 h-4 fill-primary text-primary" />
              <span>{isTamil ? "பணிகளுக்கு உதவ" : "Help the Work"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Full Core About Content */}
      <AboutSection showHeader={false} />

      {/* Team Section */}
      <TeamSection />

      {/* Partners & Civic Collaborators */}
      <PartnersSection />

      <Footer />
    </main>
  );
}
