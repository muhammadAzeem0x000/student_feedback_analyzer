import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, department_id")
    .eq("id", user.id)
    .single();

  return profile ? { user, profile } : null;
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
