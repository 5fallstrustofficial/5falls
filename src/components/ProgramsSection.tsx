"use client";

import React from "react";
import { PROGRAMS } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";
import {
  Waves,
  HeartPulse,
  HandHeart,
  Coins,
  Stethoscope,
  GraduationCap,
  Clock,
  Users,
  Sprout,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Building,
  Award,
  TrendingUp,
  Eye,
  BookOpen,
} from "lucide-react";

const PROGRAM_MAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "water-bodies": Waves,
  "womens-health": HeartPulse,
  "survivor-support": HandHeart,
  "self-help-groups": Coins,
  "free-medical-camps": Stethoscope,
  "education-youth": GraduationCap,
};

const PROGRAM_HIGHLIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>[]> = {
  "water-bodies": [Clock, Users, Sprout],
  "womens-health": [Activity, Stethoscope, HeartHandshake],
  "survivor-support": [HandHeart, ShieldCheck, Building],
  "self-help-groups": [Coins, Award, TrendingUp],
  "free-medical-camps": [Eye, Activity, HeartPulse],
  "education-youth": [Building, BookOpen, Users],
};

export default function ProgramsSection({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { isTamil } = useLanguage();

  return (
    <section id="work" className={`${showHeader ? "py-20" : "pt-10 pb-20"} px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              {isTamil
                ? "மகளிர் முன்னேற்றம் & மக்கள் நல்வாழ்வுப் பணிகள்"
                : "Empowering Women & Rebuilding Communities"}
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              {isTamil
                ? "மகளிர் மற்றும் அடித்தட்டு குடும்பங்கள் தங்கள் சொந்தக் காலில் நிற்க உதவும் களப்பணிகளை மேற்கொள்கிறோம்."
                : "We design and carry out grassroots initiatives to help women and underprivileged families stand on their own feet."}
            </p>
          </div>
        )}

        {/* 6 Programs Grid with Unified Blue Styling & Unique Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROGRAMS.map((program) => {
            const MainIcon = PROGRAM_MAIN_ICONS[program.id] || Waves;
            const highlightIcons = PROGRAM_HIGHLIGHT_ICONS[program.id] || [Activity, Users, Award];

            return (
              <div
                key={program.id}
                className="bg-white rounded-modal border border-[#dce2ea] p-6 hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  {/* Icon & Badge Header in Unified Primary Blue */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-primary group-hover:scale-108 transition-transform shadow-xs">
                      <MainIcon className="w-6 h-6" />
                    </div>
                    {program.stats && (
                      <span className="text-[11px] font-semibold text-primary bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                        {program.stats}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-primary transition-colors">
                    {isTamil && program.tamilTitle ? program.tamilTitle : program.title}
                  </h3>
                  {isTamil && (
                    <p className="text-xs text-ink-steel font-medium mb-3">
                      {program.title}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-ink-slate leading-relaxed mb-4">
                    {program.description}
                  </p>

                  {/* Highlight Bullets with Unique Contextual Icons in Unified Primary Blue */}
                  <div className="space-y-2 border-t border-[#dce2ea]/60 pt-3">
                    {program.highlights.map((h, i) => {
                      const HighlightIcon = highlightIcons[i] || Activity;
                      return (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-ink-steel">
                          <HighlightIcon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom statutory note */}
                <div className="mt-5 pt-3 border-t border-[#dce2ea]/40 flex items-center justify-between text-[11px] text-ink-steel">
                  <span>Field Verified</span>
                  <span className="font-semibold text-primary">5Falls Initiative</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
