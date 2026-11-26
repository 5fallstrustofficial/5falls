import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

const GALLERY_BUCKET = "gallery-media";

function extractBucketObjectPath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

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
      { error: "Only administrators can edit gallery items." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      type?: "image" | "video";
      src?: string;
      poster?: string;
      title?: string;
      category?: "videos" | "lake" | "events" | "work";
    };

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.type === "image" || body.type === "video") payload.type = body.type;
    if (typeof body.src === "string" && body.src.trim()) payload.src = body.src.trim();
    if (typeof body.poster === "string") payload.poster = body.poster.trim() || null;
    if (typeof body.title === "string" && body.title.trim()) payload.title = body.title.trim();
    if (body.category) payload.category = body.category;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("gallery_items")
      .update(payload)
      .eq("id", itemId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      item: {
        id: String(data.id),
        type: data.type,
        src: data.src,
        poster: data.poster ?? undefined,
        title: data.title,
        category: data.category,
        sort_order: data.sort_order,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update gallery item" },
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
    return NextResponse.json(
      { error: "Only administrators can delete gallery items." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("gallery_items")
    .select("src, poster")
    .eq("id", itemId)
    .maybeSingle();

  const { error } = await admin.from("gallery_items").delete().eq("id", itemId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Clean up uploaded storage objects to reclaim Supabase Storage quota
  if (existing) {
    const pathsToRemove = [existing.src, existing.poster]
      .filter((u): u is string => typeof u === "string")
      .map((u) => extractBucketObjectPath(u, GALLERY_BUCKET))
      .filter((p): p is string => Boolean(p));

    if (pathsToRemove.length > 0) {
      await admin.storage.from(GALLERY_BUCKET).remove(pathsToRemove);
    }
  }

  return NextResponse.json({ ok: true });
}
