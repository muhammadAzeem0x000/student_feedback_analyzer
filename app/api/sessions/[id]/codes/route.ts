import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueCodes, hashResponseCode } from "@/lib/response-codes";
import { apiError, requireJsonSize } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireJsonSize(request);
    const { id } = await params;
    const session = await requireOwnedSession(id);
    if (session.status !== "draft") return NextResponse.json({ error: "Codes can only be generated while the session is a draft." }, { status: 409 });
    const { count } = z.object({ count: z.coerce.number().int().min(1).max(500) }).parse(await request.json());
    const codes = generateUniqueCodes(count);
    const supabase = await createClient();
    const { error } = await supabase.from("response_codes").insert(codes.map((code) => ({ session_id: id, code_hash: hashResponseCode(code) })));
    if (error) throw error;
    return NextResponse.json({ codes }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "Unable to generate response codes."); }
}
