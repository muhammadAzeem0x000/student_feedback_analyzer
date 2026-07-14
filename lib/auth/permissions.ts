import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export async function requireOwnedCourse(courseId: string) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("course_assignments").select("courses(*)").eq("course_id", courseId).eq("instructor_id", profile.id).single();
  if (!data) throw new Error("Course not found.");
  return data.courses;
}

export async function requireOwnedSession(sessionId: string) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("feedback_sessions")
    .select("*, courses(name, code)")
    .eq("id", sessionId)
    .eq("instructor_id", profile.id)
    .single();
  if (!data) throw new Error("Feedback session not found.");
  return data;
}
