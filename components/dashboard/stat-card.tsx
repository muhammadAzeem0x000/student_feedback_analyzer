import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "green" }: { label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: "green" | "coral" | "blue" | "gold" }) {
  const tones = { green: "bg-[#e3f0eb] text-[#184f43]", coral: "bg-[#fbe6e1] text-[#b94a3c]", blue: "bg-[#e8ecf7] text-[#4e66a0]", gold: "bg-[#f7edd2] text-[#936e1d]" };
  return <Card className="p-5">
    <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-[#66756f]">{label}</p><p className="mt-2 text-3xl font-bold tracking-[-.04em]">{value}</p>{hint && <p className="mt-1 text-xs text-[#7d8985]">{hint}</p>}</div><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span></div>
  </Card>;
}
