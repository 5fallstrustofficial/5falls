export interface StaticMediaStats {
  imageFiles: number;
  imageBytes: number;
  videoFiles: number;
  videoBytes: number;
  totalFiles: number;
  totalBytes: number;
}

/**
 * Exact byte footprint of bundled static media under `public/img` and `public/video`.
 * Kept as a static manifest so edge/Cloudflare Workers runtimes do not need `fs`.
 */
export const STATIC_MEDIA_STATS: StaticMediaStats = {
  imageFiles: 76,
  imageBytes: 11607176,
  videoFiles: 3,
  videoBytes: 24455759,
  totalFiles: 79,
  totalBytes: 36062935,
};
