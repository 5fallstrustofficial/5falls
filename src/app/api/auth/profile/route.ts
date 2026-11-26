import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

export async function GET() {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ profile: ctx.profile });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      district?: string;
      paymentCompleted?: boolean;
      paymentReference?: string;
    };

    const updatePayload: Record<string, unknown> = {
      id: user.id,
      email: user.email ?? "",
      updated_at: new Date().toISOString(),
    };

    if (typeof body.fullName === "string" && body.fullName.trim()) {
      updatePayload.full_name = body.fullName.trim();
    } else {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      updatePayload.full_name =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        user.email?.split("@")[0] ||
        "Member";
    }

    if (typeof body.phone === "string" && body.phone.trim()) {
      updatePayload.phone = body.phone.trim();
    }
    if (typeof body.district === "string" && body.district.trim()) {
      updatePayload.district = body.district.trim();
    }
    if (typeof body.paymentCompleted === "boolean") {
      updatePayload.payment_completed = body.paymentCompleted;
    }
    if (typeof body.paymentReference === "string") {
      updatePayload.payment_reference = body.paymentReference.trim() || null;
    }

    // Also update auth user_metadata so phone/district persist even before schema migration
    await supabase.auth.updateUser({
      data: {
        ...(typeof body.fullName === "string" && body.fullName.trim()
          ? { full_name: body.fullName.trim() }
          : {}),
        ...(typeof body.phone === "string" && body.phone.trim()
          ? { phone: body.phone.trim() }
          : {}),
        ...(typeof body.district === "string" && body.district.trim()
          ? { district: body.district.trim() }
          : {}),
      },
    });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .upsert(updatePayload, { onConflict: "id" })
      .select("id, email, full_name, phone, district, payment_completed, payment_reference")
      .maybeSingle();

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.code === "42501"
      ) {
        return NextResponse.json({
          ok: true,
          schemaPending: true,
          message: "Saved to auth metadata. Run the SQL files in supabase/schemas/ to persist database profiles.",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save profile" },
      { status: 500 }
    );
  }
}
