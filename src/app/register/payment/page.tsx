"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Loader2,
  MailCheck,
  QrCode,
  Languages,
} from "lucide-react";
import { SITE_METADATA, DONATION_TIERS } from "@/data/siteData";
import { useLanguage } from "@/context/LanguageContext";

function RegistrationPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingVerification = searchParams.get("pendingVerification") === "1";
  const registeredEmail = searchParams.get("email") || "";
  const { isTamil, toggleLanguage } = useLanguage();

  const [selectedTier, setSelectedTier] = useState<string>("₹500");
  const [paymentRef, setPaymentRef] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SITE_METADATA.upi.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleContinue = async (skipPayment = false) => {
    setSubmitting(true);
    try {
      if (!pendingVerification) {
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentCompleted: true,
            paymentReference: skipPayment ? "" : paymentRef.trim() || selectedTier,
          }),
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // If email confirmation is still pending on Supabase, route user cleanly to login
      router.push("/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-ink py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="relative h-9 w-32 block" aria-label="5Falls Home">
            <Image
              src="/img/logo-navy.png"
              alt="Five Falls Women's Welfare Trust"
              fill
              className="object-contain object-left"
            />
          </Link>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dce2ea] bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-primary/40 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{isTamil ? "English" : "தமிழ்"}</span>
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-semibold mb-8 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isTamil ? "1. பதிவு முடிந்தது" : "1. Account Registered"}</span>
          </span>
          <span className="text-ink-mute">→</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25">
            <QrCode className="w-3.5 h-3.5" />
            <span>{isTamil ? "2. UPI QR நன்கொடை" : "2. QR Payment Support"}</span>
          </span>
          <span className="text-ink-mute">→</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-ink-steel border border-[#dce2ea]">
            <span>{isTamil ? "3. உறுப்பினர் தளம்" : "3. Member Dashboard"}</span>
          </span>
        </div>

        {/* Pending Email Verification Alert (when Supabase mailer_autoconfirm is disabled) */}
        {pendingVerification && (
          <div className="mb-6 rounded-modal border border-sky-200 bg-sky-50 px-5 py-4 flex items-start gap-3">
            <MailCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-ink-slate leading-relaxed">
              <p className="font-bold text-ink">
                {isTamil
                  ? "உங்கள் மின்னஞ்சலுக்கு உறுதிப்படுத்தல் இணைப்பு அனுப்பப்பட்டுள்ளது"
                  : "Verification link sent to your email"}
              </p>
              <p className="mt-0.5">
                {isTamil
                  ? `${registeredEmail || "உங்கள் மின்னஞ்சலில்"} உள்ள இணைப்பைக் கிளிக் செய்து கணக்கை உறுதிப்படுத்தவும். அதற்குள் கீழே உள்ள QR குறியீட்டைப் பயன்படுத்தி அறக்கட்டளைக்கு உதவலாம்.`
                  : `We sent a confirmation email to ${registeredEmail || "your inbox"}. Please verify your email address, and feel free to support the lake revival work via the Trust UPI QR below.`}
              </p>
            </div>
          </div>
        )}

        {/* Main QR Payment Card */}
        <div className="bg-white rounded-modal border border-[#dce2ea] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: UPI QR Code */}
            <div className="lg:col-span-5 bg-[#f9fafb] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#dce2ea] flex flex-col items-center justify-center text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
                {isTamil ? "அதிகாரப்பூர்வ அறக்கட்டளை QR" : "Official Trust UPI QR"}
              </span>

              <div className="relative w-56 h-56 rounded-2xl overflow-hidden bg-white border border-[#dce2ea] p-3 shadow-sm mb-4">
                <Image
                  src={SITE_METADATA.upi.qrImage}
                  alt="Five Falls Trust UPI QR Code"
                  fill
                  className="object-contain p-2"
                />
              </div>

              <p className="text-xs font-bold text-ink">
                {isTamil
                  ? "GPay, PhonePe, Paytm அல்லது எந்த UPI செயலியிலும் ஸ்கேன் செய்க"
                  : "Scan with GPay, PhonePe, Paytm, or any UPI app"}
              </p>
              <p className="text-[11px] text-ink-steel mt-1 mb-4">
                {SITE_METADATA.upi.name}
              </p>

              {/* Copy UPI Pill */}
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#dce2ea] shadow-2xs">
                <span className="font-mono text-xs sm:text-sm font-bold text-ink">
                  {SITE_METADATA.upi.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="pill-primary text-xs h-7 px-3 gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isTamil ? "நகலெடுத்தது" : "Copied") : (isTamil ? "நகலெடு" : "Copy")}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Contribution Options & Continue */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {isTamil
                    ? "நீர்நிலைகள் மீட்புக்கு உங்கள் பங்களிப்பு"
                    : "Support Five Falls Restoration Work"}
                </h1>
                <p className="text-sm text-ink-slate mt-1.5 leading-relaxed">
                  {isTamil
                    ? "உங்கள் தன்னார்வ பங்களிப்பு ஏரி தூர்வாரும் இயந்திரங்கள் மற்றும் சமூக நலப் பணிகளுக்கு நேரடியாகப் பயன்படுகிறது."
                    : "Your voluntary contribution powers desilting machinery, palm sapling drives, and community welfare programs across Tamil Nadu."}
                </p>

                {/* Contribution Tiers */}
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  {DONATION_TIERS.map((tier) => (
                    <button
                      type="button"
                      key={tier.amount}
                      onClick={() => setSelectedTier(tier.amount)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTier === tier.amount
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-[#dce2ea] bg-[#f9fafb] hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-extrabold text-base text-ink">{tier.amount}</div>
                      <div className="text-xs font-medium text-ink-slate line-clamp-1">
                        {isTamil && tier.tamilName ? tier.tamilName : tier.name}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Optional Reference Input */}
                <div className="mt-5">
                  <label htmlFor="upi-ref" className="block text-xs font-semibold text-ink mb-1.5">
                    {isTamil
                      ? "UPI பரிவர்த்தனை எண் / குறிப்பு (விருப்பமானது)"
                      : "UPI Transaction ID / Reference (Optional)"}
                  </label>
                  <input
                    id="upi-ref"
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder={
                      isTamil ? "எ.கா. UTR 412345678901" : "e.g. UTR 412345678901"
                    }
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#dce2ea]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleContinue(false)}
                  className="w-full pill-primary h-11 text-sm gap-2 shadow-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {pendingVerification
                      ? isTamil
                        ? "கட்டணம் செலுத்திய பின் உள்நுழையவும்"
                        : "I've Paid · Go to Sign In"
                      : isTamil
                      ? "கட்டணத்தை உறுதிசெய்து டாஷ்போர்டுக்குச் செல்லவும்"
                      : "Confirm & Go to Dashboard"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs text-ink-steel">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{SITE_METADATA.regNo}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleContinue(true)}
                    className="font-semibold text-ink-slate hover:text-primary hover:underline"
                  >
                    {isTamil ? "பின்னர் பங்களிக்கிறேன் →" : "Contribute later & continue →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <RegistrationPaymentContent />
    </Suspense>
  );
}
