import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  open: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-amber-200 bg-amber-50 text-amber-800",
  analyzed: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

export function StatusBadge({ status }: { status: keyof typeof styles }) {
  return <Badge className={cn("capitalize", styles[status])}><span className="mr-1.5 size-1.5 rounded-full bg-current" />{status}</Badge>;
}
