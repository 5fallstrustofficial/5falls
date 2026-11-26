import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";

function resolveSafeRedirect(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/dashboard";
  }
  return nextParam;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveSafeRedirect(searchParams.get("next"));

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const baseOrigin =
    !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  if (!code) {
    return NextResponse.redirect(`${baseOrigin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(
      `${baseOrigin}/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`
    );
  }

  const user = data.user;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let targetPath = next;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone, district, payment_completed")
      .eq("id", user.id)
      .maybeSingle();

    // Ensure ADMIN_EMAILS are promoted cleanly
    if (isAdminEmail(user.email)) {
      await admin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id" });
    }

    const phone =
      profile?.phone ?? (typeof meta.phone === "string" ? meta.phone : null);
    const district =
      profile?.district ?? (typeof meta.district === "string" ? meta.district : null);

    if (!phone || !district) {
      // First-time Google OAuth sign-ups still need Phone Number & District
      targetPath = "/onboarding";
    } else if (!profile?.payment_completed && !isAdminEmail(user.email)) {
      targetPath = "/register/payment";
    }
  } catch {
    // If schema isn't migrated yet, let onboarding/dashboard handle cleanly
  }

  return NextResponse.redirect(`${baseOrigin}${targetPath}`);
}
