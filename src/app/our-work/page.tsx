"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramsSection from "@/components/ProgramsSection";
import Link from "next/link";
import { Sparkles, Heart, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OurWorkPage() {
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
            <span className="text-primary">Our Work</span>
          </div>

          

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            Empowering Women & Rebuilding Communities
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            Our initiatives span women’s health education, survivor rehabilitation, self-help micro-enterprises, free medical camps with Sri Ramachandra Hospital, and youth education.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link href="/donate" className="pill-primary text-sm h-9 px-5 gap-1.5">
              <Heart className="w-4 h-4 fill-white" />
              <span>Support Our Programs</span>
            </Link>
            <Link href="/contact" className="pill-secondary text-sm h-9 px-5 gap-1.5">
              <span>Volunteer with Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <ProgramsSection showHeader={false} />

      {/* Track Record & Completed Initiatives */}
      <section className="py-16 px-4 sm:px-6 bg-white border-t border-[#dce2ea]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
              Completed & Ongoing Initiatives
            </h2>
            <p className="text-xs sm:text-sm text-ink-steel">
              Consistent civic impact across Chennai, Chengalpattu, and Thiruvallur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed */}
            <div className="bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-6">
              <h3 className="font-bold text-base text-ink mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Completed Projects
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-ink-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Namma Clean Chennai:</strong> Citywide cleanliness drives and waste segregation education.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Model Government Schools:</strong> Facility upgrades and learning materials across suburban Chennai.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-District Medical Camps:</strong> 2,000+ people screened and 350+ free cataract/retinal surgeries with Sri Ramachandra Medical College.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Rajiv Gandhi Hospital (STOP CORONA):</strong> Pandemic response with TN Govt, masks, nutrition kits, and isolation ward assistance.</span>
                </li>
              </ul>
            </div>

            {/* In Progress */}
            <div className="bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-6">
              <h3 className="font-bold text-base text-ink mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                Under Way (2026)
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-ink-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Water Bodies Revival:</strong> Desilting Puduthangal Lake & 30 village ponds with palm tree plantations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Developing Women’s SHGs:</strong> Expanding micro-enterprise and bank credit access for homemakers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Umaiyaal’s Guidance for Education:</strong> Evening tutoring and life mentorship for homeless children.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Triplicane Govt Higher Secondary School:</strong> Constructing hygienic bathroom facilities for schoolchildren.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
