import { BookOpen, Users } from "lucide-react";
import { CourseAssignmentManager } from "@/components/admin/course-actions";
import { PageHeader } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateCourseForm } from "@/components/forms/create-course-form";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const [coursesResult, departmentsResult, instructorsResult] = await Promise.all([
    supabase.from("courses").select("id,name,code,description,departments(name),feedback_sessions(id),course_assignments(instructor_id,profiles!course_assignments_instructor_id_fkey(id,full_name))").order("code"),
    supabase.from("departments").select("id,name").order("name"),
    supabase.from("profiles").select("id,full_name").eq("role", "instructor").eq("is_active", true).order("full_name"),
  ]);
  if (coursesResult.error) throw new Error("Unable to load courses and assignments.");
  if (departmentsResult.error) throw new Error("Unable to load departments.");
  if (instructorsResult.error) throw new Error("Unable to load active instructors.");
  const instructors = (instructorsResult.data ?? []).map(instructor => ({ id: instructor.id, name: instructor.full_name }));

  return <>
    <PageHeader eyebrow="Academic catalog" title="Courses and assignments" description="Create the approved course catalog and decide which active instructors can use each course for feedback sessions." />
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <Card className="h-fit p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e3f0eb] text-[#184f43]"><BookOpen size={18}/></span><div><h2 className="font-bold">Add a course</h2><p className="mt-1 text-sm text-[#71807a]">Courses are created by administrators and assigned before instructors can use them.</p></div></div><CreateCourseForm departments={(departmentsResult.data ?? []).map(department => ({ id: department.id, name: department.name }))} instructors={instructors}/>{(!departmentsResult.data?.length || !instructors.length) && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Add a department and ensure at least one instructor is active before creating a course.</p>}</Card>
      <div>{coursesResult.data?.length ? <div className="grid gap-4">{coursesResult.data.map(course => {
        const assigned = course.course_assignments.map(assignment => ({ id: assignment.instructor_id, name: assignment.profiles?.full_name ?? "Instructor" }));
        return <Card key={course.id} className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><span className="rounded-lg bg-[#e3f0eb] px-2.5 py-1 font-mono text-xs font-bold text-[#184f43]">{course.code}</span><h2 className="mt-4 text-xl font-bold">{course.name}</h2><p className="mt-1 text-xs text-[#7c8984]">{course.departments?.name ?? "No department"} · {course.feedback_sessions.length} feedback sessions</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#f0f1ed] px-3 py-1.5 text-xs font-semibold text-[#64736d]"><Users size={14}/>{assigned.length} assigned</span></div><p className="mt-3 text-sm leading-6 text-[#71807a]">{course.description || "No description added."}</p><CourseAssignmentManager courseId={course.id} assigned={assigned} instructors={instructors}/></Card>;
      })}</div> : <EmptyState icon={BookOpen} title="No courses in the catalog" description="Create the first course and assign it to an active instructor."/>}</div>
    </div>
  </>;
}
