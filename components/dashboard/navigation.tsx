"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarRange,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function NavigationPending({ mobile = false }: { mobile?: boolean }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "rounded-full bg-[#267865] transition-opacity",
        mobile ? "absolute right-1.5 top-1.5 size-1.5" : "ml-auto size-2",
        pending ? "animate-pulse opacity-100" : "opacity-0",
      )}
    />
  );
}

const instructorNav: NavigationEntry[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/sessions", label: "Sessions", icon: CalendarRange },
  { href: "/dashboard/settings", label: "Profile", icon: Settings },
];

const adminNav: NavigationEntry[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/instructors", label: "Instructors", icon: Users },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({
  entry,
  pathname,
  mobile,
}: {
  entry: NavigationEntry;
  pathname: string;
  mobile: boolean;
}) {
  const { href, label, icon: Icon } = entry;
  const active = isCurrent(pathname, href);

  return (
    <Link
      prefetch={true}
      aria-label={mobile ? label : undefined}
      aria-current={active ? "page" : undefined}
      href={href}
      className={cn(
        "focus-ring relative transition-colors",
        mobile
          ? "grid size-10 place-items-center rounded-xl"
          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
        active
          ? "bg-[#e3f0eb] text-[#184f43]"
          : "text-[#5a6964] hover:bg-[#edf2ed] hover:text-[#184f43]",
      )}
    >
      {!mobile && active ? (
        <span
          aria-hidden="true"
          className="absolute -left-3 h-6 w-1 rounded-r-full bg-[#267865]"
        />
      ) : null}
      <Icon size={mobile ? 19 : 18} />
      {mobile ? null : label}
      <NavigationPending mobile={mobile} />
    </Link>
  );
}

export function Navigation({ role, mobile = false }: { role: "instructor" | "admin"; mobile?: boolean }) {
  const pathname = usePathname();
  const nav = role === "admin" ? adminNav : instructorNav;

  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      className={mobile ? "flex items-center gap-1" : "space-y-1 px-3"}
    >
      {nav.map((entry) => (
        <NavigationLink
          key={entry.href}
          entry={entry}
          pathname={pathname}
          mobile={mobile}
        />
      ))}
    </nav>
  );
}
