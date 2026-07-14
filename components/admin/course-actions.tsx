"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Instructor = { id: string; name: string };

export function CourseAssignmentManager({ courseId, assigned, instructors }: { courseId: string; assigned: Instructor[]; instructors: Instructor[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const available = instructors.filter(instructor => !assigned.some(item => item.id === instructor.id));

  async function update(method: "POST" | "DELETE", instructorId: string) {
    setLoading(`${method}-${instructorId}`);
    const response = await fetch(`/api/courses/${courseId}/assignments`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instructorId }) });
    const result = await response.json();
    setLoading(null);
    if (!response.ok) return toast.error(result.error ?? "Unable to update assignment.");
    toast.success(method === "POST" ? "Instructor assigned" : "Assignment removed");
    setSelected("");
    router.refresh();
  }

  return <div className="mt-5 border-t pt-4">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#71807a]">Assigned instructors</p>
    <div className="mt-2 flex flex-wrap gap-2">{assigned.length ? assigned.map(instructor => <span key={instructor.id} className="inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-3 py-1.5 text-xs font-semibold text-[#184f43]">{instructor.name}<button type="button" aria-label={`Remove ${instructor.name}`} disabled={loading !== null} onClick={() => update("DELETE", instructor.id)} className="focus-ring rounded-full text-[#53756c] hover:text-red-700">{loading === `DELETE-${instructor.id}` ? <LoaderCircle className="animate-spin" size={13}/> : <X size={13}/>}</button></span>) : <span className="text-xs text-amber-700">Not assigned to an instructor</span>}</div>
    <div className="mt-3 flex gap-2"><select aria-label="Instructor to assign" value={selected} disabled={available.length === 0 || loading !== null} onChange={event => setSelected(event.target.value)} className="focus-ring h-10 min-w-0 flex-1 rounded-xl border bg-white px-3 text-sm disabled:bg-[#f1f2ee] disabled:text-[#84908c]"><option value="">{available.length ? "Choose instructor" : "All active instructors are assigned"}</option>{available.map(instructor => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}</select><Button type="button" size="sm" disabled={!selected || loading !== null} onClick={() => update("POST", selected)}>{loading?.startsWith("POST") ? <LoaderCircle className="animate-spin" size={15}/> : <UserPlus size={15}/>}Assign</Button></div>
  </div>;
}
