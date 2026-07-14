import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { apiError } from "@/lib/http";
import { consumeDemoLoginRateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!env.DEMO_INSTRUCTOR_PASSWORD) {
      return NextResponse.json({ error: "The test instructor is not configured yet." }, { status: 503 });
    }
    if (!await consumeDemoLoginRateLimit()) {
      return NextResponse.json({ error: "Too many demo sign-ins. Please wait a few minutes and try again." }, { status: 429 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: env.DEMO_INSTRUCTOR_EMAIL,
      password: env.DEMO_INSTRUCTOR_PASSWORD,
    });
    if (error || !data.user) {
      return NextResponse.json({ error: "The test instructor is temporarily unavailable." }, { status: 503 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active, role")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile?.is_active || profile.role !== "instructor") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "The test instructor is temporarily unavailable." }, { status: 503 });
    }

    return NextResponse.json({ ok: true, destination: "/dashboard" });
  } catch (error) {
    return apiError(error, "Unable to start the test session.");
  }
}
