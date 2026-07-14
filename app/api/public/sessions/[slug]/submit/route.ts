import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicSubmissionSchema } from "@/lib/validation/schemas";
import { hashResponseCode } from "@/lib/response-codes";
import { consumeSubmissionRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { apiError, requireJsonSize } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    requireJsonSize(request);
    const { slug } = await params;
    const input = publicSubmissionSchema.parse(await request.json());
    if (!await consumeSubmissionRateLimit()) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
    if (!await verifyTurnstile(input.turnstileToken)) return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 403 });
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_anonymous_feedback", {
      target_slug: slug, submitted_code_hash: hashResponseCode(input.code), submitted_answers: input.answers,
    });
    if (error) {
      if (error.message.includes("INVALID_OR_USED_CODE")) return NextResponse.json({ error: "The response code is invalid or has already been used." }, { status: 409 });
      if (error.message.includes("SESSION_NOT_OPEN")) return NextResponse.json({ error: "This feedback session is not accepting responses." }, { status: 409 });
      if (/INVALID_|MISSING_|UNKNOWN_|DUPLICATE_/.test(error.message)) return NextResponse.json({ error: "Please review your answers and try again." }, { status: 422 });
      throw error;
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return NextResponse.json({ error: "The submission is too large." }, { status: 413 });
    return apiError(error, "Unable to submit feedback.");
  }
}
