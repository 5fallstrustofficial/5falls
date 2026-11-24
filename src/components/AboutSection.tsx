"use client";

import React from "react";
import Image from "next/image";
import { TIMELINE_HISTORY, SITE_METADATA } from "@/data/siteData";
import {
  Award,
  Users,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  HeartPulse,
  Waves,
  Sprout,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { isTamil } = useLanguage();

  return (
    <section id="about" className={`${showHeader ? "py-20" : "pt-10 pb-20"} px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              {isTamil
                ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை"
                : "A Women's Trust, Working for Our Water"}
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              {isTamil
                ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை (பதிவு எண்: 87/2018) சென்னை கிழக்கு தாம்பரம் சேலையூரில் இயங்கும் ஒரு பதிவு பெற்ற அறக்கட்டளையாகும்."
                : "Five Falls Women's Welfare Trust is a registered trust (Regd. No. 87/2018) based in Selaiyur, East Tambaram, Chennai."}
            </p>
          </div>
        )}

        {/* Founder & Core Story Card */}
        <div className="bg-white rounded-modal border border-[#dce2ea] p-6 sm:p-10 mb-16 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#dce2ea] shadow-sm">
                <Image
                  src="/img/lake-with-water.webp"
                  alt="S. Shanthi and team at Puduthangal Lake"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-tint">
                    Founder & Secretary
                  </div>
                  <div className="text-lg font-bold">
                    {isTamil
                      ? `${SITE_METADATA.founder.tamilName} · ${SITE_METADATA.founder.name}`
                      : SITE_METADATA.founder.name}
                  </div>
                </div>
              </div>

              {/* Trust Badge Pill */}
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#f9fafb] border border-[#dce2ea] text-xs text-ink-slate">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span>30+ Years with ExNoRa International Environmental Movement</span>
              </div>
            </div>

            {/* Story Column */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-ink">
                Grassroots Leadership & Civic Action
              </h3>
              <p className="text-sm sm:text-base text-ink-slate leading-relaxed">
                {SITE_METADATA.founder.bio}
              </p>
              <p className="text-sm sm:text-base text-ink-slate leading-relaxed">
                Women from local self-help groups are at the absolute heart of our work. Alongside the massive clean-up that began in October 2026, our members held thanksgiving pujas and Pongal celebrations right at the lake bank as water flowed in after 15 dry years.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-card bg-[#f9fafb] border border-[#dce2ea]">
                  <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-ink">Self-Help Group Core</div>
                    <div className="text-[11px] text-ink-steel">Women leading ecological restoration</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-card bg-[#f9fafb] border border-[#dce2ea]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-ink">Statutory Approvals</div>
                    <div className="text-[11px] text-ink-steel">WRD NOC & Tambaram City Corporation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 25-Year Journey Interactive Timeline */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-ink">
              {isTamil
                ? "எங்கள் 25 ஆண்டுகால மக்கள் சேவை பயணம் (2000–2026)"
                : "25 Years of Community Empowerment (2000–2026)"}
            </h3>
            <p className="text-xs sm:text-sm text-ink-steel mt-1">
              {isTamil
                ? "ஐந்து பெண்களில் தொடங்கி இன்று ஒரு மக்கள் இயக்கமாக"
                : "From five homemakers to a regional movement"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIMELINE_HISTORY.map((item, idx) => {
              const milestoneIcons = [
                <Sparkles key="1" className="w-4 h-4 text-amber-500" />,
                <Users key="2" className="w-4 h-4 text-indigo-500" />,
                <HeartPulse key="3" className="w-4 h-4 text-rose-500" />,
                <Award key="4" className="w-4 h-4 text-blue-500" />,
                <Waves key="5" className="w-4 h-4 text-sky-500" />,
                <Sprout key="6" className="w-4 h-4 text-emerald-500" />,
              ];
              const MilestoneIcon = milestoneIcons[idx] || (
                <Sparkles className="w-4 h-4 text-primary" />
              );

              return (
                <div
                  key={idx}
                  className="bg-white rounded-modal border border-[#dce2ea] p-5 hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {item.year}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#f9fafb] border border-[#dce2ea] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {MilestoneIcon}
                      </div>
                    </div>
                    <h4 className="font-bold text-base text-ink mb-2">{item.title}</h4>
                    <p className="text-xs text-ink-slate leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#dce2ea]/60 flex items-center justify-between text-[11px] text-ink-steel font-medium">
                    <span>Milestone #{idx + 1}</span>
                    <span className="text-primary font-semibold">25-Year Impact</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
