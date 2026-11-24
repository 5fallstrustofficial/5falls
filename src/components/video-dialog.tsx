"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Quarry UI VideoDialog:
 * A hero style video thumbnail. Hovering pulses the play button, and a click grows the thumbnail
 * into a centred dialog that autoplays. Escape or a click outside closes it.
 */
export function VideoDialog({
  src = "/video/u-2026-10-24-tree-planting-reel.mp4",
  thumbnail = "/img/u-2026-10-24-reel.webp",
  title = "15 Dry Years to Water Again",
  subtitle,
  className,
}: {
  src?: string;
  thumbnail?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("w-full", className)}>
      <motion.button
        layoutId={`video-frame-${title}`}
        onClick={() => setOpen(true)}
        aria-label={title}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />

        {/* Pulsing play button */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2s]" />
          <span className="relative grid size-14 place-items-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-0.5 size-6 fill-current text-primary" />
          </span>
        </span>

        {/* Label */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-left">
          <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md max-w-[85%] truncate">
            {title}
          </span>
          {subtitle && (
            <span className="hidden sm:inline-block rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {subtitle}
            </span>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              layoutId={`video-frame-${title}`}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-[9/16] sm:aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-border"
            >
              <video
                src={src}
                autoPlay
                controls
                playsInline
                className="size-full object-contain"
              />
            </motion.div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              <X className="size-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
