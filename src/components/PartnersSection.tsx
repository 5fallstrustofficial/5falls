"use client";

import React from "react";
import Image from "next/image";
import { PARTNERS } from "@/data/siteData";
import { Handshake, Award, ShieldCheck } from "lucide-react";

export default function PartnersSection() {
  return (
    <section id="partners" className="py-20 px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
            Working Together for Our Water
          </h2>
          <p className="text-ink-slate text-base sm:text-lg">
            Ecological revival is a collective civic effort. We collaborate with grassroots volunteers, statutory government bodies, and pioneer environmental institutions.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PARTNERS.map((partner, idx) => (
            <div
              key={idx}
              className="bg-white rounded-modal border border-[#dce2ea] p-6 hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center text-center shadow-xs"
            >
              {/* Logo / Badge */}
              <div className="w-16 h-16 rounded-full bg-[#f9fafb] border border-[#dce2ea] flex items-center justify-center p-2 mb-4">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <span className="font-extrabold text-xs text-primary font-mono">
                    {partner.badge || "WRD"}
                  </span>
                )}
              </div>

              {/* Title & Role */}
              <h3 className="font-bold text-base text-ink mb-1">{partner.name}</h3>
              <p className="text-xs font-semibold text-primary mb-3">{partner.role}</p>

              {/* Description */}
              <p className="text-xs text-ink-steel leading-relaxed">
                {partner.description}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
