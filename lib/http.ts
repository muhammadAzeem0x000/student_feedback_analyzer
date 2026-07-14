import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ZodError) return NextResponse.json({ error: "Please check the highlighted fields.", details: error.flatten() }, { status: 422 });
  const message = error instanceof Error ? error.message : fallback;
  const safeMessages: Record<string, { message: string; status: number }> = {
    "Course not found.": { message, status: 404 },
    "Feedback session not found.": { message, status: 404 },
    "SUPABASE_SERVICE_ROLE_KEY is not configured.": { message: "Server configuration is incomplete.", status: 503 },
    "DEEPSEEK_API_KEY is not configured.": { message: "AI analysis is not configured yet.", status: 503 },
  };
  const safe = safeMessages[message];
  if (safe) return NextResponse.json({ error: safe.message }, { status: safe.status });
  console.error("Server operation failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export function requireJsonSize(request: Request, maximumBytes = 50_000) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maximumBytes) throw new Error("REQUEST_TOO_LARGE");
}
