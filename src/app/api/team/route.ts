import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import type { TeamMember, TeamSocials } from "@/data/teamData";

interface DbTeamRow {
  id: number;
  name: string;
  role_title: string | null;
  description: string;
  image_url: string | null;
  socials: TeamSocials | null;
  sort_order: number;
}

function mapRow(row: DbTeamRow): TeamMember {
  return {
    id: String(row.id),
    name: row.name,
    roleTitle: row.role_title ?? undefined,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    socials: row.socials && typeof row.socials === "object" ? row.socials : {},
    sortOrder: row.sort_order ?? 0,
  };
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

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.code === "42501"
      ) {
        return NextResponse.json({
          schemaMissing: true,
          members: [],
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      schemaMissing: false,
      members: ((data ?? []) as DbTeamRow[]).map(mapRow),
    });
  } catch {
    return NextResponse.json({
      schemaMissing: true,
      members: [],
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
      { error: "Only administrators can add team members." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      roleTitle?: string;
      description?: string;
      imageUrl?: string;
      socials?: TeamSocials;
    };

    const name = body.name?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and Description are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: lastRow } = await admin
      .from("team_members")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      typeof lastRow?.sort_order === "number" ? lastRow.sort_order + 1 : 1;

    const { data, error } = await admin
      .from("team_members")
      .insert({
        user_id: ctx.userId,
        name,
        role_title: body.roleTitle?.trim() || null,
        description,
        image_url: body.imageUrl?.trim() || null,
        socials: sanitizeSocials(body.socials),
        sort_order: nextOrder,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      member: mapRow(data as DbTeamRow),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create team member",
      },
      { status: 500 }
    );
  }
}
