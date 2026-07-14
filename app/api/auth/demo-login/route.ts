import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { apiError } from "@/lib/http";
import { consumeDemoLoginRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!await consumeDemoLoginRateLimit()) {
      return NextResponse.json({ error: "Too many demo sign-ins. Please wait a few minutes and try again." }, { status: 429 });
    }

    const { data: link, error: linkError } = await createAdminClient().auth.admin.generateLink({
      type: "magiclink",
      email: env.DEMO_INSTRUCTOR_EMAIL,
    });
    if (linkError || !link.properties.hashed_token) {
      return NextResponse.json({ error: "The test instructor is temporarily unavailable." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.properties.hashed_token,
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
