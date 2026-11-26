import { NextResponse } from "next/server";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { sendInviteEmailBatch } from "@/lib/email/resend";
import type { PersonRecord } from "@/types/portal";

export async function GET() {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();

    // 1. Fetch Auth users
    const authUsersList: Array<{
      id: string;
      email?: string;
      email_confirmed_at?: string | null;
      last_sign_in_at?: string | null;
      created_at: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    }> = [];

    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const batch = data?.users ?? [];
      authUsersList.push(...batch);
      if (batch.length < 1000) break;
      page += 1;
    }

    // 2. Fetch profiles and user_roles
    const { data: profileRows } = await admin.from("profiles").select("*");
    const { data: roleRows } = await admin.from("user_roles").select("*");

    const profileMap = new Map(
      (profileRows ?? []).map((p) => [p.id as string, p])
    );
    const roleMap = new Map(
      (roleRows ?? []).map((r) => [r.user_id as string, r.role as string])
    );

    const people: PersonRecord[] = authUsersList.map((u) => {
      const prof = profileMap.get(u.id);
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const appMeta = (u.app_metadata ?? {}) as Record<string, unknown>;
      const email = prof?.email ?? u.email ?? "";
      const paymentCompleted = Boolean(prof?.payment_completed);

      let role = roleMap.get(u.id) ?? "";
      if (appMeta.role === "admin" || isAdminEmail(email)) {
        role = "admin";
      } else if (!role || role === "member" || role === "volunteer") {
        // Core rule: paid => member, unpaid => volunteer
        role = paymentCompleted ? "member" : "volunteer";
      }

      const fullName =
        prof?.full_name ||
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        email.split("@")[0] ||
        "Member";

      return {
        id: u.id,
        email,
        full_name: fullName,
        phone:
          prof?.phone ?? (typeof meta.phone === "string" ? meta.phone : null),
        district:
          prof?.district ??
          (typeof meta.district === "string" ? meta.district : null),
        payment_completed: paymentCompleted,
        payment_reference: prof?.payment_reference ?? null,
        role,
        is_verified: Boolean(prof?.is_verified || u.email_confirmed_at),
        email_confirmed: Boolean(u.email_confirmed_at),
        last_sign_in_at: u.last_sign_in_at ?? null,
        created_at: prof?.created_at ?? u.created_at,
      };
    });

    people.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      people,
      resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load people" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      mode: "invite" | "create_credentials" | "bulk_invite";
      email?: string;
      fullName?: string;
      phone?: string;
      district?: string;
      password?: string;
      role?: string;
      invites?: { email: string; name?: string }[];
    };

    const { origin } = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const baseUrl =
      process.env.NODE_ENV !== "development" && forwardedHost
        ? `https://${forwardedHost}`
        : origin;

    const admin = createAdminClient();

    // 1. Bulk upload emails -> send invitation emails alone
    if (body.mode === "bulk_invite") {
      const list = body.invites ?? [];
      if (list.length === 0) {
        return NextResponse.json(
          { error: "Please provide at least one valid email address." },
          { status: 400 }
        );
      }

      const emailResult = await sendInviteEmailBatch({
        invites: list,
        baseUrl,
      });

      return NextResponse.json({
        ok: emailResult.status !== "failed",
        emailResult,
      });
    }

    // 2. Single Invite by Email -> sends email to create account
    if (body.mode === "invite") {
      const email = body.email?.trim().toLowerCase() ?? "";
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { error: "Valid email address is required." },
          { status: 400 }
        );
      }

      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (apiKey) {
        const emailResult = await sendInviteEmailBatch({
          invites: [{ email, name: body.fullName?.trim() }],
          baseUrl,
        });
        return NextResponse.json({
          ok: emailResult.status !== "failed",
          emailResult,
        });
      }

      // If RESEND_API_KEY is unset, try Supabase built-in inviteUserByEmail first
      const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${baseUrl}/auth/callback?next=/onboarding`,
          data: {
            full_name: body.fullName?.trim() || undefined,
          },
        }
      );

      if (!inviteErr) {
        return NextResponse.json({
          ok: true,
          emailResult: {
            status: "sent",
            sentCount: 1,
            message: `Supabase invite email sent to ${email}.`,
          },
        });
      }

      // Graceful preview fallback if Supabase SMTP rate-limits or rejects
      return NextResponse.json({
        ok: true,
        emailResult: {
          status: "preview",
          sentCount: 1,
          message: `Invite prepared for ${email} (configure RESEND_API_KEY for reliable email delivery: ${inviteErr.message}).`,
        },
      });
    }

    // 3. Create account with Email & Password directly by Admin
    if (body.mode === "create_credentials") {
      const email = body.email?.trim().toLowerCase() ?? "";
      const password = body.password ?? "";
      const fullName = body.fullName?.trim() || email.split("@")[0] || "Member";
      const assignedRole = body.role?.trim() || "volunteer";

      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { error: "Valid email address is required." },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }

      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          app_metadata:
            assignedRole === "admin" ? { role: "admin" } : undefined,
          user_metadata: {
            full_name: fullName,
            phone: body.phone?.trim() || null,
            district: body.district?.trim() || null,
          },
        });

      if (createErr || !created.user) {
        return NextResponse.json(
          { error: createErr?.message ?? "Failed to create user." },
          { status: 400 }
        );
      }

      const paymentCompleted = assignedRole === "member";
      await admin.from("profiles").upsert(
        {
          id: created.user.id,
          email,
          full_name: fullName,
          phone: body.phone?.trim() || null,
          district: body.district?.trim() || null,
          payment_completed: paymentCompleted,
          is_verified: true,
        },
        { onConflict: "id" }
      );

      await admin.from("user_roles").upsert(
        {
          user_id: created.user.id,
          role: assignedRole,
        },
        { onConflict: "user_id" }
      );

      return NextResponse.json(
        {
          ok: true,
          message: `Created account for ${email} (${assignedRole}).`,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 }
    );
  }
}
