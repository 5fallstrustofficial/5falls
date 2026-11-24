"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WATER_BODIES } from "@/data/siteData";
import {
  Droplets,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  FileCheck,
  Building,
  Waves,
  Bird,
  Sprout,
  Users,
  TreePine,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WaterBodiesSectionProps {
  onOpenDonate: () => void;
  onOpenLightbox: (src: string, alt: string) => void;
  showHeader?: boolean;
}

export default function WaterBodiesSection({
  onOpenDonate,
  onOpenLightbox,
  showHeader = true,
}: WaterBodiesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("puduthangal");
  const { isTamil } = useLanguage();

  return (
    <section id="water-bodies" className={`${showHeader ? "py-20" : "pt-8 pb-20"} px-4 sm:px-6 bg-white border-t border-[#dce2ea]`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              {isTamil
                ? "நீர்நிலைகள் மீட்பு பணிகள்"
                : "Water Bodies We Are Bringing Back"}
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              {isTamil
                ? "பொதுமக்களோடு இணைந்து வறண்ட ஏரிகள் மற்றும் குளங்களைத் தூர்வாரி, கரைகளில் பனை மரக்கன்றுகளை நட்டு நீர்வளத்தைப் பாதுகாக்கிறோம்."
                : "We clean neglected ponds and lakes with local people, reshape beds to hold monsoonal rain, and plant palm saplings along banks to secure them."}
            </p>
          </div>
        )}

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {WATER_BODIES.map((wb) => (
            <button
              key={wb.id}
              onClick={() => setActiveTab(wb.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === wb.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-[#f9fafb] text-ink-slate border border-[#dce2ea] hover:bg-slate-100"
              }`}
            >
              <span>{wb.name}</span>{" "}
              <span className="opacity-80 text-[11px] font-normal">({wb.tamilName})</span>
            </button>
          ))}
        </div>

        {/* Selected Water Body Card */}
        {WATER_BODIES.filter((wb) => wb.id === activeTab).map((wb) => (
          <div
            key={wb.id}
            className="bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-6 sm:p-10 shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Media Column */}
              <div className="lg:col-span-6 space-y-4">
                <div
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#dce2ea] shadow-sm cursor-pointer group"
                  onClick={() => onOpenLightbox(wb.image, wb.name)}
                >
                  <Image
                    src={wb.image}
                    alt={wb.name}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-primary border border-white/40">
                    {wb.status}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                    Click to enlarge
                  </div>
                </div>

                {/* Before / After Thumbnail Comparison if available */}
                {wb.beforeImage && wb.afterImage && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#dce2ea] cursor-pointer group"
                      onClick={() =>
                        onOpenLightbox(wb.beforeImage!, `${wb.name} - Overgrown Before Work`)
                      }
                    >
                      <Image
                        src={wb.beforeImage}
                        alt="Before restoration"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                        Before: Overgrown
                      </div>
                    </div>

                    <div
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#dce2ea] cursor-pointer group"
                      onClick={() =>
                        onOpenLightbox(wb.afterImage!, `${wb.name} - Revived Holding Water`)
                      }
                    >
                      <Image
                        src={wb.afterImage}
                        alt="After restoration"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-white text-[10px] font-bold">
                        After: Holding Water
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-steel font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{wb.location}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                    {isTamil ? wb.tamilName : wb.name}
                  </h3>

                  <p className="text-sm sm:text-base text-ink-slate leading-relaxed mb-6">
                    {wb.description}
                  </p>

                  {/* Stats Pill Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {wb.stats.map((st, i) => (
                      <div
                        key={i}
                        className="bg-white p-2.5 rounded-card border border-[#dce2ea] text-center"
                      >
                        <div className="font-extrabold text-sm text-ink">{st.value}</div>
                        <div className="text-[10px] text-ink-steel font-medium mt-0.5">
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights Bullet List with Unique Contextual Icons */}
                  <div className="space-y-2.5 mb-6">
                    {wb.details.map((d, i) => {
                      const lower = d.toLowerCase();
                      let IconElem = <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;

                      if (lower.includes("wrd") || lower.includes("noc") || lower.includes("permission")) {
                        IconElem = <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("corporation") || lower.includes("tambaram") || lower.includes("admin")) {
                        IconElem = <Building className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("channel") || lower.includes("drainage") || lower.includes("inlet") || lower.includes("water")) {
                        IconElem = <Waves className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("bird") || lower.includes("egret") || lower.includes("wildlife")) {
                        IconElem = <Bird className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("sapling") || lower.includes("palm") || lower.includes("seed")) {
                        IconElem = <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("youth") || lower.includes("volunteer") || lower.includes("padai")) {
                        IconElem = <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
                      } else if (lower.includes("path") || lower.includes("track")) {
                        IconElem = <TreePine className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />;
                      }

                      return (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-slate">
                          {IconElem}
                          <span>{d}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-[#dce2ea] flex items-center justify-between">
                  <span className="text-xs text-ink-steel">
                    CSR & Civic Partnerships Active
                  </span>
                  <button
                    onClick={onOpenDonate}
                    className="pill-primary text-xs h-8 px-4 gap-1.5"
                  >
                    <span>Sponsor this Water Body</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
