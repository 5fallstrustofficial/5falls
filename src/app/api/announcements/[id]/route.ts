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
    return NextResponse.json(
      { error: "Only administrators can pin or update announcements." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const announcementId = Number(id);
  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    return NextResponse.json({ error: "Invalid announcement id" }, { status: 400 });
  }

  const body = (await request.json()) as { is_pinned?: boolean };
  if (typeof body.is_pinned !== "boolean") {
    return NextResponse.json({ error: "Missing is_pinned boolean" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcements")
    .update({
      is_pinned: body.is_pinned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", announcementId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ announcement: data });
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
    return NextResponse.json(
      { error: "Only administrators can delete announcements." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const announcementId = Number(id);
  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    return NextResponse.json({ error: "Invalid announcement id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
