import { NextResponse } from "next/server";
import { requireOwnedSession } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [session, { profile }] = await Promise.all([requireOwnedSession(id), requireUser()]);
    if (session.status === "analyzed") return NextResponse.json({ error: "Material cannot be replaced after analysis." }, { status: 409 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.type !== "application/pdf") return NextResponse.json({ error: "Choose a valid PDF file." }, { status: 422 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "The PDF must be 10 MB or smaller." }, { status: 413 });
    const supabase = await createClient();
    const path = `${profile.id}/${id}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage.from("session-materials").upload(path, file, { contentType: "application/pdf", upsert: false });
    if (uploadError) throw uploadError;
    const { error } = await supabase.from("feedback_sessions").update({ material_path: path, material_name: file.name, material_size: file.size }).eq("id", id);
    if (error) { await supabase.storage.from("session-materials").remove([path]); throw error; }
    if (session.material_path) await supabase.storage.from("session-materials").remove([session.material_path]);
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to upload the PDF."); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireOwnedSession(id);
    if (session.status === "analyzed") return NextResponse.json({ error: "Material cannot be deleted after analysis." }, { status: 409 });
    const supabase = await createClient();
    if (session.material_path) await supabase.storage.from("session-materials").remove([session.material_path]);
    const { error } = await supabase.from("feedback_sessions").update({ material_path: null, material_name: null, material_size: null }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error, "Unable to delete the PDF."); }
}
