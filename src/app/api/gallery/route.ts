import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { DEFAULT_GALLERY_ITEMS, type GalleryItem } from "@/data/galleryData";

interface DbGalleryRow {
  id: number;
  slug: string | null;
  type: "image" | "video";
  src: string;
  poster: string | null;
  title: string;
  category: "videos" | "lake" | "events" | "work";
  sort_order: number;
}

function mapRow(row: DbGalleryRow): GalleryItem {
  return {
    id: String(row.id),
    type: row.type,
    src: row.src,
    poster: row.poster ?? undefined,
    title: row.title,
    category: row.category,
    sort_order: row.sort_order,
  };
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.code === "42501") {
        return NextResponse.json({
          schemaMissing: true,
          items: DEFAULT_GALLERY_ITEMS,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // One-time auto-seed so admin can edit/delete existing gallery items
    if (!data || data.length === 0) {
      const seedRows = DEFAULT_GALLERY_ITEMS.map((item) => ({
        slug: item.id,
        type: item.type,
        src: item.src,
        poster: item.poster ?? null,
        title: item.title,
        category: item.category,
        sort_order: item.sort_order ?? 0,
      }));

      const { data: seeded, error: seedError } = await admin
        .from("gallery_items")
        .upsert(seedRows, { onConflict: "slug" })
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!seedError && seeded) {
        return NextResponse.json({
          schemaMissing: false,
          items: (seeded as DbGalleryRow[]).map(mapRow),
        });
      }

      return NextResponse.json({
        schemaMissing: false,
        items: DEFAULT_GALLERY_ITEMS,
      });
    }

    return NextResponse.json({
      schemaMissing: false,
      items: (data as DbGalleryRow[]).map(mapRow),
    });
  } catch {
    return NextResponse.json({
      schemaMissing: true,
      items: DEFAULT_GALLERY_ITEMS,
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
      { error: "Only administrators can add gallery items." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as {
      type?: "image" | "video";
      src?: string;
      poster?: string;
      title?: string;
      category?: "videos" | "lake" | "events" | "work";
    };

    const type = body.type === "video" ? "video" : "image";
    const src = body.src?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const category = body.category ?? (type === "video" ? "videos" : "lake");

    if (!src || !title) {
      return NextResponse.json(
        { error: "Media file/URL and Title are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("gallery_items")
      .insert({
        user_id: ctx.userId,
        type,
        src,
        poster: body.poster?.trim() || null,
        title,
        category,
        sort_order: 0, // New items appear first
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item: mapRow(data as DbGalleryRow) }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
