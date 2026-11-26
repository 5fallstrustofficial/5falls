import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
      { error: "Only administrators can edit updates." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const updateId = Number(id);
  if (!Number.isInteger(updateId) || updateId <= 0) {
    return NextResponse.json({ error: "Invalid update id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      date?: string;
      title?: string;
      tamilTitle?: string;
      description?: string;
      tamilDescription?: string;
      category?: string;
      images?: { src: string; alt: string; caption?: string }[];
      video?: { src: string; poster?: string; caption?: string } | null;
      instagramUrl?: string;
    };

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.date === "string" && body.date.trim()) {
      payload.date = body.date.trim();
      payload.display_date = formatDisplayDate(body.date.trim());
    }
    if (typeof body.title === "string" && body.title.trim()) {
      payload.title = body.title.trim();
    }
    if (typeof body.tamilTitle === "string") {
      payload.tamil_title = body.tamilTitle.trim() || null;
    }
    if (typeof body.description === "string" && body.description.trim()) {
      payload.description = body.description.trim();
    }
    if (typeof body.tamilDescription === "string") {
      payload.tamil_description = body.tamilDescription.trim() || null;
    }
    if (typeof body.category === "string" && body.category.trim()) {
      payload.category = body.category.trim();
    }
    if (Array.isArray(body.images)) {
      payload.images = body.images;
    }
    if (body.video !== undefined) {
      payload.video = body.video && body.video.src ? body.video : null;
    }
    if (typeof body.instagramUrl === "string") {
      payload.instagram_url = body.instagramUrl.trim() || null;
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("field_updates")
      .update(payload)
      .eq("id", updateId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      update: {
        id: String(data.id),
        date: data.date,
        displayDate: data.display_date,
        title: data.title,
        tamilTitle: data.tamil_title ?? undefined,
        description: data.description,
        tamilDescription: data.tamil_description ?? undefined,
        images: Array.isArray(data.images) ? data.images : [],
        video: data.video ?? undefined,
        instagramUrl: data.instagram_url ?? undefined,
        category: data.category,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
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
      { error: "Only administrators can delete updates." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const updateId = Number(id);
  if (!Number.isInteger(updateId) || updateId <= 0) {
    return NextResponse.json({ error: "Invalid update id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("field_updates").delete().eq("id", updateId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
