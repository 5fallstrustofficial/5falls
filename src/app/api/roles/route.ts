import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { DEFAULT_SYSTEM_ROLES, type RolePermissions } from "@/types/portal";

export async function GET() {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: roleRows, error } = await admin
    .from("custom_roles")
    .select("*")
    .order("is_system", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205" || error.code === "42501") {
      return NextResponse.json({
        schemaNeedsUpdate: true,
        roles: DEFAULT_SYSTEM_ROLES,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    schemaNeedsUpdate: false,
    roles: roleRows && roleRows.length > 0 ? roleRows : DEFAULT_SYSTEM_ROLES,
  });
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
      name?: string;
      description?: string;
      permissions?: RolePermissions;
    };

    const name = body.name?.trim() ?? "";
    if (!name) {
      return NextResponse.json({ error: "Role name is required." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (!slug) {
      return NextResponse.json({ error: "Invalid role name." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("custom_roles")
      .insert({
        name,
        slug,
        description:
          body.description?.trim() ||
          `Custom role with configured access permissions.`,
        is_system: false,
        is_locked: false,
        permissions: body.permissions ?? {
          announcements: { view: true },
          people: {},
          verification: {},
          access_control: {},
        },
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json(
          {
            error:
              "Please run the SQL files in supabase/schemas/ in Supabase SQL Editor first to enable custom roles.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ role: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create role" },
      { status: 500 }
    );
  }
}
