"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, CalendarRange, LayoutDashboard, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function NavigationPending({ mobile = false }: { mobile?: boolean }) {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className={cn("rounded-full bg-[#267865] transition-opacity", mobile ? "absolute right-1.5 top-1.5 size-1.5" : "ml-auto size-2", pending ? "animate-pulse opacity-100" : "opacity-0")} />;
}

const instructorNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/sessions", label: "Sessions", icon: CalendarRange },
  { href: "/dashboard/settings", label: "Profile", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/instructors", label: "Instructors", icon: Users },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation({ role, mobile = false }: { role: "instructor" | "admin"; mobile?: boolean }) {
  const pathname = usePathname();
  const nav = role === "admin" ? adminNav : instructorNav;

  if (mobile) return <nav aria-label="Mobile navigation" className="flex items-center gap-1">{nav.map(({ href, label, icon: Icon }) => {
    const active = isCurrent(pathname, href);
    return <Link aria-label={label} aria-current={active ? "page" : undefined} key={href} href={href} className={cn("focus-ring relative grid size-10 place-items-center rounded-xl transition-colors", active ? "bg-[#e3f0eb] text-[#184f43]" : "text-[#65736e] hover:bg-[#f0f2ed]")}><Icon size={19}/><NavigationPending mobile/></Link>;
  })}</nav>;

  return <nav aria-label="Primary navigation" className="space-y-1 px-3">{nav.map(({ href, label, icon: Icon }) => {
    const active = isCurrent(pathname, href);
    return <Link aria-current={active ? "page" : undefined} key={href} href={href} className={cn("focus-ring relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors", active ? "bg-[#e3f0eb] text-[#184f43]" : "text-[#5a6964] hover:bg-[#edf2ed] hover:text-[#184f43]")}>{active && <span aria-hidden="true" className="absolute -left-3 h-6 w-1 rounded-r-full bg-[#267865]"/>}<Icon size={18}/>{label}<NavigationPending/></Link>;
  })}</nav>;
}
