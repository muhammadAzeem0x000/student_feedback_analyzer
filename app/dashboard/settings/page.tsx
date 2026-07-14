import { PageHeader } from "@/components/dashboard/app-shell";
import { ProfileForm } from "@/components/forms/profile-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage(){const{profile,user}=await requireUser();const supabase=await createClient();const{data:departments}=await supabase.from("departments").select("id,name").order("name");return <><PageHeader eyebrow="Account" title="Instructor profile" description="This information labels your private workspace; it is never shown on the anonymous student form."/><div className="grid gap-6 lg:grid-cols-[1fr_.7fr]"><Card className="p-6"><ProfileForm name={profile.full_name} departmentId={profile.department_id} departments={departments??[]}/></Card><Card className="h-fit p-6"><p className="text-sm font-semibold">Authentication email</p><p className="mt-2 text-sm text-[#71807a]">{user.email}</p><div className="mt-5 border-t pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[#84908c]">Role</p><p className="mt-1 text-sm font-semibold capitalize">{profile.role}</p></div></Card></div></>}
