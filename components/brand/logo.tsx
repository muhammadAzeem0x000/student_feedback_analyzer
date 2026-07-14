import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-lg font-bold tracking-[-.03em] text-[#183f37]">
    <span className="grid size-9 place-items-center rounded-xl bg-[#184f43] text-white"><MessageSquareText size={19} /></span>
    {!compact && <span className="text-lg">SignalRoom</span>}
  </Link>;
}
