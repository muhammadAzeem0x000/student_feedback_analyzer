import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" | "lg" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return <button ref={ref} className={cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-55",
    variant === "primary" && "bg-[#184f43] text-white shadow-[0_8px_20px_rgba(24,79,67,.18)] hover:bg-[#123f35]",
    variant === "secondary" && "border bg-white text-[#184f43] hover:bg-[#eef5f1]",
    variant === "danger" && "bg-[#b94a3c] text-white hover:bg-[#9d3d32]",
    variant === "ghost" && "text-[#42524d] hover:bg-black/5",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-11 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-base",
    className,
  )} {...props} />;
});
