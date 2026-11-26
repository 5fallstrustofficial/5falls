import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { sendAnnouncementEmailBatch } from "@/lib/email/resend";

export async function GET() {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());

  const { data: announcements, error: annError } = await admin
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (annError) {
    if (
      annError.code === "42P01" ||
      annError.code === "PGRST205" ||
      annError.code === "42501"
    ) {
      return NextResponse.json({
        schemaMissing: true,
        announcements: [],
        registeredUserCount: 0,
        resendConfigured,
      });
    }
    return NextResponse.json({ error: annError.message }, { status: 500 });
  }

  const ids = (announcements ?? []).map((a) => a.id);
  let commentsByAnnouncement: Record<number, unknown[]> = {};

  if (ids.length > 0) {
    const { data: comments } = await admin
      .from("announcement_comments")
      .select("*")
      .in("announcement_id", ids)
      .order("created_at", { ascending: true });

    commentsByAnnouncement = (comments ?? []).reduce<Record<number, unknown[]>>(
      (acc, c) => {
        if (!acc[c.announcement_id]) acc[c.announcement_id] = [];
        acc[c.announcement_id].push(c);
        return acc;
      },
      {}
    );
  }

  const { count: registeredUserCount } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const enriched = (announcements ?? []).map((a) => ({
    ...a,
    comments: commentsByAnnouncement[a.id] ?? [],
  }));

  return NextResponse.json({
    schemaMissing: false,
    announcements: enriched,
    registeredUserCount: registeredUserCount ?? 0,
    resendConfigured,
  });
}

export async function POST(request: Request) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (ctx.profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can publish announcements." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      isPinned?: boolean;
      sendEmail?: boolean;
    };

    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const isPinned = Boolean(body.isPinned);
    const sendEmail = Boolean(body.sendEmail);

    if (!title || !description) {
      return NextResponse.json(
        { error: "Both Title and Description are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: inserted, error: insertError } = await admin
      .from("announcements")
      .insert({
        user_id: ctx.userId,
        author_name: ctx.fullName,
        title,
        description,
        is_pinned: isPinned,
        send_email: sendEmail,
        email_sent_count: 0,
        email_status: sendEmail ? "preview" : "not_requested",
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    let emailResult: { status: string; sentCount: number; message: string } | null = null;

    if (sendEmail) {
      // Collect all registered emails from profiles + Supabase Auth directory
      const emailSet = new Set<string>();
      const { data: profileRows } = await admin.from("profiles").select("email");
      for (const row of profileRows ?? []) {
        if (row.email) emailSet.add(row.email.trim().toLowerCase());
      }

      // Also check Auth directory in case any user registered before trigger ran
      try {
        let page = 1;
        while (true) {
          const { data: authUsers } = await admin.auth.admin.listUsers({
            page,
            perPage: 1000,
          });
          const batch = authUsers?.users ?? [];
          for (const u of batch) {
            if (u.email) emailSet.add(u.email.trim().toLowerCase());
          }
          if (batch.length < 1000) break;
          page += 1;
        }
      } catch {
        // Proceed cleanly with profile emails
      }

      emailResult = await sendAnnouncementEmailBatch({
        recipients: Array.from(emailSet),
        title,
        description,
        authorName: ctx.fullName,
      });

      await admin
        .from("announcements")
        .update({
          email_sent_count: emailResult.sentCount,
          email_status: emailResult.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);

      inserted.email_sent_count = emailResult.sentCount;
      inserted.email_status = emailResult.status;
    }

    return NextResponse.json(
      {
        announcement: { ...inserted, comments: [] },
        emailResult,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create announcement" },
      { status: 500 }
    );
  }
}
