import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { createClient } from "@/lib/supabase/server";
import { apiError, requireJsonSize } from "@/lib/http";

export async function POST(request: Request) {
  try {
    requireJsonSize(request, 10_000);
    const credentials = loginSchema.parse(await request.json());
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("is_active, role").eq("id", data.user.id).single();
    if (!profile?.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "This instructor account has been deactivated." }, { status: 403 });
    }
    return NextResponse.json({ ok: true, destination: profile.role === "admin" ? "/admin" : "/dashboard" });
  } catch (error) { return apiError(error, "Unable to sign in."); }
}
