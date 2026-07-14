import { NextResponse } from "next/server";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { reflectionSchema } from "@/lib/validation/schemas";
import { apiError, requireJsonSize } from "@/lib/http";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireJsonSize(request);
    const { id } = await params;
    const [session, { profile }] = await Promise.all([requireOwnedSession(id), requireUser()]);
    if (session.status === "draft" || session.status === "open") return NextResponse.json({ error: "Close the session before completing the reflection." }, { status: 409 });
    const input = reflectionSchema.parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase.from("instructor_reflections").upsert({
      session_id: id, instructor_id: profile.id, perceived_strengths: input.perceivedStrengths,
      perceived_challenges: input.perceivedChallenges, surprises: input.surprises, next_steps: input.nextSteps,
    }, { onConflict: "session_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to save the reflection."); }
}
