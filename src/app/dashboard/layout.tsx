import React from "react";
import { redirect } from "next/navigation";
import { getAuthSessionContext } from "@/lib/supabase/session";
import AnnouncementsDashboard from "@/components/AnnouncementsDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthSessionContext();

  if (!ctx) {
    redirect("/login?next=/dashboard");
  }

  if (!ctx.profile.phone || !ctx.profile.district) {
    redirect("/onboarding");
  }

  return (
    <>
      <AnnouncementsDashboard initialProfile={ctx.profile} />
      <div className="hidden" aria-hidden="true">
        {children}
      </div>
    </>
  );
}
