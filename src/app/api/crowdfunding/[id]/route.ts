import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import type {
  CrowdfundingMediaImage,
  CrowdfundingMediaVideo,
} from "@/data/crowdfundingData";

const BUCKET = "crowdfunding-media";

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
      { error: "Only administrators can edit crowdfunding campaigns." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const campaignId = Number(id);
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      personName?: string;
      title?: string;
      story?: string;
      location?: string;
      targetAmount?: number;
      raisedAmount?: number;
      status?: "active" | "completed" | "paused";
      upiId?: string;
      contactPhone?: string;
      images?: CrowdfundingMediaImage[];
      video?: CrowdfundingMediaVideo | null;
    };

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.personName === "string" && body.personName.trim()) {
      payload.person_name = body.personName.trim();
    }
    if (typeof body.title === "string" && body.title.trim()) {
      payload.title = body.title.trim();
    }
    if (typeof body.story === "string" && body.story.trim()) {
      payload.story = body.story.trim();
    }
    if (typeof body.location === "string") {
      payload.location = body.location.trim() || null;
    }
    if (body.targetAmount !== undefined) {
      const t = Number(body.targetAmount);
      if (!Number.isFinite(t) || t <= 0) {
        return NextResponse.json(
          { error: "Target Amount must be greater than 0." },
          { status: 400 }
        );
      }
      payload.target_amount = t;
    }
    if (body.raisedAmount !== undefined) {
      const r = Math.max(0, Number(body.raisedAmount) || 0);
      payload.raised_amount = r;
    }
    if (
      body.status === "active" ||
      body.status === "completed" ||
      body.status === "paused"
    ) {
      payload.status = body.status;
    }
    if (typeof body.upiId === "string") {
      payload.upi_id = body.upiId.trim() || null;
    }
    if (typeof body.contactPhone === "string") {
      payload.contact_phone = body.contactPhone.trim() || null;
    }
    if (Array.isArray(body.images)) {
      payload.images = body.images;
    }
    if (body.video !== undefined) {
      payload.video = body.video && body.video.src ? body.video : null;
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("crowdfunding_campaigns")
      .update(payload)
      .eq("id", campaignId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      campaign: {
        id: String(data.id),
        personName: data.person_name,
        title: data.title,
        story: data.story,
        location: data.location ?? undefined,
        targetAmount: Number(data.target_amount) || 0,
        raisedAmount: Number(data.raised_amount) || 0,
        status: data.status ?? "active",
        upiId: data.upi_id ?? undefined,
        contactPhone: data.contact_phone ?? undefined,
        images: Array.isArray(data.images) ? data.images : [],
        video: data.video ?? undefined,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to update crowdfunding campaign",
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
      { error: "Only administrators can delete crowdfunding campaigns." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const campaignId = Number(id);
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("crowdfunding_campaigns")
    .select("images, video")
    .eq("id", campaignId)
    .maybeSingle();

  const { error } = await admin
    .from("crowdfunding_campaigns")
    .delete()
    .eq("id", campaignId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (existing) {
    const urls: string[] = [];
    if (Array.isArray(existing.images)) {
      for (const img of existing.images as CrowdfundingMediaImage[]) {
        if (img?.src) urls.push(img.src);
      }
    }
    if (existing.video && typeof (existing.video as CrowdfundingMediaVideo).src === "string") {
      urls.push((existing.video as CrowdfundingMediaVideo).src);
    }
    const pathsToRemove = urls
      .map((u) => extractBucketObjectPath(u, BUCKET))
      .filter((p): p is string => Boolean(p));

    if (pathsToRemove.length > 0) {
      await admin.storage.from(BUCKET).remove(pathsToRemove);
    }
  }

  return NextResponse.json({ ok: true });
}
