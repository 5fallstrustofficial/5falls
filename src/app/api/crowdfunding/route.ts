import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import type {
  CrowdfundingCampaign,
  CrowdfundingMediaImage,
  CrowdfundingMediaVideo,
} from "@/data/crowdfundingData";

interface DbCrowdfundingRow {
  id: number;
  person_name: string;
  title: string;
  story: string;
  location: string | null;
  target_amount: number | string;
  raised_amount: number | string;
  status: "active" | "completed" | "paused";
  upi_id: string | null;
  contact_phone: string | null;
  images: CrowdfundingMediaImage[] | null;
  video: CrowdfundingMediaVideo | null;
  created_at: string;
}

function mapRow(row: DbCrowdfundingRow): CrowdfundingCampaign {
  return {
    id: String(row.id),
    personName: row.person_name,
    title: row.title,
    story: row.story,
    location: row.location ?? undefined,
    targetAmount: Number(row.target_amount) || 0,
    raisedAmount: Number(row.raised_amount) || 0,
    status: row.status ?? "active",
    upiId: row.upi_id ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    images: Array.isArray(row.images) ? row.images : [],
    video: row.video ?? undefined,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("crowdfunding_campaigns")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.code === "42501"
      ) {
        return NextResponse.json({
          schemaMissing: true,
          campaigns: [],
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      schemaMissing: false,
      campaigns: ((data ?? []) as DbCrowdfundingRow[]).map(mapRow),
    });
  } catch {
    return NextResponse.json({
      schemaMissing: true,
      campaigns: [],
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
      { error: "Only administrators can create crowdfunding campaigns." },
      { status: 403 }
    );
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

    const personName = body.personName?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const story = body.story?.trim() ?? "";
    const targetAmount = Number(body.targetAmount);
    const raisedAmount = Math.max(0, Number(body.raisedAmount ?? 0) || 0);

    if (!personName || !title || !story || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return NextResponse.json(
        {
          error:
            "Person Name, Title, Story, and a valid Target Amount (> 0) are required.",
        },
        { status: 400 }
      );
    }

    const status =
      body.status === "completed" || body.status === "paused"
        ? body.status
        : "active";

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("crowdfunding_campaigns")
      .insert({
        user_id: ctx.userId,
        person_name: personName,
        title,
        story,
        location: body.location?.trim() || null,
        target_amount: targetAmount,
        raised_amount: raisedAmount,
        status,
        upi_id: body.upiId?.trim() || null,
        contact_phone: body.contactPhone?.trim() || null,
        images: Array.isArray(body.images) ? body.images : [],
        video: body.video && body.video.src ? body.video : null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      campaign: mapRow(data as DbCrowdfundingRow),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create crowdfunding campaign",
      },
      { status: 500 }
    );
  }
}
