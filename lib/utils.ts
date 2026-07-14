import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number | null | undefined) {
  return value == null ? "—" : `${value}%`;
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
