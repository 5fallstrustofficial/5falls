"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, Copy, Heart, QrCode, Building2, ShieldCheck, Mail } from "lucide-react";
import { SITE_METADATA, DONATION_TIERS } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("₹5,500");
  const { isTamil } = useLanguage();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_METADATA.upi.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-modal overflow-hidden border border-[#dce2ea] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <h3 className="font-bold text-base text-ink">
              {isTamil ? "பணிகள் தொடர உதவ" : "Help Keep the Work Going"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#dce2ea] hover:bg-black/5 flex items-center justify-center text-ink-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Tagline */}
          <p className="text-sm text-ink-slate leading-relaxed">
            The machines run on donations from the public and sponsors. Take on one of these, or give any amount. Even <strong className="text-ink">₹100</strong> helps keep an excavator running.
          </p>

          {/* Quick Tier Selection */}
          <div className="grid grid-cols-2 gap-2">
            {DONATION_TIERS.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => setSelectedTier(tier.amount)}
                className={`p-3 rounded-card text-left border transition-all ${
                  selectedTier === tier.amount
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-[#dce2ea] bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-sm text-ink">{tier.amount}</div>
                <div className="text-xs text-ink-steel mt-0.5 line-clamp-1">{tier.name}</div>
              </button>
            ))}
          </div>

          {/* UPI Scan Card */}
          <div className="bg-[#f9fafb] border border-[#dce2ea] rounded-modal p-4 text-center">
            <div className="relative w-44 h-44 mx-auto rounded-card overflow-hidden bg-white border border-[#dce2ea] p-2 shadow-sm mb-3">
              <Image
                src={SITE_METADATA.upi.qrImage}
                alt="UPI QR Code for GPay / PhonePe"
                fill
                className="object-contain p-2"
              />
            </div>

            <p className="text-xs font-semibold text-ink-slate mb-1">
              Scan with GPay, PhonePe, Paytm, BHIM, or any UPI App
            </p>

            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#dce2ea] shadow-xs mt-2">
              <span className="font-mono text-sm font-bold text-ink">
                {SITE_METADATA.upi.id}
              </span>
              <button
                onClick={handleCopy}
                className="pill-primary text-xs h-6 px-2.5 gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-[11px] text-ink-steel mt-2">
              Registered Account: <strong className="text-ink-slate">{SITE_METADATA.upi.name}</strong>
            </p>
          </div>

          {/* CSR & Large Sponsorship notice */}
          <div className="bg-white border border-[#dce2ea] rounded-card p-3.5 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-ink-slate leading-relaxed">
              <strong className="text-ink font-semibold">Corporate / CSR Sponsorship:</strong>{" "}
              Write to{" "}
              <a href={`mailto:${SITE_METADATA.email}`} className="text-primary font-medium hover:underline">
                {SITE_METADATA.email}
              </a>{" "}
              for official Trust bank account details (PAN: {SITE_METADATA.pan}), 80G tax receipt, and CSR MoU agreements.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f9fafb] border-t border-[#dce2ea] flex items-center justify-between text-xs text-ink-steel">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Regd. No. {SITE_METADATA.regNo}</span>
          </div>
          <span>100% Volunteer Driven</span>
        </div>
      </div>
    </div>
  );
}
