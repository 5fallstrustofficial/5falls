"use client";

import React from "react";
import Image from "next/image";
import { PARTNERS } from "@/data/siteData";
import { OrbitCardStack, type OrbitCardItem } from "@/components/orbit-card-stack";
import { useLanguage } from "@/context/LanguageContext";

const ORBIT_SLOTS = [
  { angle: -122, stackRotate: -11, stackOffset: { x: -8, y: 2 }, bg: "bg-card" },
  { angle: 168, stackRotate: 9, stackOffset: { x: 6, y: -2 }, bg: "bg-card" },
  { angle: -34, stackRotate: -6, stackOffset: { x: -4, y: 3 }, bg: "bg-primary text-primary-foreground" },
  { angle: 26, stackRotate: 5, stackOffset: { x: 3, y: 1 }, bg: "bg-foreground text-background" },
  { angle: 108, stackRotate: -3, stackOffset: { x: 0, y: 0 }, bg: "bg-card" },
];

export default function PartnersSection() {
  const { isTamil } = useLanguage();

  const partnerCards: OrbitCardItem[] = [
    ...PARTNERS.map((partner, idx) => {
      const slot = ORBIT_SLOTS[idx];
      const isDark = slot.bg.includes("text-primary-foreground") || slot.bg.includes("text-background");
      return {
        id: `partner-${idx}`,
        angle: slot.angle,
        stackRotate: slot.stackRotate,
        stackOffset: slot.stackOffset,
        className: `${slot.bg} p-2 sm:p-2.5 border border-border`,
        content: (
          <div className="flex size-full flex-col items-center justify-between gap-1 text-center sm:gap-1.5">
            <div className="flex h-11 w-full items-center justify-center rounded-lg border border-border/60 bg-background px-1.5 py-1 shadow-xs sm:h-16 sm:rounded-xl sm:px-2 sm:py-1.5">
              {partner.logo ? (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={120}
                  height={64}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="font-mono text-[10px] font-extrabold tracking-tight text-primary sm:text-sm">
                  {partner.badge || "WRD"}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="line-clamp-2 text-[9px] font-bold leading-tight sm:text-[11px]">
                {partner.name}
              </div>
              <div
                className={
                  isDark
                    ? "line-clamp-1 text-[7px] font-medium opacity-80 sm:text-[8px]"
                    : "line-clamp-1 text-[7px] font-semibold text-primary sm:text-[8px]"
                }
              >
                {partner.role}
              </div>
            </div>
          </div>
        ),
      };
    }),
    {
      id: "community-volunteers",
      angle: ORBIT_SLOTS[4].angle,
      stackRotate: ORBIT_SLOTS[4].stackRotate,
      stackOffset: ORBIT_SLOTS[4].stackOffset,
      className: "bg-card p-2 sm:p-2.5 border border-border",
      content: (
        <div className="flex size-full flex-col items-center justify-between gap-1 text-center sm:gap-1.5">
          <div className="flex h-11 w-full items-center justify-center rounded-lg border border-border/60 bg-background px-1.5 py-1 shadow-xs sm:h-16 sm:rounded-xl sm:px-2 sm:py-1.5">
            <Image
              src="/img/logo-navy.png"
              alt="Five Falls Trust"
              width={120}
              height={64}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="space-y-0.5">
            <div className="line-clamp-2 text-[9px] font-bold leading-tight sm:text-[11px]">
              {isTamil ? "சமூக தன்னார்வலர்கள்" : "Local Community & Donors"}
            </div>
            <div className="line-clamp-1 text-[7px] font-semibold text-primary sm:text-[8px]">
              {isTamil ? "மக்கள் பங்களிப்பு" : "Civic Collective"}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="partners" className="border-t border-border">
      <OrbitCardStack
        heading={
          isTamil ? (
            <>
              நீர்நிலைகளுக்காக
              <br />
              ஒன்றிணைந்து
              <br />
              செயல்படுவோம்
            </>
          ) : (
            <>
              Working Together
              <br />
              for Our
              <br />
              Water Bodies
            </>
          )
        }
        cards={partnerCards}
      />
    </div>
  );
}
