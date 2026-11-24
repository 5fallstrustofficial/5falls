"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SITE_METADATA } from "@/data/siteData";
import { Mail, MapPin, Send, CheckCircle2, Phone, Heart } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

export default function ContactSection({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "volunteer",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", interest: "volunteer", message: "" });
    }, 4000);
  };

  return (
    <section id="contact" className={`${showHeader ? "py-20" : "pt-10 pb-20"} px-4 sm:px-6 bg-white border-t border-[#dce2ea]`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
              Connect With Our Team
            </h2>
            <p className="text-ink-slate text-base sm:text-lg">
              Want to volunteer at a weekend lake clean-up, sponsor machinery diesel, or invite us to your school or colony association? We would love to hear from you.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Card */}
            <a
              href={`mailto:${SITE_METADATA.email}`}
              className="p-5 rounded-modal border border-[#dce2ea] bg-[#f9fafb] hover:border-primary/50 transition-all flex items-start gap-3.5 block"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#dce2ea] flex items-center justify-center shrink-0 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-steel">Direct Email</div>
                <div className="font-bold text-sm text-ink">{SITE_METADATA.email}</div>
                <div className="text-[11px] text-primary mt-0.5">Responses within 24 hours</div>
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href={SITE_METADATA.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-modal border border-[#dce2ea] bg-[#f9fafb] hover:border-primary/50 transition-all flex items-start gap-3.5 block"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#dce2ea] flex items-center justify-center shrink-0 text-rose-500">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-steel">Instagram Official</div>
                <div className="font-bold text-sm text-ink">{SITE_METADATA.instagram}</div>
                <div className="text-[11px] text-ink-steel mt-0.5">Daily reels and field photos</div>
              </div>
            </a>

            {/* Registered Office Address */}
            <div className="p-5 rounded-modal border border-[#dce2ea] bg-[#f9fafb] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-[#dce2ea] flex items-center justify-center shrink-0 text-indigo-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-steel">Registered Trust Office</div>
                <div className="text-xs font-medium text-ink leading-relaxed mt-1">
                  {SITE_METADATA.address}
                </div>
                <div className="text-[11px] text-ink-steel mt-2">
                  Regd. No. {SITE_METADATA.regNo} · PAN: {SITE_METADATA.pan}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Volunteer & Inquiry Form */}
          <div className="lg:col-span-7 bg-[#f9fafb] rounded-modal border border-[#dce2ea] p-6 sm:p-8">
            <h3 className="font-bold text-lg text-ink mb-1">
              Send a Message or Volunteer
            </h3>
            <p className="text-xs text-ink-slate mb-6">
              Fill out this quick form and our coordination team will get in touch with you.
            </p>

            {submitted ? (
              <div className="p-6 rounded-card bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base text-emerald-900">
                  Message Received! Thank You!
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Thank you for stepping forward. S. Shanthi and the 5Falls Trust team will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-slate mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-2 rounded-full border border-[#dce2ea] bg-white text-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-slate mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 rounded-full border border-[#dce2ea] bg-white text-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-slate mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98400 00000"
                      className="w-full px-4 py-2 rounded-full border border-[#dce2ea] bg-white text-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-slate mb-1">
                      Area of Interest
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-2 rounded-full border border-[#dce2ea] bg-white text-sm text-ink focus:outline-none focus:border-primary"
                    >
                      <option value="volunteer">Volunteer at Weekend Lake Clean-up</option>
                      <option value="sponsor">Sponsor Machine Fuel / Operations</option>
                      <option value="csr">Corporate CSR Partnership</option>
                      <option value="pond">Nominate a Village Pond for Restoration</option>
                      <option value="other">General Inquiry / Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-slate mb-1">
                    Message or Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how you would like to be involved..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#dce2ea] bg-white text-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="pill-primary w-full h-10 text-sm gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to 5Falls Trust</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
