import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { UPDATES_TIMELINE, type UpdatePost } from "@/data/siteData";

interface DbFieldUpdateRow {
  id: number;
  slug: string | null;
  date: string;
  display_date: string;
  title: string;
  tamil_title: string | null;
  description: string;
  tamil_description: string | null;
  category: string;
  images: { src: string; alt: string; caption?: string }[] | null;
  video: { src: string; poster?: string; caption?: string } | null;
  instagram_url: string | null;
  created_at: string;
}

function mapDbRowToUpdatePost(row: DbFieldUpdateRow): UpdatePost & { dbId: number } {
  return {
    id: String(row.id),
    dbId: row.id,
    date: row.date,
    displayDate: row.display_date,
    title: row.title,
    tamilTitle: row.tamil_title ?? undefined,
    description: row.description,
    tamilDescription: row.tamil_description ?? undefined,
    images: Array.isArray(row.images) ? row.images : [],
    video: row.video ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    category: row.category,
  };
}

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("field_updates")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.code === "42501") {
        return NextResponse.json({
          schemaMissing: true,
          updates: UPDATES_TIMELINE,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // One-time auto-seed of existing static updates so Admin can edit/update them immediately
    if (!data || data.length === 0) {
      const seedRows = UPDATES_TIMELINE.map((u) => ({
        slug: u.id,
        date: u.date,
        display_date: u.displayDate,
        title: u.title,
        tamil_title: u.tamilTitle ?? null,
        description: u.description,
        tamil_description: u.tamilDescription ?? null,
        category: u.category,
        images: u.images ?? [],
        video: u.video ?? null,
        instagram_url: u.instagramUrl ?? null,
      }));

      const { data: seeded, error: seedError } = await admin
        .from("field_updates")
        .upsert(seedRows, { onConflict: "slug" })
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!seedError && seeded) {
        return NextResponse.json({
          schemaMissing: false,
          updates: (seeded as DbFieldUpdateRow[]).map(mapDbRowToUpdatePost),
        });
      }

      return NextResponse.json({
        schemaMissing: false,
        updates: UPDATES_TIMELINE,
      });
    }

    return NextResponse.json({
      schemaMissing: false,
      updates: (data as DbFieldUpdateRow[]).map(mapDbRowToUpdatePost),
    });
  } catch {
    return NextResponse.json({
      schemaMissing: true,
      updates: UPDATES_TIMELINE,
    });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can publish field updates." },
      { status: 403 }
    );
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

    const date = body.date?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const category = body.category?.trim() || "work";

    if (!date || !title || !description) {
      return NextResponse.json(
        { error: "Date, Title, and Description are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("field_updates")
      .insert({
        user_id: ctx.userId,
        date,
        display_date: formatDisplayDate(date),
        title,
        tamil_title: body.tamilTitle?.trim() || null,
        description,
        tamil_description: body.tamilDescription?.trim() || null,
        category,
        images: Array.isArray(body.images) ? body.images : [],
        video: body.video?.src ? body.video : null,
        instagram_url: body.instagramUrl?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { update: mapDbRowToUpdatePost(data as DbFieldUpdateRow) },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create update" },
      { status: 500 }
    );
  }
}
