import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const announcementId = Number(id);
  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    return NextResponse.json({ error: "Invalid announcement id" }, { status: 400 });
  }

  const body = (await request.json()) as { body?: string };
  const text = body.body?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcement_comments")
    .insert({
      announcement_id: announcementId,
      user_id: ctx.userId,
      author_name: ctx.fullName,
      author_role: ctx.profile.role,
      body: text,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const announcementId = Number(id);
  const { searchParams } = new URL(request.url);
  const commentId = Number(searchParams.get("commentId"));

  if (
    !Number.isInteger(announcementId) ||
    !Number.isInteger(commentId) ||
    commentId <= 0
  ) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing, error: fetchError } = await admin
    .from("announcement_comments")
    .select("id, user_id")
    .eq("id", commentId)
    .eq("announcement_id", announcementId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (existing.user_id !== ctx.userId && ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("announcement_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
