import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/app-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id,name,code,description,departments(name),feedback_sessions(id)").order("code");
  return <>
    <PageHeader eyebrow="Assigned teaching" title="My courses" description="Only courses assigned to you by an administrator appear here. Use them to create and organize your feedback sessions." />
    <Card className="mb-6 flex items-start gap-3 border-[#cfe1da] bg-[#edf5f1] p-4"><ShieldCheck className="mt-0.5 shrink-0 text-[#267865]" size={19}/><div><p className="text-sm font-semibold text-[#184f43]">Admin-managed course catalog</p><p className="mt-1 text-sm leading-6 text-[#5e716a]">Contact an administrator if a course is missing or your teaching assignment changes.</p></div></Card>
    {courses?.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{courses.map(course => <Card key={course.id} className="p-5"><div className="flex items-start justify-between"><span className="rounded-lg bg-[#e3f0eb] px-2.5 py-1 font-mono text-xs font-bold text-[#184f43]">{course.code}</span><span className="text-xs text-[#84908c]">{course.feedback_sessions.length} sessions</span></div><h2 className="mt-5 text-xl font-bold">{course.name}</h2><p className="mt-1 text-xs font-medium text-[#7c8984]">{course.departments?.name ?? "No department"}</p><p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#71807a]">{course.description || "No description added."}</p><Link href={`/dashboard/sessions/new?course=${course.id}`} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#267865]">Create feedback session <ArrowRight size={15}/></Link></Card>)}</div> : <EmptyState icon={BookOpen} title="No courses assigned" description="An administrator must assign a course to your account before you can create a feedback session."/>}
  </>;
}
