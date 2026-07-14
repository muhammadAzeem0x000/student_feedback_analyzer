import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { questionSchema } from "@/lib/validation/schemas";
import { apiError, requireJsonSize } from "@/lib/http";

const bodySchema = z.object({ questions: z.array(questionSchema).min(1).max(20) });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireJsonSize(request, 100_000);
    const { id } = await params;
    const session = await requireOwnedSession(id);
    const supabase = await createClient();
    const { count } = await supabase.from("feedback_responses").select("id", { count: "exact", head: true }).eq("session_id", id);
    if ((count ?? 0) > 0) return NextResponse.json({ error: "Questions cannot be changed after responses have been received." }, { status: 409 });
    if (session.status !== "draft" && session.status !== "open") return NextResponse.json({ error: "Questions can no longer be changed for this session." }, { status: 409 });
    const input = bodySchema.parse(await request.json());
    const { error: deleteError } = await supabase.from("feedback_questions").delete().eq("session_id", id);
    if (deleteError) throw deleteError;
    const { error } = await supabase.from("feedback_questions").insert(input.questions.map((question, position) => ({
      session_id: id, type: question.type, prompt: question.prompt, is_required: question.isRequired,
      position, options: question.type === "single_choice" ? question.options : null,
    })));
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to save the questions."); }
}
