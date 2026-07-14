import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.profile.id) return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 409 });
    const input = z.object({ isActive: z.boolean() }).parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ is_active: input.isActive }).eq("id", id).eq("role", "instructor");
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to update the instructor."); }
}
