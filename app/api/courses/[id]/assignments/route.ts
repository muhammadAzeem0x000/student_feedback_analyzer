import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { apiError, requireJsonSize } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { courseAssignmentSchema } from "@/lib/validation/schemas";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    requireJsonSize(request);
    const { profile } = await requireAdmin();
    const { id: courseId } = await params;
    const { instructorId } = courseAssignmentSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: instructor } = await supabase.from("profiles").select("id").eq("id", instructorId).eq("role", "instructor").eq("is_active", true).maybeSingle();
    if (!instructor) return NextResponse.json({ error: "Choose an active instructor." }, { status: 404 });
    const { error } = await supabase.from("course_assignments").insert({ course_id: courseId, instructor_id: instructorId, assigned_by: profile.id });
    if (error?.code === "23505") return NextResponse.json({ error: "This instructor is already assigned." }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) { return apiError(error, "Unable to assign the course."); }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    requireJsonSize(request);
    await requireAdmin();
    const { id: courseId } = await params;
    const { instructorId } = courseAssignmentSchema.parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase.from("course_assignments").delete().eq("course_id", courseId).eq("instructor_id", instructorId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to remove the course assignment."); }
}
