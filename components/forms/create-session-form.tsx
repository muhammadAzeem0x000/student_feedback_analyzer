"use client";
import { useState } from "react";
import { CalendarPlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function CreateSessionForm({ courses }: { courses: { id: string; name: string; code: string }[] }) {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: form.get("courseId"), title: form.get("title"), description: form.get("description"), expectedResponses: form.get("expectedResponses") || undefined, minimumAnalysisResponses: form.get("minimumAnalysisResponses") }) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return toast.error(result.error ?? "Unable to create session.");
    toast.success("Feedback session created"); window.location.assign(`/dashboard/sessions/${result.id}`);
  }
  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Label htmlFor="session-course">Course</Label><select id="session-course" name="courseId" required className="focus-ring h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Choose a course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}</select></div><div className="sm:col-span-2"><Label htmlFor="session-title">Session title</Label><Input id="session-title" name="title" required placeholder="Unit Testing and Test Automation" /></div><div className="sm:col-span-2"><Label htmlFor="session-description">Description <span className="font-normal text-[#85918d]">(optional)</span></Label><Textarea id="session-description" name="description" placeholder="Lecture, lab, or activity context…" /></div><div><Label htmlFor="expected">Expected responses</Label><Input id="expected" name="expectedResponses" type="number" min="0" placeholder="20" /></div><div><Label htmlFor="minimum">Minimum for AI analysis</Label><Input id="minimum" name="minimumAnalysisResponses" type="number" min="1" defaultValue="3" required /></div><div className="sm:col-span-2"><Button disabled={loading || courses.length === 0}>{loading ? <LoaderCircle className="animate-spin" size={17}/> : <CalendarPlus size={17}/>}Create session</Button></div></form>;
}
