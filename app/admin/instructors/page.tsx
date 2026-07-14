import { ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/app-shell";
import { InstructorToggle } from "@/components/admin/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id,full_name,is_active,created_at,departments(name),course_assignments!course_assignments_instructor_id_fkey(course_id)").eq("role", "instructor").order("full_name");
  if (error) throw new Error("Unable to load instructors.");

  return <>
    <PageHeader eyebrow="Access control" title="Instructors" description="Activate or deactivate instructor access. Assign their approved courses from the Courses page."/>
    <Card className="mb-5 flex items-start gap-3 border-[#cfe1da] bg-[#edf5f1] p-4"><ShieldCheck className="mt-0.5 shrink-0 text-[#267865]" size={19}/><div><p className="text-sm font-semibold text-[#184f43]">Controlled account provisioning</p><p className="mt-1 text-sm leading-6 text-[#5e716a]">There is no public instructor signup. Create or invite the user through Supabase Auth; the account appears here inactive, then an administrator activates it and assigns approved courses. Students never need accounts.</p></div></Card>
    <Card className="overflow-hidden">{data?.length ? <div className="divide-y">{data.map(instructor => <div key={instructor.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#e8ece9] font-bold text-[#184f43]">{instructor.full_name[0]}</span><div><div className="flex items-center gap-2"><p className="font-semibold">{instructor.full_name}</p><Badge className={instructor.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>{instructor.is_active ? "Active" : "Inactive"}</Badge></div><p className="mt-1 text-xs text-[#7c8984]">{instructor.departments?.name ?? "No department"} · {instructor.course_assignments.length} assigned courses</p></div></div><InstructorToggle id={instructor.id} active={instructor.is_active}/></div>)}</div> : <div className="grid min-h-56 place-items-center text-center"><div><Users className="mx-auto text-[#8c9893]"/><p className="mt-3 text-sm text-[#71807a]">No instructor accounts yet.</p></div></div>}</Card>
  </>;
}
