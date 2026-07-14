import { BarChart3, BookOpen, CalendarRange, MessageSquareText, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type AdminOverview = { courses: number; sessions: number; responses: number; analyses: number };

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ data }, instructors] = await Promise.all([
    supabase.rpc("get_dashboard_overview"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "instructor"),
  ]);
  const overview = (data ?? { courses: 0, sessions: 0, responses: 0, analyses: 0 }) as unknown as AdminOverview;

  return <><PageHeader eyebrow="Platform administration" title="System overview" description="A simple operational view of instructors, assigned courses, and platform activity."/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Instructors" value={instructors.count ?? 0} icon={Users}/><StatCard label="Courses" value={overview.courses} icon={BookOpen} tone="blue"/><StatCard label="Sessions" value={overview.sessions} icon={CalendarRange} tone="gold"/><StatCard label="Responses" value={overview.responses} icon={MessageSquareText} tone="coral"/><StatCard label="Analyses" value={overview.analyses} icon={BarChart3}/></div><Card className="mt-6 p-6"><h2 className="font-bold">Administration boundaries</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#71807a]">Administrators manage departments, course catalog assignments, and instructor access. Feedback questions, anonymous responses, reflections, and AI analysis remain instructor-owned workflows.</p></Card></>;
}
