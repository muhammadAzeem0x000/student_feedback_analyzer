import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { sessionSchema } from "@/lib/validation/schemas";
import { apiError, requireJsonSize } from "@/lib/http";

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

export async function POST(request: Request) {
  try {
    requireJsonSize(request);
    const { profile } = await requireUser();
    const input = sessionSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: assignment } = await supabase.from("course_assignments").select("course_id").eq("course_id", input.courseId).eq("instructor_id", profile.id).maybeSingle();
    if (!assignment) return NextResponse.json({ error: "This course is not assigned to your account." }, { status: 403 });
    const { data, error } = await supabase.from("feedback_sessions").insert({
      course_id: assignment.course_id, instructor_id: profile.id, title: input.title,
      description: input.description || null,
      expected_responses: input.expectedResponses ?? null,
      minimum_analysis_responses: input.minimumAnalysisResponses,
      slug: `${slugify(input.title)}-${nanoid(6).toLowerCase()}`,
    }).select("id").single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return apiError(error, "Unable to create the feedback session."); }
}
