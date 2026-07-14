import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Navigation } from "@/components/dashboard/navigation";

export function AppShell({ children, profile }: { children: React.ReactNode; profile: { full_name: string; role: "instructor" | "admin" } }) {
  return <div className="min-h-screen bg-[#f3f1ea] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
    <a href="#main-content" className="focus-ring fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-[#184f43] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0">Skip to content</a>
    <aside className="sticky top-0 hidden h-dvh self-start overflow-y-auto border-r bg-[#fffdf8] lg:flex lg:flex-col">
      <div className="px-6 py-6"><Logo/></div>
      <div className="flex-1"><Navigation role={profile.role}/></div>
      <div className="border-t p-4"><div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f2f3ee] p-3"><span className="grid size-9 place-items-center rounded-full bg-[#184f43] text-sm font-bold text-white">{profile.full_name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.full_name}</p><p className="text-xs capitalize text-[#798681]">{profile.role}</p></div></div><form action="/auth/signout" method="post"><button className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6b7773] hover:bg-red-50 hover:text-red-700"><LogOut size={16}/>Sign out</button></form></div>
    </aside>
    <div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[#fffdf8]/95 px-4 shadow-[0_1px_12px_rgba(26,49,43,.05)] backdrop-blur lg:hidden"><Logo/><Navigation role={profile.role} mobile/></header><main id="main-content" tabIndex={-1} className="mx-auto max-w-[1500px] p-4 outline-none sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="text-xs font-bold uppercase tracking-[.16em] text-[#267865]">{eyebrow}</p>}<h1 className="mt-1 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697771]">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}
