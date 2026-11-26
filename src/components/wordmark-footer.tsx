"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Mail, ArrowUp } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import { SITE_METADATA } from "@/data/siteData";
import { WaveLines } from "@/components/wave-lines";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Quarry UI WordmarkFooter:
 * A quiet footer that ends on an oversized wordmark. A soft spotlight follows the pointer across
 * the letters, so the brand name lights up under the cursor.
 */
export function WordmarkFooter({
  word = "5FALLS",
  tamilWord,
  className,
}: {
  word?: string;
  tamilWord?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const sx = useSpring(x, { stiffness: 220, damping: 28 });
  const sy = useSpring(y, { stiffness: 220, damping: 28 });
  const mask = useMotionTemplate`radial-gradient(260px circle at ${sx}px ${sy}px, black, transparent 75%)`;
  const { isTamil, t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.waterBodies"), href: "/water-bodies" },
    { label: t("nav.ourWork"), href: "/our-work" },
    { label: t("nav.updates"), href: "/updates" },
    { label: t("nav.gallery"), href: "/gallery" },
    { label: isTamil ? "நிதி திரட்டல்" : "Crowdfunding", href: "/crowdfunding" },
    { label: t("nav.donate"), href: "/donate" },
    { label: t("nav.contact"), href: "/contact" },
    { label: isTamil ? "உறுப்பினர் தளம்" : "Member Portal", href: "/dashboard" },
    { label: isTamil ? "உள்நுழைவு / பதிவு" : "Sign In / Register", href: "/login" },
  ];

  const bottomBadge = tamilWord ?? (isTamil ? "நீருக்கு நன்றி 💧" : "Gratitude to Water 💧");

  return (
    <footer className={cn("relative w-full overflow-hidden border-t border-border bg-[#354358] text-white pt-16 pb-8", className)}>
      <WaveLines
        color="rgba(192, 220, 240, 0.22)"
        accent="rgba(255, 255, 255, 0.14)"
        lines={20}
        amplitude={14}
        speed={0.35}
        interaction="lift"
        className="!absolute inset-0 z-0 !min-h-0 !bg-transparent"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative h-10 w-36">
              <Image
                src="/img/logo-white.png"
                alt="5Falls Logo"
                fill
                className="object-contain object-left"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {isTamil
                ? "ஐந்தருவி மகளிர் நல அறக்கட்டளை தாம்பரம் முடிச்சூர் சாலையில் உள்ள புதுத்தாங்கல் ஏரியை மீட்டெடுத்து வருகிறது. வறண்ட நீர்நிலைகளைச் சீரமைத்து மழைநீரைச் சேமித்து பெண்களை மேம்படுத்துகிறோம்."
                : "Five Falls Women's Welfare Trust is restoring Puduthangal Lake on Mudichur Road, Tambaram. Reshaping dried water bodies to store rainwater and empower women."}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={SITE_METADATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${SITE_METADATA.email}`}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-tint mb-3">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-tint mb-3">
              Trust Registration
            </h4>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p><strong>Trust Regd. No:</strong> 87/2018</p>
              <p><strong>Society Reg. No:</strong> 252/2001</p>
              <p><strong>PAN:</strong> {SITE_METADATA.pan}</p>
              <p><strong>Direct UPI:</strong> {SITE_METADATA.upi.id} (Shanthi S)</p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-white/10">
                Office: {SITE_METADATA.address}
              </p>
            </div>
          </div>
        </div>

        {/* Wordmark Interactive Spotlight Canvas (Quarry UI) */}
        <div
          ref={ref}
          onPointerMove={(e) => {
            if (!ref.current) return;
            const r = ref.current.getBoundingClientRect();
            x.set(e.clientX - r.left);
            y.set(e.clientY - r.top);
          }}
          onPointerLeave={() => {
            x.set(-300);
            y.set(-300);
          }}
          className="relative select-none px-4 pt-6 pb-2 border-t border-white/10"
        >
          <div className="flex flex-col items-center justify-center">
            {/* Background Base Typography */}
            <p
              aria-hidden
              className="text-center text-[clamp(3.5rem,15vw,11rem)] font-extrabold tracking-tighter leading-none text-white/10"
            >
              {word}
            </p>
            {/* Pointer-lit Spotlight Mask */}
            <motion.p
              aria-hidden
              style={{ WebkitMaskImage: mask, maskImage: mask }}
              className="pointer-events-none absolute inset-x-4 top-6 bg-gradient-to-r from-primary via-sky-tint to-white bg-clip-text text-center text-[clamp(3.5rem,15vw,11rem)] font-extrabold tracking-tighter leading-none text-transparent"
            >
              {word}
            </motion.p>
          </div>
        </div>

        {/* Bottom Rail */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {isTamil
              ? `© 2026 ஐந்தருவி மகளிர் நல அறக்கட்டளை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.`
              : `© 2026 ${SITE_METADATA.name}. All rights reserved.`}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sky-tint font-medium">{bottomBadge}</span>
            <button
              onClick={scrollToTop}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default WordmarkFooter;
