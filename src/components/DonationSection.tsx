"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SITE_METADATA, DONATION_TIERS } from "@/data/siteData";
import { Heart, Copy, Check, QrCode, ShieldCheck, Mail, Building } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DonationSection({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("₹5,500");
  const { isTamil } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_METADATA.upi.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="donate" className={`${showHeader ? "py-20" : "pt-10 pb-20"} px-4 sm:px-6 bg-white border-t border-[#dce2ea]`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              {isTamil
                ? "பணிகள் தொடர நன்கொடை அளியுங்கள்"
                : "Help Keep the Machinery Running"}
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              {isTamil
                ? "எங்கள் இயந்திரங்களும் களப் பணிகளும் பொதுமக்களின் ஆதரவோடு மட்டுமே இயங்குகின்றன. ஒரு நாள் டீசல் அல்லது உணவுச் செலவை ஏற்று உதவலாம்."
                : "The machines run entirely on public donations and community sponsors. Choose a tangible operational slice, or contribute any amount. Even ₹100 helps."}
            </p>
          </div>
        )}

        {/* 2-Column Donation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cost Breakdown Tiers */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-bold text-ink">
              Choose an Operational Contribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DONATION_TIERS.map((tier) => (
                <div
                  key={tier.amount}
                  onClick={() => setSelectedTier(tier.amount)}
                  className={`p-4 rounded-modal border cursor-pointer transition-all ${
                    selectedTier === tier.amount
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                      : "border-[#dce2ea] bg-[#f9fafb] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xl text-ink">
                      {tier.amount}
                    </span>
                    {tier.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase">
                        Most Needed
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs text-ink">
                    {isTamil && tier.tamilName ? tier.tamilName : tier.name}
                  </div>
                  <div className="text-[11px] text-primary font-medium mb-2">
                    {isTamil ? tier.name : ""}
                  </div>
                  <p className="text-xs text-ink-slate leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Corporate & CSR Info Card */}
            <div className="bg-[#f9fafb] border border-[#dce2ea] rounded-modal p-5 space-y-2 mt-4">
              <div className="flex items-center gap-2 font-bold text-sm text-ink">
                <Building className="w-4 h-4 text-primary" />
                <span>CSR Sponsorship & Trust Bank Account</span>
              </div>
              <p className="text-xs text-ink-slate leading-relaxed">
                For corporate CSR contributions or high-value grants, write directly to{" "}
                <a
                  href={`mailto:${SITE_METADATA.email}`}
                  className="text-primary font-semibold hover:underline"
                >
                  {SITE_METADATA.email}
                </a>
                . We will furnish the Five Falls Trust official bank details, PAN documentation (<strong>{SITE_METADATA.pan}</strong>), 80G tax exemption, and work completion certificates.
              </p>
            </div>
          </div>

          {/* Right Column: Scan & Pay UPI Card */}
          <div className="lg:col-span-5 bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-6 text-center shadow-xs">
            

            {/* QR Code Container */}
            <div className="relative w-52 h-52 mx-auto rounded-2xl overflow-hidden bg-white border border-[#dce2ea] p-3 shadow-sm mb-4">
              <Image
                src={SITE_METADATA.upi.qrImage}
                alt="UPI QR Code for GPay / PhonePe"
                fill
                className="object-contain p-2"
              />
            </div>

            <p className="text-xs font-bold text-ink mb-1">
              Scan with GPay, PhonePe, Paytm, BHIM, or any UPI App
            </p>
            <p className="text-[11px] text-ink-steel mb-4">
              Registered Account: <strong className="text-ink">{SITE_METADATA.upi.name}</strong>
            </p>

            {/* Copyable UPI Pill */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#dce2ea] shadow-xs">
              <span className="font-mono text-sm font-bold text-ink">
                {SITE_METADATA.upi.id}
              </span>
              <button
                onClick={handleCopy}
                className="pill-primary text-xs h-7 px-3 gap-1 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy UPI"}</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dce2ea] text-[11px] text-ink-steel flex items-center justify-center gap-3">
              <span>{SITE_METADATA.regNo}</span>
              <span>·</span>
              <span>PAN: {SITE_METADATA.pan}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
