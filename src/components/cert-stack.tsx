"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export type Cert = { title: string; org: string; when: string; logo?: ReactNode };

const CERTS: Cert[] = [
  { title: "Cloud Practitioner", org: "Northwind Cloud", when: "Aug 2026" },
  { title: "Machine Learning Foundations", org: "Open Academy", when: "Jun 2026" },
  { title: "Web Accessibility Specialist", org: "Inclusive Web Institute", when: "Mar 2026" },
  { title: "Professional Scrum Master", org: "Agile Guild", when: "Nov 2025" },
  { title: "Data Analysis with Python", org: "Open Academy", when: "Sep 2025" },
  { title: "Prompt Engineering Essentials", org: "AI Learning Hub", when: "Jul 2025" },
];

const ROT = [-2, 4, -6, 7, -8];
const TONE = ["bg-primary text-primary-foreground", "bg-card text-card-foreground", "bg-foreground text-background", "bg-accent text-accent-foreground", "bg-card text-card-foreground", "bg-primary text-primary-foreground"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A pile of tilted certificate cards that flick through. The top card spins off to the right and
 * slides to the back, the pile re-settles, and it all advances by itself until the pointer is over
 * it. Use the arrows, click the top card, or leave it running. Pass your own `certs`.
 */
export function CertStack({ certs = CERTS, interval = 4800, label = "Licenses and certifications", note = "credentials and counting. Cloud, AI and developer tooling, straight from the source.", className }: { certs?: Cert[]; interval?: number; label?: string; note?: string; className?: string }) {
  const n = certs.length;
  const [order, setOrder] = useState(() => certs.map((_, i) => i));
  const [flying, setFlying] = useState<number | null>(null);
  const [entering, setEntering] = useState<number | null>(null);
  const busy = useRef(false);
  const paused = useRef(false);

  const ref = useRef(order);

  const next = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setFlying(ref.current[0]);
    setTimeout(() => {
      const o = ref.current;
      ref.current = [...o.slice(1), o[0]];
      setOrder(ref.current);
      setFlying(null);
      busy.current = false;
    }, 460);
  }, []);

  const prev = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const o = ref.current;
    ref.current = [o[n - 1], ...o.slice(0, n - 1)];
    setEntering(o[n - 1]);
    setOrder(ref.current);
    setTimeout(() => {
      setEntering(null);
      busy.current = false;
    }, 620);
  }, [n]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || interval <= 0) return;
    const t = setInterval(() => !paused.current && next(), interval);
    return () => clearInterval(t);
  }, [interval, next]);

  const pos = (i: number) => order.indexOf(i);
  const front = order[0];

  return (
    <section className={cn("mx-auto grid w-full max-w-5xl items-center gap-12 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[1fr_1.15fr]", className)} onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:tracking-[0.25em]">{label}</p>
        <p className="mt-3 font-[family-name:var(--font-anton)] text-[clamp(4rem,14vw,10rem)] leading-none text-primary" aria-label={`${n} certifications`}>{pad(n)}</p>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground sm:text-base">{note}</p>
        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={prev} aria-label="Previous certificate" className="grid size-11 place-items-center rounded-full border-2 border-foreground transition-colors hover:bg-foreground hover:text-background"><ArrowUpRight className="size-5 -rotate-[135deg]" strokeWidth={2.6} /></button>
          <button type="button" onClick={next} aria-label="Next certificate" className="grid size-11 place-items-center rounded-full border-2 border-foreground transition-colors hover:bg-foreground hover:text-background"><ArrowUpRight className="size-5 rotate-45" strokeWidth={2.6} /></button>
          <span className="ml-2 text-sm font-semibold tabular-nums text-muted-foreground">{pad(front + 1)} / {pad(n)}</span>
        </div>
      </div>

      <div className="relative mx-auto mt-6 min-h-[20rem] w-full max-w-[calc(100%-2rem)] sm:mt-0 sm:min-h-0 sm:aspect-[4/3] sm:max-w-md" aria-live="polite">
        {certs.map((c, i) => {
          const p = pos(i);
          const isFlying = flying === i;
          const isEntering = entering === i;
          return (
            <motion.article
              key={c.title}
              onClick={next}
              initial={false}
              animate={
                isFlying
                  ? { x: "125%", y: -30, rotate: 18, opacity: 0, scale: 1, zIndex: n + 1 }
                  : { x: p * 10, y: p * -12, rotate: ROT[p % ROT.length], scale: 1 - p * 0.045, opacity: p < 4 ? 1 : 0, zIndex: isEntering ? n + 1 : n - p }
              }
              transition={isFlying ? { duration: 0.46, ease: [0.55, 0, 1, 0.45] } : isEntering ? { duration: 0.6, ease: [0.34, 1.4, 0.64, 1] } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={cn("absolute inset-0 flex cursor-pointer flex-col justify-between overflow-hidden rounded-[1.5rem] border-2 border-foreground p-5 shadow-[5px_5px_0_0_var(--foreground)] sm:rounded-[1.75rem] sm:p-6 sm:shadow-[6px_6px_0_0_var(--foreground)]", TONE[i % TONE.length])}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-xl border-2 border-current bg-background/90 text-foreground sm:size-14 sm:rounded-2xl">{c.logo ?? <Award className="size-6 sm:size-7" />}</span>
                <span className="font-[family-name:var(--font-anton)] text-xl opacity-60 sm:text-2xl">{pad(i + 1)}</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-[family-name:var(--font-anton)] text-[clamp(1.25rem,4.5vw,2.1rem)] leading-tight">{c.title}</h4>
                <p className="mt-1.5 line-clamp-3 text-xs font-medium opacity-80 sm:text-sm">{c.org}</p>
                {c.when && <span className="mt-3 inline-block rounded-full border-2 border-current px-3 py-1 text-[11px] font-semibold sm:mt-4 sm:text-xs">{c.when}</span>}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
