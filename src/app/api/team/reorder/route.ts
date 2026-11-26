import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

export async function POST(request: Request) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can reorder team members." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as { orderedIds?: string[] };
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];
    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    await Promise.all(
      orderedIds.map((rawId, idx) => {
        const numericId = Number(rawId);
        if (!Number.isInteger(numericId) || numericId <= 0) return Promise.resolve();
        return admin
          .from("team_members")
          .update({ sort_order: idx + 1, updated_at: now })
          .eq("id", numericId);
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to reorder team members",
      },
      { status: 500 }
    );
  }
}
