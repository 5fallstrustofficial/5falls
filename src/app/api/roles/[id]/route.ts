import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import type { RolePermissions } from "@/types/portal";

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
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
  }

  const body = (await request.json()) as {
    permissions?: RolePermissions;
    description?: string;
  };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("custom_roles")
    .select("*")
    .eq("id", roleId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (existing.is_locked) {
    return NextResponse.json(
      { error: "Locked system role cannot be modified." },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("custom_roles")
    .update({
      ...(body.permissions ? { permissions: body.permissions } : {}),
      ...(typeof body.description === "string" ? { description: body.description } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", roleId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ role: data });
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
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("custom_roles")
    .select("id, slug, is_system")
    .eq("id", roleId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (existing.is_system) {
    return NextResponse.json(
      { error: "Built-in system roles cannot be deleted." },
      { status: 400 }
    );
  }

  const { error } = await admin.from("custom_roles").delete().eq("id", roleId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Reassign any users holding the deleted custom role back to volunteer
  await admin
    .from("user_roles")
    .update({ role: "volunteer" })
    .eq("role", existing.slug);

  return NextResponse.json({ ok: true });
}
