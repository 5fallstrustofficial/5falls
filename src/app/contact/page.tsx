"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Link from "next/link";
import { Mail, MapPin, Users, Heart } from "lucide-react";
import { SITE_METADATA } from "@/data/siteData";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f9fafb] text-ink">
      <Navbar />

      {/* Page Header */}
      <section className="pt-36 sm:pt-40 pb-14 px-4 sm:px-6 bg-white border-b border-[#dce2ea]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-steel mb-3">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">Contact & Volunteer</span>
          </div>

          

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            Connect With Our Team
          </h1>
          <p className="text-base sm:text-xl text-ink-slate max-w-3xl leading-relaxed">
            Have questions about volunteering at our weekend clean-ups, sponsoring lake machinery, or inviting us to your community? Reach out directly.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-ink-steel">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Selaiyur, East Tambaram, Chennai - 600073</span>
            </div>
            <span>·</span>
            <div>{SITE_METADATA.email}</div>
          </div>
        </div>
      </section>

      {/* Contact Section Component */}
      <ContactSection showHeader={false} />

      <Footer />
    </main>
  );
}
