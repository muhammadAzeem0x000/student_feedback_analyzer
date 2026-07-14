import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { hashResponseCode } from "@/lib/response-codes";

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const run = url && serviceKey ? describe : describe.skip;

run("atomic anonymous submission", () => {
  it("accepts exactly one of two concurrent submissions using one code", async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    const departmentId = crypto.randomUUID();
    const courseId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const questionId = crypto.randomUUID();
    const { data: createdUser, error: userError } = await admin.auth.admin.createUser({ email: `concurrency-${departmentId}@example.com`, password: "Testing-only-password-123", email_confirm: true, user_metadata: { full_name: "Test Instructor" } });
    if (userError || !createdUser.user) throw userError ?? new Error("Test user creation failed");
    const instructorId = createdUser.user.id;
    await admin.from("departments").insert({ id: departmentId, name: `Test ${departmentId}` });
    await admin.from("courses").insert({ id: courseId, department_id: departmentId, name: "Test Course", code: `T-${Date.now()}` });
    await admin.from("course_assignments").insert({ course_id: courseId, instructor_id: instructorId });
    await admin.from("feedback_sessions").insert({ id: sessionId, course_id: courseId, instructor_id: instructorId, title: "Concurrency", slug: `concurrency-${sessionId}`, status: "open" });
    await admin.from("feedback_questions").insert({ id: questionId, session_id: sessionId, type: "rating", prompt: "Was this clear?", is_required: true, position: 0 });
    await admin.from("response_codes").insert({ session_id: sessionId, code_hash: hashResponseCode("TEST-2345") });
    const payload = { target_slug: `concurrency-${sessionId}`, submitted_code_hash: hashResponseCode("TEST-2345"), submitted_answers: [{ question_id: questionId, rating_value: 5 }] };
    const results = await Promise.all([admin.rpc("submit_anonymous_feedback", payload), admin.rpc("submit_anonymous_feedback", payload)]);
    expect(results.filter(result => !result.error)).toHaveLength(1);
    const { count } = await admin.from("feedback_responses").select("id", { count: "exact", head: true }).eq("session_id", sessionId);
    expect(count).toBe(1);
    await admin.from("departments").delete().eq("id", departmentId);
    await admin.auth.admin.deleteUser(instructorId);
  }, 20_000);
});
