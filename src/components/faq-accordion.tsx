"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_METADATA } from "@/data/siteData";

export interface FaqItem {
  question: string;
  answer: string;
}

export const DONATION_FAQS: FaqItem[] = [
  {
    question: "Whose name will appear on GPay / PhonePe when I scan?",
    answer: `The account name shown is Shanthi S (${SITE_METADATA.upi.id}), Founder and Secretary of Five Falls Women's Welfare Trust. The account directly funds on-site machine fuel and volunteer operational expenses.`,
  },
  {
    question: "How can corporate organizations or CSR funds contribute?",
    answer: `For grants or CSR sponsorship, write directly to ${SITE_METADATA.email}. We will furnish the official Trust bank details, PAN documentation (${SITE_METADATA.pan}), 80G tax exemption, and work completion certificates.`,
  },
  {
    question: "Can I donate excavator diesel directly instead of transferring money?",
    answer: "Yes! You can fill the excavator's diesel tank directly at the local fuel station on Mudichur Road. Please contact us via email or visit the site to coordinate with our site supervisor.",
  },
  {
    question: "Can I volunteer on site at Puduthangal Lake?",
    answer: "Absolutely! We organize community cleanups, tree planting, and perimeter sapling maintenance. Reach out via our Contact page or message us on Instagram @5falls.trust.",
  },
  {
    question: "Are donations used for any administrative overhead?",
    answer: "No. Five Falls Trust operates as a 100% grassroots volunteer initiative. Every rupee goes directly to machine rental, diesel fuel, tree saplings, and operator refreshments.",
  },
];

export function FaqAccordion({
  faqs = DONATION_FAQS,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about sponsoring our lake restoration work",
  className,
}: {
  faqs?: FaqItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={cn("mx-auto w-full max-w-3xl px-4 py-8", className)}>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-xs">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.question}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-card-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{faq.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                >
                  <Plus className="size-3.5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
