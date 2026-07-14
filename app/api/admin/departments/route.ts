import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name } = z.object({ name: z.string().trim().min(2).max(100) }).parse(await request.json());
    const supabase = await createClient();
    const { data, error } = await supabase.from("departments").insert({ name }).select("id").single();
    if (error?.code === "23505") return NextResponse.json({ error: "That department already exists." }, { status: 409 });
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return apiError(error, "Unable to create the department."); }
}
