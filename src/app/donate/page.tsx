"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationSection from "@/components/DonationSection";
import { FaqAccordion } from "@/components/faq-accordion";
import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { SITE_METADATA } from "@/data/siteData";

export default function DonatePage() {
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
            <span className="text-primary">Donate & Support</span>
          </div>

          

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            Help Keep the Machinery Running
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            The machines and volunteers run entirely on public contributions. Sponsor vehicle hire, a day’s diesel, or volunteer meals. Every contribution directly powers work on the ground.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-ink-steel">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct Bank UPI: <strong>{SITE_METADATA.upi.id}</strong></span>
            </div>
            <span>·</span>
            <div>100% Transparent Citizen Funding</div>
            <span>·</span>
            <div>Eligible for CSR Partnerships</div>
          </div>
        </div>
      </section>

      {/* Full Donation Section */}
      <DonationSection showHeader={false} />

      {/* Quarry UI FaqAccordion Component */}
      <section className="py-16 px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]">
        <FaqAccordion
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about sponsoring our lake restoration work and tax exemptions"
        />
      </section>

      {/* Wordmark Footer */}
      <Footer />
    </main>
  );
}
