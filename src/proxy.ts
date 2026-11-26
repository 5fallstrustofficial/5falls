import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run session refresh on portal/auth routes & API routes,
     * skipping static assets and public images/videos.
     */
    "/((?!_next/static|_next/image|favicon.ico|img/|video/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
