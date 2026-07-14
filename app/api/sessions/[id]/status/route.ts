import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireOwnedSession(id);
    const { status } = z.object({ status: z.enum(["open", "closed"]) }).parse(await request.json());
    const allowed = (session.status === "draft" && status === "open") || (session.status === "open" && status === "closed");
    if (!allowed) return NextResponse.json({ error: "That session status change is not allowed." }, { status: 409 });
    const supabase = await createClient();
    if (status === "open") {
      const [{ count: questions }, { count: codes }] = await Promise.all([
        supabase.from("feedback_questions").select("id", { count: "exact", head: true }).eq("session_id", id),
        supabase.from("response_codes").select("id", { count: "exact", head: true }).eq("session_id", id),
      ]);
      if (!questions || !codes) return NextResponse.json({ error: "Add at least one question and one response code before opening the session." }, { status: 409 });
    }
    const { error } = await supabase.from("feedback_sessions").update({ status, opens_at: status === "open" ? new Date().toISOString() : session.opens_at, closes_at: status === "closed" ? new Date().toISOString() : null }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to change the session status."); }
}
