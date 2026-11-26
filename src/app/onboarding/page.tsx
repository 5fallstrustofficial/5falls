"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import AuthSplitShell from "@/components/AuthSplitShell";
import { TAMIL_NADU_DISTRICTS } from "@/data/districts";
import { useLanguage } from "@/context/LanguageContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { isTamil } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok) {
          const { profile } = (await res.json()) as {
            profile?: {
              full_name?: string;
              phone?: string | null;
              district?: string | null;
              payment_completed?: boolean;
            };
          };
          if (profile) {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.phone) setPhone(profile.phone);
            if (profile.district) setDistrict(profile.district);
            if (profile.phone && profile.district) {
              router.replace(profile.payment_completed ? "/dashboard" : "/register/payment");
              return;
            }
          }
        }
      } catch {
        // Ignore transient fetch errors
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedPhone = phone.replace(/[^\d+]/g, "");
    if (cleanedPhone.length < 10) {
      setError(
        isTamil
          ? "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்."
          : "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!district) {
      setError(
        isTamil
          ? "தயவுசெய்து உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்."
          : "Please select your district."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanedPhone,
          district,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Could not save profile.");
        setSaving(false);
        return;
      }

      router.push("/register/payment");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthSplitShell
      title={isTamil ? "உங்கள் விவரங்களை நிறைவு செய்க" : "Complete your profile"}
      subtitle={
        isTamil
          ? "தொடர்வதற்கு உங்கள் தொலைபேசி எண் மற்றும் மாவட்டத்தைச் சேர்க்கவும்"
          : "Please add your phone number and district before proceeding"
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="onb-name" className="block text-xs font-semibold text-ink mb-1.5">
            {isTamil ? "முழுப் பெயர்" : "Full Name"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="onb-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="onb-phone" className="block text-xs font-semibold text-ink mb-1.5">
            {isTamil ? "தொலைபேசி எண்" : "Phone Number"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="onb-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="onb-district" className="block text-xs font-semibold text-ink mb-1.5">
            {isTamil ? "மாவட்டம்" : "District"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="onb-district"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            >
              <option value="" disabled>
                {isTamil ? "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்..." : "Select your district..."}
              </option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {isTamil ? `${d.ta} (${d.en})` : d.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full pill-primary h-11 text-sm gap-2 shadow-sm disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>{isTamil ? "சேமித்து கட்டணப் பக்கத்திற்குச் செல்லவும்" : "Save & Continue to Payment"}</span>
        </button>
      </form>
    </AuthSplitShell>
  );
}
