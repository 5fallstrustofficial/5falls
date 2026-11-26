"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { Calendar, Droplets, Shovel, Trees, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UPDATES_TIMELINE,
  getUpdateCategoryLabel,
  UpdatePost,
} from "@/data/siteData";

export function ScrollTimeline({
  items = UPDATES_TIMELINE,
  className,
  onOpenLightbox,
}: {
  items?: UpdatePost[];
  className?: string;
  onOpenLightbox?: (src: string, alt: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 30%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <div ref={containerRef} className={cn("relative mx-auto max-w-4xl px-4 py-8", className)}>
      <div className="relative pl-8 sm:pl-12">
        {/* Background track line */}
        <div className="absolute bottom-4 left-3 sm:left-[17px] top-4 w-0.5 bg-border" />
        
        {/* Animated drawing progress line (Quarry UI signature) */}
        <motion.div
          style={{ scaleY }}
          className="absolute bottom-4 left-3 sm:left-[17px] top-4 w-0.5 origin-top bg-primary"
        />

        <div className="space-y-12">
          {items.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="relative"
            >
              {/* Dot Icon Indicator */}
              <span className="absolute -left-8 sm:-left-12 top-1.5 grid size-7 place-items-center rounded-full border border-border bg-card text-primary shadow-xs">
                {post.category === "work" ? (
                  <Shovel className="size-3.5" />
                ) : post.category === "event" ? (
                  <Trees className="size-3.5" />
                ) : post.category === "celebration" ? (
                  <Droplets className="size-3.5" />
                ) : (
                  <Calendar className="size-3.5" />
                )}
              </span>

              {/* Card Container */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xs hover:border-primary/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    {post.displayDate}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {getUpdateCategoryLabel(post.category)}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                  {post.title}
                </h3>
                {post.tamilTitle && (
                  <p className="text-xs sm:text-sm font-semibold text-primary mb-3">
                    {post.tamilTitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  {post.description}
                </p>

                {/* Post Images Thumbnail strip */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                    {post.images.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border cursor-pointer group"
                        onClick={() => onOpenLightbox && onOpenLightbox(img.src, img.alt)}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
