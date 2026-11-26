"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Droplets, Users, Languages } from "lucide-react";
import { SITE_METADATA } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";

interface AuthSplitShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt?: React.ReactNode;
}

export function GoogleOAuthIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.48 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.13H1.05v3.14C3.09 21.2 7.22 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.04 14.02c-.25-.74-.39-1.54-.39-2.36s.14-1.62.39-2.36V6.16H1.05C.38 7.5 0 9.01 0 10.66c0 1.65.38 3.16 1.05 4.5l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.22 0 3.09 2.8 1.05 6.84l3.99 3.14c.98-2.94 3.72-5.23 6.96-5.23Z"
      />
    </svg>
  );
}

/**
 * Split-screen Auth shell inspired by React Bits Pro Auth 2 layout,
 * styled natively with 5Falls Bluesky Light theme design tokens.
 */
export default function AuthSplitShell({
  title,
  subtitle,
  children,
  footerPrompt,
}: AuthSplitShellProps) {
  const { isTamil, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col lg:flex-row">
      {/* Left Visual Showcase Panel (desktop hero column) */}
      <aside className="relative lg:w-[46%] xl:w-[48%] bg-[#354358] text-white overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-[240px] lg:min-h-screen">
        <Image
          src="/img/across-the-lake.webp"
          alt="Puduthangal Lake restored by Five Falls Trust"
          fill
          priority
          className="object-cover opacity-35"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1d2838]/90 via-[#2a394e]/80 to-[#006aff]/45"
          aria-hidden="true"
        />

        {/* Top Bar: Logo + Back Link */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link href="/" className="relative h-9 w-36 block" aria-label="5Falls Home">
            <Image
              src="/img/logo-white.png"
              alt="Five Falls Women's Welfare Trust"
              fill
              className="object-contain object-left"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTamil ? "முகப்பு" : "Back to Site"}</span>
          </Link>
        </div>

        {/* Center Narrative */}
        <div className="relative z-10 my-8 lg:my-auto max-w-md space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-tint backdrop-blur-sm">
            <Droplets className="w-3.5 h-3.5" />
            <span>{isTamil ? "நீருக்கு நன்றி · மக்கள் தளம்" : "5Falls Community & Trust Portal"}</span>
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
            {isTamil
              ? "ஏரிகளை மீட்டெடுக்கவும், மக்களை இணைக்கவும்"
              : "Reviving Tamil Nadu's Lakes Together"}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {isTamil
              ? "தாம்பரம் புதுத்தாங்கல் ஏரி முதல் தமிழகம் முழுவதும் 30+ நீர்நிலைகள் மீட்பு வரை — நமது அறக்கட்டளை அறிவிப்புகள் மற்றும் களப் பணிகளில் இணையுங்கள்."
              : "Join volunteers, donors, and community coordinators tracking restoration dispatches across Puduthangal Lake and 30+ water bodies across Tamil Nadu."}
          </p>

          {/* Compact Trust Stat Pills */}
          <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sky-tint text-xs font-semibold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>{isTamil ? "பாதுகாப்பு" : "Flood Protection"}</span>
              </div>
              <div className="text-lg font-extrabold text-white">20,000+ Families</div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sky-tint text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isTamil ? "அங்கீகாரம்" : "Registered Trust"}</span>
              </div>
              <div className="text-lg font-extrabold text-white">Regd. 87/2018</div>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-slate-300 border-t border-white/15 pt-5">
          <span>{SITE_METADATA.name}</span>
          <span>East Tambaram, Chennai</span>
        </div>
      </aside>

      {/* Right Form Column */}
      <main className="flex-1 flex flex-col justify-between p-5 sm:p-10 lg:p-14 bg-[#f9fafb]">
        {/* Top Utility Row */}
        <div className="flex items-center justify-end max-w-md w-full mx-auto">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dce2ea] bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-primary/40 transition-colors shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{isTamil ? "English" : "தமிழ்"}</span>
          </button>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-md mx-auto my-6">
          <div className="bg-white rounded-modal border border-[#dce2ea] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
              <p className="text-sm text-ink-slate mt-1">{subtitle}</p>
            </div>

            {children}
          </div>

          {footerPrompt && (
            <div className="text-center text-sm text-ink-slate mt-5">{footerPrompt}</div>
          )}
        </div>

        <div className="text-center text-xs text-ink-steel max-w-md w-full mx-auto">
          {SITE_METADATA.regNo} · PAN: {SITE_METADATA.pan}
        </div>
      </main>
    </div>
  );
}
