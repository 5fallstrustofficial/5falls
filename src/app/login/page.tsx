"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import AuthSplitShell, { GoogleOAuthIcon } from "@/components/AuthSplitShell";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");
  const { isTamil } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError
      ? urlError === "missing_code"
        ? "Authentication callback was cancelled or invalid. Please try again."
        : decodeURIComponent(urlError)
      : null
  );

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setOauthLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google Sign-In.");
      setOauthLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Check whether profile details (phone & district) exist before going to dashboard
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const { profile } = (await res.json()) as {
          profile?: { phone?: string | null; district?: string | null };
        };
        if (!profile?.phone || !profile?.district) {
          router.push("/onboarding");
          router.refresh();
          return;
        }
      }

      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthSplitShell
      title={isTamil ? "உள்நுழைக" : "Welcome back"}
      subtitle={
        isTamil
          ? "ஐந்தருவி அறக்கட்டளை போர்டலில் உள்நுழையுங்கள்"
          : "Sign in to access the Five Falls Trust portal & announcements"
      }
      footerPrompt={
        <>
          {isTamil ? "புதிய உறுப்பினரா? " : "New to Five Falls Trust? "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {isTamil ? "கணக்கை உருவாக்கவும்" : "Create an account"}
          </Link>
        </>
      }
    >
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading || loading}
        className="w-full h-11 rounded-full border border-[#dce2ea] bg-white hover:bg-[#f9fafb] hover:border-primary/40 text-sm font-semibold text-ink inline-flex items-center justify-center gap-2.5 transition-all shadow-2xs disabled:opacity-60"
      >
        {oauthLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <GoogleOAuthIcon />
        )}
        <span>{isTamil ? "Google மூலம் தொடரவும்" : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#dce2ea]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-ink-steel font-medium tracking-wider">
            {isTamil ? "அல்லது மின்னஞ்சல் மூலம்" : "or sign in with email"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-ink mb-1.5">
            {isTamil ? "மின்னஞ்சல் முகவரி" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-ink mb-1.5">
            {isTamil ? "கடவுச்சொல்" : "Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-11 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-steel hover:text-ink p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full pill-primary h-11 text-sm gap-2 shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          <span>{isTamil ? "உள்நுழைக" : "Sign In"}</span>
        </button>
      </form>
    </AuthSplitShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
