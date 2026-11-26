import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";

const BUCKET_NAME = "updates-media";

export async function POST(request: Request) {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can upload update media." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image or video files are supported." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Ensure public bucket exists cleanly
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
      await admin.storage.createBucket(BUCKET_NAME, { public: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || (isImage ? "webp" : "mp4");
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .slice(0, 40);
    const objectPath = `${isImage ? "photos" : "videos"}/${Date.now()}-${safeName || "media"}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await admin.storage
      .from(BUCKET_NAME)
      .upload(objectPath, arrayBuffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 400 });
    }

    const { data: publicUrlData } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      mediaType: isImage ? "image" : "video",
      name: file.name,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
