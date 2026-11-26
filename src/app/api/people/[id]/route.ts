import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      is_verified?: boolean;
      payment_completed?: boolean;
      role?: string;
    };

    const admin = createAdminClient();
    const profileUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.is_verified === "boolean") {
      profileUpdates.is_verified = body.is_verified;
      if (body.is_verified) {
        await admin.auth.admin.updateUserById(id, { email_confirm: true });
      }
    }

    if (typeof body.payment_completed === "boolean") {
      profileUpdates.payment_completed = body.payment_completed;
      // Paid => Member, Unpaid => Volunteer (unless currently Admin or custom role)
      const { data: currentRoleRow } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .maybeSingle();

      const currRole = currentRoleRow?.role;
      if (!currRole || currRole === "member" || currRole === "volunteer") {
        await admin.from("user_roles").upsert(
          {
            user_id: id,
            role: body.payment_completed ? "member" : "volunteer",
          },
          { onConflict: "user_id" }
        );
      }
    }

    if (typeof body.role === "string" && body.role.trim()) {
      const nextRole = body.role.trim();
      await admin
        .from("user_roles")
        .upsert({ user_id: id, role: nextRole }, { onConflict: "user_id" });

      if (nextRole === "admin") {
        await admin.auth.admin.updateUserById(id, {
          app_metadata: { role: "admin" },
        });
      } else {
        await admin.auth.admin.updateUserById(id, {
          app_metadata: { role: nextRole },
        });
      }

      if (nextRole === "member") {
        profileUpdates.payment_completed = true;
      } else if (nextRole === "volunteer") {
        profileUpdates.payment_completed = false;
      }
    }

    const { error } = await admin
      .from("profiles")
      .update(profileUpdates)
      .eq("id", id);

    if (error && error.code !== "42703") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id || id === ctx.userId) {
    return NextResponse.json(
      { error: "Cannot delete your own active admin account." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
