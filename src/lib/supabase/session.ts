import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";

export interface MemberProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  payment_completed: boolean;
  payment_reference: string | null;
  role: "admin" | "member";
  schemaReady: boolean;
}

export interface AuthSessionContext {
  userId: string;
  email: string;
  fullName: string;
  profile: MemberProfile;
}

/**
 * Resolves the verified Supabase Auth user, profile, and role (`admin` | `member`).
 * Automatically bootstraps ADMIN_EMAILS into `public.user_roles` safely server-side.
 */
export async function getAuthSessionContext(): Promise<AuthSessionContext | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = claimsData.claims.sub;
  const email = user?.email ?? (claimsData.claims.email as string | undefined) ?? "";
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
  const fallbackName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    email.split("@")[0] ||
    "Member";

  let role: "admin" | "member" =
    appMeta.role === "admin" || isAdminEmail(email) ? "admin" : "member";
  let schemaReady = true;

  try {
    const admin = createAdminClient();

    // Check role in user_roles (and promote app_metadata / ADMIN_EMAILS if configured)
    const { data: roleRow, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleError) {
      // Table missing or service_role grants not applied yet
      if (
        roleError.code === "42P01" ||
        roleError.code === "PGRST205" ||
        roleError.code === "42501"
      ) {
        schemaReady = false;
      }
    } else {
      if ((appMeta.role === "admin" || isAdminEmail(email)) && roleRow?.role !== "admin") {
        await admin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });
        role = "admin";
      } else if (roleRow?.role === "admin") {
        role = "admin";
      } else if (!roleRow) {
        await admin
          .from("user_roles")
          .upsert({ user_id: userId, role }, { onConflict: "user_id" });
      }
    }

    const { data: profileRow, error: profileError } = await admin
      .from("profiles")
      .select("id, email, full_name, phone, district, payment_completed, payment_reference")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      if (
        profileError.code === "42P01" ||
        profileError.code === "PGRST205" ||
        profileError.code === "42501"
      ) {
        schemaReady = false;
      }
    } else if (!profileRow) {
      // Backfill profile if trigger wasn't run before signup
      const { data: inserted } = await admin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name: fallbackName,
            phone: typeof meta.phone === "string" ? meta.phone : null,
            district: typeof meta.district === "string" ? meta.district : null,
          },
          { onConflict: "id" }
        )
        .select("id, email, full_name, phone, district, payment_completed, payment_reference")
        .maybeSingle();

      if (inserted) {
        return {
          userId,
          email,
          fullName: inserted.full_name || fallbackName,
          profile: {
            ...inserted,
            role,
            schemaReady,
          },
        };
      }
    } else {
      return {
        userId,
        email,
        fullName: profileRow.full_name || fallbackName,
        profile: {
          ...profileRow,
          role,
          schemaReady,
        },
      };
    }
  } catch {
    // Fallback cleanly if secret key is missing or DB isn't migrated yet
    schemaReady = false;
  }

  return {
    userId,
    email,
    fullName: fallbackName,
    profile: {
      id: userId,
      email,
      full_name: fallbackName,
      phone: typeof meta.phone === "string" ? meta.phone : null,
      district: typeof meta.district === "string" ? meta.district : null,
      payment_completed: false,
      payment_reference: null,
      role,
      schemaReady,
    },
  };
}
