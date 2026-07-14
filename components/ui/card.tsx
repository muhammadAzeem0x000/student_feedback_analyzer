import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border bg-[#fffdf8] shadow-[0_12px_40px_rgba(26,49,43,.06)]", className)} {...props} />;
}
