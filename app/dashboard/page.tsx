import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CalendarRange, MessageSquareText, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";

type DashboardOverview = {
  courses: number;
  sessions: number;
  responses: number;
  analyses: number;
  recent_sessions: Array<{ id: string; title: string; status: "draft" | "open" | "closed" | "analyzed"; created_at: string; course_name: string; course_code: string }>;
};

const emptyOverview: DashboardOverview = { courses: 0, sessions: 0, responses: 0, analyses: 0, recent_sessions: [] };

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_dashboard_overview");
  const overview = (data ?? emptyOverview) as unknown as DashboardOverview;

  return <><PageHeader eyebrow="Instructor workspace" title={`Good to see you, ${profile.full_name.split(" ")[0]}`} description="A concise view of your courses, active feedback sessions, and recent teaching signals." action={<Link href="/dashboard/sessions/new" className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-[#184f43] px-4 text-sm font-semibold text-white"><Plus size={16}/>New session</Link>}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Courses" value={overview.courses} icon={BookOpen}/><StatCard label="Sessions" value={overview.sessions} icon={CalendarRange} tone="blue"/><StatCard label="Responses" value={overview.responses} icon={MessageSquareText} tone="coral"/><StatCard label="Analyses" value={overview.analyses} icon={BarChart3} tone="gold"/></div><Card className="mt-6 overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">Recent feedback sessions</h2><p className="mt-0.5 text-sm text-[#71807a]">Continue setup or review incoming feedback.</p></div><Link className="text-sm font-semibold text-[#267865]" href="/dashboard/sessions">View all</Link></div>{overview.recent_sessions.length ? <div className="divide-y">{overview.recent_sessions.map(session => <Link key={session.id} href={`/dashboard/sessions/${session.id}`} className="focus-ring flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7f8f4]"><div className="min-w-0"><p className="truncate font-semibold">{session.title}</p><p className="mt-1 text-xs text-[#788681]">{session.course_code} · {session.course_name}</p></div><div className="flex items-center gap-3"><StatusBadge status={session.status}/><ArrowRight className="text-[#8b9793]" size={17}/></div></Link>)}</div> : <div className="p-10 text-center text-sm text-[#71807a]">Create your first feedback session to begin.</div>}</Card></>;
}
