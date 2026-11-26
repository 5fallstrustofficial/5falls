"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import AuthSplitShell, { GoogleOAuthIcon } from "@/components/AuthSplitShell";
import { createClient } from "@/lib/supabase/client";
import { TAMIL_NADU_DISTRICTS } from "@/data/districts";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { isTamil } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleRegister = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/register/payment`,
        },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setOauthLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google Sign-Up.");
      setOauthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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

    if (password.length < 6) {
      setError(
        isTamil
          ? "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டதாக இருக்க வேண்டும்."
          : "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isTamil
          ? "கடவுச்சொல்லும் உறுதிப்படுத்தல் கடவுச்சொல்லும் பொருந்தவில்லை."
          : "Password and Confirm Password do not match."
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/register/payment`,
          data: {
            full_name: fullName.trim(),
            phone: cleanedPhone,
            district,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If session is established immediately, also ensure profile API persists it cleanly
      if (data.session) {
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: cleanedPhone,
            district,
          }),
        });
        router.push("/register/payment");
        router.refresh();
        return;
      }

      // Email confirmation active on Supabase: continue straight to QR payment page with notice
      router.push(
        `/register/payment?pendingVerification=1&email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthSplitShell
      title={isTamil ? "உறுப்பினர் பதிவு" : "Create your account"}
      subtitle={
        isTamil
          ? "ஐந்தருவி அறக்கட்டளை இயக்கத்தில் இணையுங்கள்"
          : "Join Five Falls Women's Welfare Trust community"
      }
      footerPrompt={
        <>
          {isTamil ? "ஏற்கனவே கணக்கு உள்ளதா? " : "Already have an account? "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {isTamil ? "உள்நுழைக" : "Sign in"}
          </Link>
        </>
      }
    >
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={oauthLoading || loading}
        className="w-full h-11 rounded-full border border-[#dce2ea] bg-white hover:bg-[#f9fafb] hover:border-primary/40 text-sm font-semibold text-ink inline-flex items-center justify-center gap-2.5 transition-all shadow-2xs disabled:opacity-60"
      >
        {oauthLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <GoogleOAuthIcon />
        )}
        <span>{isTamil ? "Google மூலம் பதிவு செய்க" : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#dce2ea]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-ink-steel font-medium tracking-wider">
            {isTamil ? "அல்லது விவரங்களை உள்ளிடவும்" : "or register with email"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-ink mb-1">
            {isTamil ? "முழுப் பெயர்" : "Full Name"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isTamil ? "உங்கள் பெயர்" : "Your full name"}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="reg-phone" className="block text-xs font-semibold text-ink mb-1">
            {isTamil ? "தொலைபேசி எண்" : "Phone Number"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="reg-phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-ink mb-1">
            {isTamil ? "மின்னஞ்சல் முகவரி" : "Email Address"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* District Dropdown */}
        <div>
          <label htmlFor="reg-district" className="block text-xs font-semibold text-ink mb-1">
            {isTamil ? "மாவட்டம்" : "District"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="reg-district"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
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

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-ink mb-1">
              {isTamil ? "கடவுச்சொல்" : "Password"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-steel hover:text-ink p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="reg-confirm-password"
              className="block text-xs font-semibold text-ink mb-1"
            >
              {isTamil ? "கடவுச்சொல் உறுதிப்படுத்து" : "Confirm Password"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-steel hover:text-ink p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full pill-primary h-11 text-sm gap-2 shadow-sm mt-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>{isTamil ? "பதிவு செய்து தொடரவும்" : "Create Account & Continue"}</span>
        </button>
      </form>
    </AuthSplitShell>
  );
}
