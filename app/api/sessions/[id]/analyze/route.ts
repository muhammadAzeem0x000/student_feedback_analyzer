import { NextResponse } from "next/server";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DeepSeekProvider, MockAIProvider } from "@/lib/ai/provider";
import { extractPdfText } from "@/lib/storage/pdf";
import { env } from "@/lib/env";
import { apiError } from "@/lib/http";

export const maxDuration = 120;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [session, { profile }] = await Promise.all([requireOwnedSession(id), requireUser()]);
    if (session.status !== "closed" && session.status !== "analyzed") return NextResponse.json({ error: "Close the session before generating analysis." }, { status: 409 });
    const supabase = await createClient();
    const [{ count }, questionsResult, reflectionResult, statsResult, responsesResult] = await Promise.all([
      supabase.from("feedback_responses").select("id", { count: "exact", head: true }).eq("session_id", id),
      supabase.from("feedback_questions").select("id, type, prompt, options, position").eq("session_id", id).order("position"),
      supabase.from("instructor_reflections").select("perceived_strengths, perceived_challenges, surprises, next_steps").eq("session_id", id).single(),
      supabase.rpc("get_session_statistics", { target_session_id: id }),
      supabase.from("feedback_responses").select("id").eq("session_id", id).limit(1000),
    ]);
    const responseCount = count ?? 0;
    if (responseCount < session.minimum_analysis_responses) return NextResponse.json({ error: `At least ${session.minimum_analysis_responses} responses are required for analysis.` }, { status: 409 });
    if (!questionsResult.data?.length) return NextResponse.json({ error: "Add at least one feedback question before analysis." }, { status: 409 });
    if (!reflectionResult.data) return NextResponse.json({ error: "Complete the instructor reflection before analysis." }, { status: 409 });

    const responseIds = responsesResult.data?.map((item) => item.id) ?? [];
    const { data: textAnswers } = responseIds.length
      ? await supabase.from("response_answers").select("text_value, feedback_questions(prompt)").in("response_id", responseIds).not("text_value", "is", null)
      : { data: [] };

    let materialText: string | undefined;
    if (session.material_path) {
      const { data: pdf, error } = await supabase.storage.from("session-materials").download(session.material_path);
      if (error) throw new Error("The private class material could not be read.");
      materialText = await extractPdfText(await pdf.arrayBuffer());
    }

    const provider = env.AI_PROVIDER_MODE === "mock" ? new MockAIProvider() : new DeepSeekProvider();
    const analysis = await provider.analyze({
      course: { name: session.courses?.name ?? "Course", code: session.courses?.code ?? "" },
      session: { title: session.title, description: session.description },
      responseCount,
      questions: questionsResult.data,
      statistics: statsResult.data,
      writtenResponses: textAnswers ?? [],
      reflection: reflectionResult.data,
      materialText,
    });

    const { data: saved, error: saveError } = await supabase.from("ai_analyses").insert({
      session_id: id, instructor_id: profile.id, model: env.DEEPSEEK_MODEL,
      prompt_version: "anonymous-course-feedback-v1", response_count: responseCount, result: analysis,
    }).select("id").single();
    if (saveError) throw saveError;
    const { error: statusError } = await supabase.from("feedback_sessions").update({ status: "analyzed" }).eq("id", id);
    if (statusError) throw statusError;
    return NextResponse.json({ id: saved.id }, { status: 201 });
  } catch (error) { return apiError(error, "AI analysis could not be generated. Please try again."); }
}
