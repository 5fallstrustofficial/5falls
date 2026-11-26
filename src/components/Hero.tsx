"use client";

import React from "react";
import { MosaicHero, type Tile } from "@/components/mosaic-hero";
import { useLanguage } from "@/context/LanguageContext";

interface HeroProps {
  onOpenDonate?: () => void;
  onOpenVideo?: (videoSrc: string, title: string) => void;
}

const LAKE_MOSAIC_TILES: Tile[] = [
  { src: "/img/hero-excavator.webp", ratio: 1.45 },
  { src: "/img/lake-with-water.webp", ratio: 0.9 },
  { src: "/img/across-the-lake.webp", ratio: 1.5 },
  { src: "/img/cleared-bank.webp", ratio: 1.2 },
  { src: "/img/excavator-wall.webp", ratio: 0.85 },
  { src: "/img/lake-wide.webp", ratio: 1.6 },
  { src: "/img/levelled-pylon.webp", ratio: 1.35 },
  { src: "/img/pond-cleaned.webp", ratio: 0.95 },
  { src: "/img/pond-work.webp", ratio: 1.4 },
  { src: "/img/reshaped-bank.webp", ratio: 1.15 },
  { src: "/img/slope.webp", ratio: 0.85 },
  { src: "/img/standing-water.webp", ratio: 1.5 },
  { src: "/img/u-2026-10-15-1.webp", ratio: 1.3 },
  { src: "/img/u-2026-10-15-2.webp", ratio: 0.9 },
  { src: "/img/u-2026-10-15-3.webp", ratio: 1.5 },
  { src: "/img/u-2026-10-15-4.webp", ratio: 1.25 },
  { src: "/img/u-2026-10-15-5.webp", ratio: 0.85 },
  { src: "/img/u-2026-10-15-6.webp", ratio: 1.45 },
];

export default function Hero(_props: HeroProps) {
  const { isTamil } = useLanguage();

  return (
    <MosaicHero
      className="min-h-[100dvh] pt-16"
      eyebrow={
        isTamil
          ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை · தாம்பரம், சென்னை"
          : "Five Falls Women's Welfare Trust · Tambaram, Chennai"
      }
      title={
        isTamil
          ? "நீர்நிலைகளை மீட்டெடுத்து சமூகத்தை மேம்படுத்துவோம்."
          : "Reviving Water Bodies, Empowering Communities."
      }
      accent={isTamil ? "சமூகத்தை" : "Communities"}
      lead={
        isTamil
          ? "மழைநீர் சேமிப்பு, வெள்ளப் பாதுகாப்பு மற்றும் மகளிர் முன்னேற்றத்திற்காக நீர்நிலைகளைத் தூர்வாரி சீரமைத்து வருகிறோம்."
          : "Restoring lakes and ponds for rainwater harvesting, flood protection, and sustainable women-led community welfare."
      }
      primary={{
        label: isTamil ? "பணிகளுக்கு உதவ" : "Help the Work",
        href: "/donate",
      }}
      secondary={{
        label: isTamil ? "எங்கள் பணிகள்" : "See Our Work",
        href: "/our-work",
      }}
      stats={[
        {
          value: isTamil ? "25+ ஆண்டுகள்" : "25+ Years",
          text: isTamil
            ? "மகளிர் நலன் மற்றும் சமூக சேவையில் அர்ப்பணிப்பு."
            : "Dedicated to women's welfare and community service.",
        },
        {
          value: "20,000+",
          text: isTamil
            ? "மழைநீர் சேமிப்பு மற்றும் வெள்ளப் பாதுகாப்பால் பயனடையும் குடும்பங்கள்."
            : "Families benefiting from rainwater harvesting and flood protection.",
        },
      ]}
      tiles={LAKE_MOSAIC_TILES}
      tint="var(--foreground)"
    />
  );
}
