import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";

export async function PATCH(request:Request){try{const{profile}=await requireUser();const input=z.object({fullName:z.string().trim().min(2).max(120),departmentId:z.uuid().nullable()}).parse(await request.json());const supabase=await createClient();const{error}=await supabase.from("profiles").update({full_name:input.fullName,department_id:input.departmentId}).eq("id",profile.id);if(error)throw error;return NextResponse.json({ok:true});}catch(error){return apiError(error,"Unable to update the profile.")}}
