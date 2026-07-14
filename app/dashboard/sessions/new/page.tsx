import { PageHeader } from "@/components/dashboard/app-shell";
import { CreateSessionForm } from "@/components/forms/create-session-form";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function NewSessionPage(){const supabase=await createClient();const{data:courses}=await supabase.from("courses").select("id,name,code").order("code");return <><PageHeader eyebrow="New feedback cycle" title="Create a feedback session" description="Choose one of your admin-assigned courses, then capture feedback for a lecture, lab, or learning activity."/><Card className="mx-auto max-w-3xl p-6"><CreateSessionForm courses={courses??[]}/>{!courses?.length&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">No courses are assigned to your account. Ask an administrator to assign one before creating a session.</p>}</Card></>}
