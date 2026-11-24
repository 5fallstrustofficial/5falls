"use client";

import React, { useEffect, useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Heart, Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export type NavLink = { label: string; href: string };

export const DEFAULT_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Water Bodies", href: "/water-bodies" },
  { label: "Our Work", href: "/our-work" },
  { label: "Updates", href: "/updates" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

/**
 * A navbar that floats as a rounded pill at the top, then settles into a full width bar once you scroll.
 * Below the md breakpoint it collapses to a button that morphs into a close icon and opens a stacked menu.
 * Built with Framer Motion and Quarry UI styling tokens.
 */
export function MorphingNavbar({
  brand = "5FALLS",
  links,
  cta,
  ctaHref = "/donate",
  threshold = 40,
  scrollContainer,
  position = "fixed",
  className,
  onOpenDonate,
}: {
  brand?: string;
  links?: NavLink[];
  cta?: string;
  ctaHref?: string;
  threshold?: number;
  /** Track a scrollable element instead of the window. */
  scrollContainer?: RefObject<HTMLElement | null>;
  position?: "fixed" | "absolute";
  className?: string;
  onOpenDonate?: () => void;
}) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isTamil, toggleLanguage, t } = useLanguage();

  const activeLinks = links ?? [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.waterBodies"), href: "/water-bodies" },
    { label: t("nav.ourWork"), href: "/our-work" },
    { label: t("nav.updates"), href: "/updates" },
    { label: t("nav.gallery"), href: "/gallery" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  const activeCta = cta ?? (isTamil ? "நன்கொடை" : "Donate");

  useEffect(() => {
    const target: HTMLElement | Window = scrollContainer?.current ?? window;
    const read = () =>
      target instanceof Window ? target.scrollY : (target as HTMLElement).scrollTop;
    const onScroll = () => setStuck(read() > threshold);
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scrollContainer, threshold]);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onOpenDonate) {
      e.preventDefault();
      onOpenDonate();
    }
  };

  return (
    <motion.header
      initial={false}
      animate={{
        top: stuck ? 0 : 16,
        width: stuck ? "100%" : "min(94%, 64rem)",
        borderRadius: stuck ? 0 : 999,
      }}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      className={cn(
        "inset-x-0 z-50 mx-auto border bg-card/90 backdrop-blur-md transition-shadow",
        stuck ? "border-x-0 border-t-0 shadow-sm" : "shadow-md border-border",
        position,
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        {/* Brand: Full logo without circular border, redundant text, or Tambaram badge */}
        <Link href="/" className="flex items-center py-1 group" aria-label="5Falls Home">
          <div className="relative h-8 sm:h-9 w-28 sm:w-36">
            <Image
              src="/img/logo-navy.png"
              alt="Five Falls Women's Welfare Trust"
              fill
              priority
              className="object-contain object-left transition-transform group-hover:scale-102"
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {activeLinks.map((l) => {
            const isActive =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button, Language Toggle & Mobile Morphing Toggle */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-9 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 sm:px-3.5 text-xs font-semibold text-foreground hover:bg-accent hover:border-primary/40 transition-all shadow-2xs cursor-pointer select-none"
            aria-label={isTamil ? "Switch to English" : "தமிழுக்கு மாற்றுக"}
            title={isTamil ? "Switch to English" : "தமிழுக்கு மாற்றுக"}
          >
            <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold tracking-tight">
              {isTamil ? "English" : "தமிழ்"}
            </span>
          </button>

          <Link
            href={ctaHref}
            onClick={handleCtaClick}
            className="hidden h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:inline-flex gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{activeCta}</span>
          </Link>

          {/* Morphing Toggle Button (Burger morphs into X) */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="relative grid size-9 place-items-center rounded-full border border-border bg-card/80 text-foreground md:hidden"
          >
            <span
              className={cn(
                "absolute h-0.5 w-4 bg-foreground transition-transform duration-300",
                open ? "rotate-45" : "-translate-y-1"
              )}
            />
            <span
              className={cn(
                "absolute h-0.5 w-4 bg-foreground transition-opacity duration-200",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute h-0.5 w-4 bg-foreground transition-transform duration-300",
                open ? "-rotate-45" : "translate-y-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* Morphing Mobile Drawer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden md:hidden border-t border-border bg-card/95 backdrop-blur-xl"
            aria-label="Mobile"
          >
            <ul className="px-5 py-3 space-y-1">
              {activeLinks.map((l, i) => {
                const isActive =
                  l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * activeLinks.length }}
                className="pt-2 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    toggleLanguage();
                    setOpen(false);
                  }}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-accent shrink-0"
                >
                  <Languages className="w-4 h-4 text-primary" />
                  <span>{isTamil ? "English" : "தமிழ்"}</span>
                </button>
                <Link
                  href={ctaHref}
                  onClick={(e) => {
                    setOpen(false);
                    handleCtaClick(e);
                  }}
                  className="flex h-10 flex-1 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm gap-1.5 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{activeCta}</span>
                </Link>
              </motion.li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
