import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { adminCourseSchema } from "@/lib/validation/schemas";
import { apiError, requireJsonSize } from "@/lib/http";

export async function POST(request: Request) {
  try {
    requireJsonSize(request);
    await requireAdmin();
    const input = adminCourseSchema.parse(await request.json());
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_course_with_assignments", {
      course_name: input.name,
      course_code: input.code,
      course_description: input.description || "",
      course_department_id: input.departmentId,
      target_instructor_ids: input.instructorIds,
    });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "A course with this code already exists." }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ id: data }, { status: 201 });
  } catch (error) { return apiError(error, "Unable to create the course."); }
}
