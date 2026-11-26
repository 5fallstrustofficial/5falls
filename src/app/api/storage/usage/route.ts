import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSessionContext } from "@/lib/supabase/session";
import { STATIC_MEDIA_STATS } from "@/data/staticMediaStats";

async function calculateBucketBytes(
  admin: ReturnType<typeof createAdminClient>,
  bucketName: string,
  prefix = ""
): Promise<{ bytes: number; files: number }> {
  let bytes = 0;
  let files = 0;
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await admin.storage
      .from(bucketName)
      .list(prefix, { limit, offset });

    if (error || !data || data.length === 0) break;

    for (const entry of data) {
      // Folder entries in Supabase Storage have `id === null` and no `metadata.size`
      const size =
        entry.metadata && typeof entry.metadata.size === "number"
          ? entry.metadata.size
          : null;

      if (size !== null) {
        bytes += size;
        files += 1;
      } else if (entry.id === null && entry.name) {
        const subPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const sub = await calculateBucketBytes(admin, bucketName, subPath);
        bytes += sub.bytes;
        files += sub.files;
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return { bytes, files };
}

export async function GET() {
  const ctx = await getAuthSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const quotaMb = Number(process.env.SUPABASE_STORAGE_QUOTA_MB || 1024); // Free tier default: 1 GB (1024 MB)
    const quotaBytes = quotaMb * 1024 * 1024;

    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bucketStats = await Promise.all(
      (buckets ?? []).map(async (b) => {
        const stats = await calculateBucketBytes(admin, b.name);
        return {
          name: b.name,
          bytes: stats.bytes,
          files: stats.files,
        };
      })
    );

    const usedBytes = bucketStats.reduce((sum, b) => sum + b.bytes, 0);
    const fileCount = bucketStats.reduce((sum, b) => sum + b.files, 0);
    const remainingBytes = Math.max(0, quotaBytes - usedBytes);
    const percentUsed =
      quotaBytes > 0 ? Math.min(100, Number(((usedBytes / quotaBytes) * 100).toFixed(2))) : 0;

    return NextResponse.json({
      usedBytes,
      quotaBytes,
      remainingBytes,
      percentUsed,
      fileCount,
      buckets: bucketStats,
      staticMedia: STATIC_MEDIA_STATS,
      totalMediaBytes: usedBytes + STATIC_MEDIA_STATS.totalBytes,
      totalMediaFiles: fileCount + STATIC_MEDIA_STATS.totalFiles,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check storage usage" },
      { status: 500 }
    );
  }
}
