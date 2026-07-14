import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/app-shell";
import { DepartmentForm } from "@/components/admin/admin-actions";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DepartmentsPage(){const supabase=await createClient();const{data}=await supabase.from("departments").select("id,name,profiles(id),courses(id)").order("name");return <><PageHeader eyebrow="Organization" title="Departments" description="Departments categorize instructors and courses without adding unnecessary academic hierarchy."/><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><Card className="h-fit p-5"><h2 className="mb-4 font-bold">Add department</h2><DepartmentForm/></Card><Card className="overflow-hidden">{data?.map(department=><div key={department.id} className="flex items-center justify-between border-b px-5 py-4 last:border-0"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e3f0eb] text-[#184f43]"><Building2 size={18}/></span><div><p className="font-semibold">{department.name}</p><p className="text-xs text-[#7c8984]">{department.profiles.length} instructors · {department.courses.length} courses</p></div></div></div>)}</Card></div></>}
