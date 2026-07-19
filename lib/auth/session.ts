import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, department_id")
    .eq("id", claims.sub)
    .single();

  if (!profile) return null;

  return {
    user: {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
    },
    profile,
  };
});

export async function requireUser() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  if (!session.profile.is_active) redirect("/login?error=inactive");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") redirect("/dashboard");
  return session;
}
