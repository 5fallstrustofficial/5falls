"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, ArrowRight } from "lucide-react";
import { NumberTicker } from "@/components/number-ticker";
import { useLanguage } from "@/context/LanguageContext";

interface HeroProps {
  onOpenDonate: () => void;
  onOpenVideo: (videoSrc: string, title: string) => void;
}

export default function Hero({ onOpenDonate, onOpenVideo }: HeroProps) {
  const { isTamil, t } = useLanguage();

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-36 sm:pt-44 md:pt-48 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      {/* Background Photo Wash with Scrim Overlay (from Bluesky DESIGN.md) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/hero-excavator.webp"
          alt="Puduthangal Lake restoration bank reshaping"
          fill
          priority
          className="object-cover object-center filter saturate-110"
        />
        {/* Dual Scrim Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-[#f9fafb]" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Floating Centered Card Container */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        {/* Main Display Headlines */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-sm leading-[1.15]">
          {isTamil ? (
            <>
              புதுத்தாங்கல் ஏரி <br />
              <span className="text-white/95">மீண்டும் உயிர் பெறுகிறது</span>
            </>
          ) : (
            <>
              Bringing Puduthangal Lake <br />
              <span className="text-white/95">Back to Life</span>
            </>
          )}
        </h1>

        <p className="text-lg sm:text-2xl font-medium text-sky-tint mb-6 tracking-wide drop-shadow">
          {isTamil
            ? "சென்னை நீர்நிலைகளை மீட்டெடுக்கும் மக்கள் இயக்கம்"
            : "Restoring Chennai's Historic Water Bodies"}
        </p>

        {/* Narrative Tagline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/90 leading-relaxed font-normal mb-8 drop-shadow-sm">
          {isTamil ? (
            <>
              தாம்பரம் முடிச்சூர் சாலையில் உள்ள புதுத்தாங்கல் ஏரி{" "}
              <span className="text-white font-semibold underline decoration-primary decoration-2 underline-offset-4">
                15–16 ஆண்டுகளாக
              </span>{" "}
              வறண்டு கிடந்தது. 2026 அக்டோபர் முதல், மழைநீரைச் சேமிக்கவும்{" "}
              <span className="text-white font-semibold">20,000 குடும்பங்களை</span> வெள்ளத்திலிருந்து பாதுகாக்கவும் ஏரியைத் தூர்வாரி சீரமைத்துள்ளோம். இப்போது தண்ணீர் நிறைந்துள்ளது.
            </>
          ) : (
            <>
              The lake on Mudichur Road, Tambaram, lay dry and neglected for{" "}
              <span className="text-white font-semibold underline decoration-primary decoration-2 underline-offset-4">
                15–16 years
              </span>
              . Since 2 October 2026, we have cleared and reshaped it to harvest rainwater and protect{" "}
              <span className="text-white font-semibold">20,000 local families</span> from monsoon floods. In October 2026, the water came back.
            </>
          )}
        </p>

        {/* CTA Button Stack */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
          <button
            onClick={onOpenDonate}
            className="pill-primary h-11 px-6 text-[15px] gap-2 shadow-[0_4px_20px_rgba(0,106,255,0.4)]"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>{isTamil ? "பணிகளுக்கு உதவ" : "Help the Work"}</span>
          </button>

          <button
            onClick={() =>
              onOpenVideo(
                "/video/u-2026-10-24-tree-planting-reel.mp4",
                isTamil
                  ? "15 ஆண்டுகள் வறண்ட ஏரிக்கு மீண்டும் வந்த தண்ணீர் (நிறுவனர் எஸ். சாந்தி)"
                  : "15 Dry Years to Water Again (Narrated by S. Shanthi)"
              )
            }
            className="pill-secondary h-11 px-5 text-[15px] gap-2 bg-white/95 text-ink hover:bg-white shadow-sm"
          >
            <Play className="w-4 h-4 fill-ink" />
            <span>{isTamil ? "வீடியோ பார்க்க (2 நிமி)" : "Watch Story Reel (2 min)"}</span>
          </button>

          <Link
            href="/water-bodies"
            className="inline-flex items-center justify-center h-11 px-5 rounded-full text-[15px] font-semibold gap-2 text-white bg-white/20 hover:bg-white/30 border border-white/40 hover:border-white/70 backdrop-blur-md shadow-md transition-all hover:scale-102"
          >
            <span>{isTamil ? "பணிகளைப் பார்க்க" : "See the Progress"}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>

        {/* Live Metric Pills Strip with Quarry UI NumberTicker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#dce2ea] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-left hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center whitespace-nowrap">
              <NumberTicker value={15} suffix={isTamil ? " ஆண்டுகள்" : " Yrs"} />
            </div>
            <p className="text-[12px] font-medium text-ink-slate leading-tight mt-1 line-clamp-2">
              {isTamil ? "பணிகள் தொடங்கும் முன் வறண்டு கிடந்த காலம்" : "Lake lay dry and neglected before work began"}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#dce2ea] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-left hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center">
              <NumberTicker value={20000} suffix="+" />
            </div>
            <p className="text-[12px] font-medium text-ink-slate leading-tight mt-1 line-clamp-2">
              {isTamil ? "வெள்ளத்திலிருந்து பாதுகாக்கப்பட்ட குடும்பங்கள்" : "Families benefiting from flood prevention"}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#dce2ea] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-left hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center whitespace-nowrap">
              <NumberTicker value={30} suffix={isTamil ? "+ குளங்கள்" : "+ Ponds"} />
            </div>
            <p className="text-[12px] font-medium text-ink-slate leading-tight mt-1 line-clamp-2">
              {isTamil ? "தமிழகம் முழுவதும் மீட்டெடுக்கப்படும் நீர்நிலைகள்" : "Target water bodies across Tamil Nadu"}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#dce2ea] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-left hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center">
              <NumberTicker value={2000} suffix="+" />
            </div>
            <p className="text-[12px] font-medium text-ink-slate leading-tight mt-1 line-clamp-2">
              {isTamil ? "மருத்துவ முகாம்களில் பயனடைந்த நோயாளிகள்" : "Patients screened in free medical eye camps"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
