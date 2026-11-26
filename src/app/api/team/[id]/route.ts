import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import type { TeamSocials } from "@/data/teamData";

const TEAM_BUCKET = "team-media";

function extractBucketObjectPath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

function sanitizeSocials(raw?: TeamSocials): TeamSocials {
  if (!raw || typeof raw !== "object") return {};
  const cleaned: TeamSocials = {};
  const keys: (keyof TeamSocials)[] = [
    "instagram",
    "linkedin",
    "twitter",
    "facebook",
    "website",
  ];
  for (const k of keys) {
    const val = typeof raw[k] === "string" ? raw[k]!.trim() : "";
    if (val) cleaned[k] = val;
  }
  return cleaned;
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
      { error: "Only administrators can edit team members." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      roleTitle?: string;
      description?: string;
      imageUrl?: string;
      socials?: TeamSocials;
      sortOrder?: number;
    };

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.name === "string" && body.name.trim()) {
      payload.name = body.name.trim();
    }
    if (typeof body.roleTitle === "string") {
      payload.role_title = body.roleTitle.trim() || null;
    }
    if (typeof body.description === "string" && body.description.trim()) {
      payload.description = body.description.trim();
    }
    if (typeof body.imageUrl === "string") {
      payload.image_url = body.imageUrl.trim() || null;
    }
    if (body.socials !== undefined) {
      payload.socials = sanitizeSocials(body.socials);
    }
    if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
      payload.sort_order = body.sortOrder;
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("team_members")
      .update(payload)
      .eq("id", memberId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      member: {
        id: String(data.id),
        name: data.name,
        roleTitle: data.role_title ?? undefined,
        description: data.description,
        imageUrl: data.image_url ?? undefined,
        socials: data.socials ?? {},
        sortOrder: data.sort_order ?? 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to update team member",
      },
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
      { error: "Only administrators can delete team members." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("team_members")
    .select("image_url")
    .eq("id", memberId)
    .maybeSingle();

  const { error } = await admin.from("team_members").delete().eq("id", memberId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (existing && typeof existing.image_url === "string") {
    const path = extractBucketObjectPath(existing.image_url, TEAM_BUCKET);
    if (path) {
      await admin.storage.from(TEAM_BUCKET).remove([path]);
    }
  }

  return NextResponse.json({ ok: true });
}
