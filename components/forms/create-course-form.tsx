"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

type Option = { id: string; name: string };

export function CreateCourseForm({ departments, instructors }: { departments: Option[]; instructors: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        code: form.get("code"),
        description: form.get("description"),
        departmentId: form.get("departmentId"),
        instructorIds: form.getAll("instructorIds"),
      }),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return toast.error(result.error ?? "Unable to create course.");
    toast.success("Course created and assigned");
    formElement.reset();
    router.refresh();
  }

  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <div><Label htmlFor="course-name">Course name</Label><Input id="course-name" name="name" required placeholder="Software Testing" /></div>
    <div><Label htmlFor="course-code">Course code</Label><Input id="course-code" name="code" required placeholder="SE-401" /></div>
    <div className="sm:col-span-2"><Label htmlFor="course-department">Department</Label><select id="course-department" name="departmentId" required className="focus-ring h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Choose a department</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div>
    <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">Assign instructors</legend><p className="mt-1 text-xs text-[#71807a]">Select at least one active instructor. More can be added later.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{instructors.map(instructor => <label key={instructor.id} className="flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-3 text-sm font-medium"><input type="checkbox" name="instructorIds" value={instructor.id} className="size-4 accent-[#184f43]" />{instructor.name}</label>)}</div></fieldset>
    <div className="sm:col-span-2"><Label htmlFor="course-description">Description <span className="font-normal text-[#85918d]">(optional)</span></Label><Textarea id="course-description" name="description" placeholder="What this course covers…" /></div>
    <div className="sm:col-span-2"><Button disabled={loading || departments.length === 0 || instructors.length === 0}>{loading ? <LoaderCircle className="animate-spin" size={17}/> : <Plus size={17}/>}Create and assign course</Button></div>
  </form>;
}
